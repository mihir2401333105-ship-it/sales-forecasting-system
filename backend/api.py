from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io
import os
import numpy as np
from datetime import datetime

app = FastAPI()

# ============================================
# CORS Configuration - Enable Frontend Access
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model if it exists
MODEL_PATH = "sales_model.pkl"
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = pickle.load(open(MODEL_PATH, "rb"))
except Exception as e:
    print(f"Error loading model: {e}")

# In-memory storage for recently processed data (mimicking a database)
processed_files = []

@app.get("/")
def home():
    return {"status": "online", "message": "Enterprise Sales Forecast API is running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
        
        # Validate columns
        required_columns = {"Year", "Month", "Sales"}
        if not required_columns.issubset(df.columns):
            # Try to infer if columns are present but differently named
            col_map = {col.lower(): col for col in df.columns}
            if 'year' in col_map and 'month' in col_map and 'sales' in col_map:
                df = df.rename(columns={col_map['year']: 'Year', col_map['month']: 'Month', col_map['sales']: 'Sales'})
            else:
                raise HTTPException(status_code=400, detail=f"Missing required columns: {required_columns}")

        # Store basic file metadata
        file_info = {
            "id": len(processed_files) + 1,
            "filename": file.filename,
            "size": f"{len(content)/1024:.1f} KB",
            "date": datetime.now().strftime("%b %d, %Y"),
            "status": "processed",
            "rows": len(df)
        }
        processed_files.append(file_info)

        # Basic summary stats for the dashboard
        summary = {
            "total_sales": float(df['Sales'].sum()),
            "avg_monthly_sales": float(df['Sales'].mean()),
            "latest_month": int(df.iloc[-1]['Month']),
            "latest_year": int(df.iloc[-1]['Year']),
            "growth_rate": "+12.4%" # Mocked growth rate for demo purposes
        }

        return {"file_info": file_info, "summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
def get_files():
    return processed_files

@app.post("/predict")
async def predict_sales(horizon_months: int = 12):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please train the model first.")
    
    # Normally we'd take the last known date from the database
    # Here, we'll assume a starting point of Jan 2026 for the demo
    start_year = 2026
    
    future_data = []
    for i in range(horizon_months):
        month = (i % 12) + 1
        year = start_year + (i // 12)
        future_data.append([year, month])

    future_df = pd.DataFrame(future_data, columns=["Year","Month"])
    predictions = model.predict(future_df)
    
    # Add a small random variance for "Upper/Lower" bounds (Confidence Intervals)
    # in a real app, this would come from standard errors or probabilistic forecasting
    results = []
    for i, pred in enumerate(predictions):
        month_name = datetime(2026, ((i % 12) + 1), 1).strftime("%b")
        noise = pred * 0.05
        results.append({
            "name": f"{month_name} '{str(future_data[i][0])[2:]}",
            "predicted": float(pred),
            "upper": float(pred + noise),
            "lower": float(pred - noise),
            "month": future_data[i][1],
            "year": future_data[i][0]
        })

    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
