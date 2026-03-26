from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io

app = FastAPI()

# ============================================
# CORS Configuration - Enable Frontend Access
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = pickle.load(open("sales_model.pkl", "rb"))

# Home route
@app.get("/")
def home():
    return {"message": "Sales Forecast API is running 🚀"}

# Prediction route
@app.post("/predict")
async def predict_sales(file: UploadFile = File(...)):

    contents = await file.read()

    data = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    last_year = data["Year"].max()
    next_year = last_year + 1

    future_data = []

    for month in range(1,13):
        future_data.append([next_year, month])

    future_df = pd.DataFrame(future_data, columns=["Year","Month"])

    predictions = model.predict(future_df)

    future_df["Predicted_Sales"] = predictions

    return future_df.to_dict(orient="records")
