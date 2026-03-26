from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io

app = FastAPI()

# ==================== CORS Configuration ====================
# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"  # Allow all origins for testing (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Load trained model ====================
try:
    model = pickle.load(open("sales_model.pkl", "rb"))
    print("✅ Model loaded successfully")
except FileNotFoundError:
    print("⚠️ Warning: sales_model.pkl not found. Train the model first.")
    model = None

# ==================== Home route ====================
@app.get("/")
def home():
    return {
        "message": "Sales Forecast API is running 🚀",
        "endpoints": {
            "home": "/",
            "predict": "/predict (POST)"
        },
        "usage": "Upload a CSV with 'Year' and 'Month' columns to get sales predictions"
    }

# ==================== Health check ====================
@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

# ==================== Prediction route ====================
@app.post("/predict")
async def predict_sales(file: UploadFile = File(...)):
    """
    Predict sales for the next 12 months (2026)
    
    Expected CSV format:
    Year,Month,Sales
    2023,1,5200
    2023,2,6100
    ...
    
    Returns:
    List of predictions with Year, Month, and Predicted_Sales
    """
    
    try:
        # Read uploaded CSV file
        contents = await file.read()
        data = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        
        # Validate CSV structure
        required_columns = ['Year', 'Month']
        if not all(col in data.columns for col in required_columns):
            return {
                "error": f"CSV must contain columns: {', '.join(required_columns)}",
                "received_columns": list(data.columns)
            }
        
        # Determine the year for predictions
        last_year = data["Year"].max()
        next_year = last_year + 1
        
        # Create future data (12 months for the next year)
        future_data = []
        for month in range(1, 13):
            future_data.append([next_year, month])
        
        # Create DataFrame for predictions
        future_df = pd.DataFrame(future_data, columns=["Year", "Month"])
        
        # Generate predictions
        predictions = model.predict(future_df)
        
        # Add predictions to DataFrame
        future_df["Predicted_Sales"] = predictions
        
        # Return as list of dictionaries
        return future_df.to_dict(orient="records")
    
    except Exception as e:
        return {"error": f"Failed to process file: {str(e)}"}

# ==================== Run the app ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
