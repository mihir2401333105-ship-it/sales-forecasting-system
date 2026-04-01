from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io
import os
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

from pydantic import BaseModel
import jwt
import bcrypt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Neuroforecast API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enforce HTTPS Only in production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

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
    "reports": [],          # Archive of generated reports
    "users": {              # Users DB containing hashed passwords
        "nirjachorghe@gmail.com": {
            "id": "user_0",
            "email": "nirjachorghe@gmail.com",
            "firstName": "Nirja",
            "lastName": "Chorghe",
            "role": "ADMINISTRATOR",
            "password_hash": bcrypt.hashpw(b"password123", bcrypt.gensalt()),
            "createdAt": "2026-04-02T00:00:00Z"
        }
    }
}

# ============================================================
# Security configurations
# ============================================================
SECRET_KEY = "neuroforecast_secure_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    confirmPassword: str
    firstName: str
    lastName: str
    organization: str = ""
    agreeToTerms: bool

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginRequest):
    user = STATE["users"].get(login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not bcrypt.checkpw(login_data.password.encode("utf-8"), user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": login_data.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/signup")
@limiter.limit("5/minute")
async def signup(request: Request, signup_data: SignupRequest):
    if signup_data.email in STATE["users"]:
        return {
            "success": False,
            "error": "Email already exists"
        }
    
    # Validation
    if not signup_data.agreeToTerms:
        return {"success": False, "error": "You must agree to Terms of Service to continue"}
    
    if signup_data.password != signup_data.confirmPassword:
         return {"success": False, "error": "Passwords don't match"}
         
    user_id = f"user_{len(STATE['users']) + 1}"
    new_user = {
        "id": user_id,
        "email": signup_data.email,
        "firstName": signup_data.firstName,
        "lastName": signup_data.lastName,
        "organization": signup_data.organization,
        "role": "USER",
        "password_hash": bcrypt.hashpw(signup_data.password.encode("utf-8"), bcrypt.gensalt()),
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    
    STATE["users"][signup_data.email] = new_user
    access_token = create_access_token(data={"sub": signup_data.email})
    
    # Strip hash from response
    user_resp = new_user.copy()
    user_resp.pop("password_hash")
    
    return {
        "success": True,
        "message": "Account created successfully",
        "user": user_resp,
        "sessionToken": access_token,
        "expiresIn": 86400
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
    return {"status": "online", "message": "Neuroforecast API v2 🚀"}


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


@app.post("/reports")
async def save_report(request: Request):
    """Save a forecast report to the archive."""
    data = await request.json()
    
    report_id = len(STATE["reports"]) + 1
    # Create the report object
    report = {
        "id": report_id,
        "name": data.get("name", f"Forecast Report #{report_id}"),
        "type": data.get("type", "Forecast"),
        "date": datetime.now().strftime("%b %d, %Y"),
        "status": "ready",
        "size": data.get("size", "1.2 MB"),
        "details": data.get("details", {})
    }
    
    STATE["reports"].append(report)
    # Sort descending by ID to show newest first
    return {"success": True, "report": report}

@app.get("/reports")
async def get_reports():
    """Get all saved reports."""
    return {"reports": list(reversed(STATE["reports"]))}

@app.delete("/reports/{report_id}")
async def delete_report(report_id: int):
    """Delete a specific report."""
    reports = STATE["reports"]
    for i, r in enumerate(reports):
        if r["id"] == report_id:
            del reports[i]
            return {"success": True}
    raise HTTPException(status_code=404, detail="Report not found")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
