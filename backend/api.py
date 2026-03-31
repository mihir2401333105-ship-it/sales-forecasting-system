from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io
import os
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

app = FastAPI(title="Sales Forecast API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# In-memory state  (persists for the lifetime of the server)
# ============================================================
STATE = {
    "model": None,          # trained sklearn model
    "historical": [],       # list of {name, date, sales} dicts
    "last_date": None,      # (year, month) tuple of last historical row
    "model_score": None,    # R² of the model on training data
    "mae": None,
    "total_historical_sales": 0,
    "avg_monthly_sales": 0,
    "filename": None,
    "uploaded_at": None,
    "rows": 0,
}


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def month_label(year: int, month: int) -> str:
    return datetime(year, month, 1).strftime("%b '%y")


def build_future_rows(start_year: int, start_month: int, n: int):
    rows = []
    y, m = start_year, start_month
    for _ in range(n):
        m += 1
        if m > 12:
            m = 1
            y += 1
        rows.append([y, m])
    return rows


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "online", "message": "Sales Forecast API v2 🚀"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": STATE["model"] is not None,
        "rows": STATE["rows"],
        "filename": STATE["filename"],
    }


@app.post("/process")
async def process_and_train(
    file: UploadFile = File(...),
    date_col: str = Form(...),
    sales_col: str = Form(...),
):
    """
    Accept any CSV. The frontend sends the actual column names for
    the date/sales columns so we don't need a fixed schema.

    The date column can be:
    - A full date string  (e.g. "2024-03-15")
    - A Year column only  → supply sales_col as a month column too (legacy)

    For maximum flexibility the frontend can also pass "Year" and "Month" as
    separate columns if the user picks them.  We handle both.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")

    if date_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{date_col}' not found in CSV.")
    if sales_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{sales_col}' not found in CSV.")

    # ------------------------------------------------------------------
    # Build a clean working dataframe with Year, Month, Sales
    # ------------------------------------------------------------------
    work = pd.DataFrame()
    work["Sales"] = pd.to_numeric(df[sales_col], errors="coerce")

    raw_col = df[date_col].astype(str).str.strip()

    # Check if the column is all 4-digit year numbers (e.g. 2023, 2024)
    year_only = pd.to_numeric(raw_col, errors="coerce")
    is_year_column = (
        year_only.notna().sum() >= len(df) * 0.8
        and year_only.dropna().between(1900, 2200).all()
        and year_only.dropna().astype(str).str.len().eq(4).all()
    )

    if is_year_column:
        # Pure year column — look for a companion Month column in the CSV
        work["Year"] = year_only
        month_candidates = [
            c for c in df.columns
            if c.lower() in ("month", "mo", "mon", "mth") and c != sales_col and c != date_col
        ]
        if month_candidates:
            work["Month"] = pd.to_numeric(df[month_candidates[0]], errors="coerce")
        else:
            work["Month"] = 1
    else:
        # Try full date string parsing (e.g. "2024-03-01", "Jan 2024", etc.)
        parsed_dates = pd.to_datetime(raw_col, errors="coerce")
        if parsed_dates.notna().sum() >= len(df) * 0.8:
            work["Year"]  = parsed_dates.dt.year
            work["Month"] = parsed_dates.dt.month
        else:
            # Last resort: treat as year number even if some fail
            work["Year"]  = year_only
            month_candidates = [
                c for c in df.columns
                if c.lower() in ("month", "mo", "mon", "mth") and c != sales_col and c != date_col
            ]
            work["Month"] = (
                pd.to_numeric(df[month_candidates[0]], errors="coerce")
                if month_candidates else 1
            )

    work.dropna(inplace=True)
    work = work.sort_values(["Year", "Month"]).reset_index(drop=True)

    if len(work) < 3:
        raise HTTPException(
            status_code=400,
            detail="Need at least 3 valid rows of data to train the model."
        )

    # ------------------------------------------------------------------
    # Train model
    # ------------------------------------------------------------------
    X = work[["Year", "Month"]]
    y = work["Sales"]

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)

    train_preds = model.predict(X)
    score = float(r2_score(y, train_preds))
    mae   = float(mean_absolute_error(y, train_preds))

    # ------------------------------------------------------------------
    # Build historical payload
    # ------------------------------------------------------------------
    historical = []
    for _, row in work.iterrows():
        historical.append({
            "name":  month_label(int(row["Year"]), int(row["Month"])),
            "date":  f"{int(row['Year'])}-{int(row['Month']):02d}",
            "sales": float(row["Sales"]),
        })

    last_year  = int(work.iloc[-1]["Year"])
    last_month = int(work.iloc[-1]["Month"])

    # ------------------------------------------------------------------
    # Persist state
    # ------------------------------------------------------------------
    STATE["model"]                  = model
    STATE["historical"]             = historical
    STATE["last_date"]              = (last_year, last_month)
    STATE["model_score"]            = round(score * 100, 1)
    STATE["mae"]                    = round(mae, 2)
    STATE["total_historical_sales"] = float(work["Sales"].sum())
    STATE["avg_monthly_sales"]      = float(work["Sales"].mean())
    STATE["filename"]               = file.filename
    STATE["uploaded_at"]            = datetime.now().strftime("%b %d, %Y")
    STATE["rows"]                   = len(work)

    # ------------------------------------------------------------------
    # Generate default 12-month forecast to return immediately
    # ------------------------------------------------------------------
    future_rows = build_future_rows(last_year, last_month, 12)
    future_df   = pd.DataFrame(future_rows, columns=["Year", "Month"])
    preds       = model.predict(future_df)

    predictions = []
    noise_pct   = 0.08  # confidence interval width
    for i, pred in enumerate(preds):
        noise = abs(pred) * noise_pct
        yr, mo = future_rows[i]
        predictions.append({
            "name":      month_label(yr, mo),
            "date":      f"{yr}-{mo:02d}",
            "predicted": round(float(pred), 2),
            "upper":     round(float(pred + noise), 2),
            "lower":     round(float(pred - noise), 2),
            "month":     mo,
            "year":      yr,
        })

    total_predicted = sum(p["predicted"] for p in predictions)

    # Growth rate vs last 12 months of historical
    hist_last_12 = work.tail(12)["Sales"].sum()
    growth_rate  = ((total_predicted - hist_last_12) / max(hist_last_12, 1)) * 100

    return {
        "success": True,
        "file_info": {
            "filename":    file.filename,
            "rows":        len(work),
            "uploaded_at": STATE["uploaded_at"],
        },
        "model_metrics": {
            "r2_score": STATE["model_score"],
            "mae":      STATE["mae"],
        },
        "summary": {
            "total_historical_sales": round(STATE["total_historical_sales"], 2),
            "avg_monthly_sales":      round(STATE["avg_monthly_sales"], 2),
            "total_predicted_sales":  round(total_predicted, 2),
            "growth_rate":            round(growth_rate, 1),
            "data_range": {
                "start": historical[0]["date"] if historical else None,
                "end":   historical[-1]["date"] if historical else None,
            }
        },
        "historical":   historical,
        "predictions":  predictions,
    }


@app.post("/predict")
async def predict(horizon_months: int = 12):
    """
    Re-run predictions on the already-trained model for a given horizon.
    Does NOT require re-uploading the file.
    """
    if STATE["model"] is None:
        raise HTTPException(
            status_code=400,
            detail="No model trained yet. Please upload a CSV file first."
        )

    last_year, last_month = STATE["last_date"]
    future_rows = build_future_rows(last_year, last_month, horizon_months)
    future_df   = pd.DataFrame(future_rows, columns=["Year", "Month"])
    preds       = STATE["model"].predict(future_df)

    results = []
    noise_pct = 0.08
    for i, pred in enumerate(preds):
        noise = abs(pred) * noise_pct
        yr, mo = future_rows[i]
        results.append({
            "name":      month_label(yr, mo),
            "date":      f"{yr}-{mo:02d}",
            "predicted": round(float(pred), 2),
            "upper":     round(float(pred + noise), 2),
            "lower":     round(float(pred - noise), 2),
            "month":     mo,
            "year":      yr,
        })

    total_predicted = sum(r["predicted"] for r in results)

    return {
        "horizon_months":       horizon_months,
        "predictions":          results,
        "total_predicted_sales": round(total_predicted, 2),
        "model_metrics": {
            "r2_score": STATE["model_score"],
            "mae":      STATE["mae"],
        },
    }


@app.get("/state")
def get_state():
    """Return all current server-side state (for the Dashboard to read on load)."""
    if STATE["model"] is None:
        return {"ready": False}

    return {
        "ready":       True,
        "file_info": {
            "filename":    STATE["filename"],
            "rows":        STATE["rows"],
            "uploaded_at": STATE["uploaded_at"],
        },
        "model_metrics": {
            "r2_score": STATE["model_score"],
            "mae":      STATE["mae"],
        },
        "summary": {
            "total_historical_sales": round(STATE["total_historical_sales"], 2),
            "avg_monthly_sales":      round(STATE["avg_monthly_sales"], 2),
        },
        "historical": STATE["historical"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
