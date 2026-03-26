# Sales Forecast Dashboard - Setup Guide

## Project Structure

```
your-project/
├── backend/
│   ├── api.py
│   ├── sales_model.pkl
│   ├── sales.csv
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── SalesForecastDashboard.jsx
    │   ├── styles/
    │   │   └── SalesForecastDashboard.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 📦 Backend Setup (FastAPI)

### 1. **Install Backend Dependencies**

```bash
pip install fastapi uvicorn pandas scikit-learn python-multipart python-cors
```

### 2. **Update `api.py` with CORS support**

Add CORS middleware to allow frontend requests:

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
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
    for month in range(1, 13):
        future_data.append([next_year, month])
    
    future_df = pd.DataFrame(future_data, columns=["Year", "Month"])
    predictions = model.predict(future_df)
    future_df["Predicted_Sales"] = predictions
    
    return future_df.to_dict(orient="records")
```

### 3. **Run the Backend**

```bash
uvicorn api:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

---

## 🎨 Frontend Setup (React + Vite)

### 1. **Create a React Project**

```bash
npm create vite@latest sales-forecast-dashboard -- --template react
cd sales-forecast-dashboard
npm install
```

### 2. **Install Required Dependencies**

```bash
npm install recharts
```

### 3. **File Structure**

Create the following structure in your React project:

```
src/
├── components/
│   └── SalesForecastDashboard.jsx
├── styles/
│   └── SalesForecastDashboard.css
├── App.jsx
├── main.jsx
└── App.css (leave empty or minimal)
```

### 4. **Copy Component Files**

- Copy `SalesForecastDashboard.jsx` to `src/components/`
- Copy `SalesForecastDashboard.css` to `src/styles/`

### 5. **Update `App.jsx`**

```jsx
import SalesForecastDashboard from './components/SalesForecastDashboard';
import './App.css';

function App() {
  return <SalesForecastDashboard />;
}

export default App;
```

### 6. **Update `main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 7. **Create `index.css`** (Global Styles)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background: #0a1919;
  color: #e0e0e0;
}

html, body, #root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
```

### 8. **Run the Frontend**

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## 🚀 Running Both Services

### **Terminal 1 - Backend**
```bash
cd backend
python -m uvicorn api:app --reload --port 8000
```

### **Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

---

## ✅ How to Use

1. **Start both backend and frontend servers** (see above)
2. **Open** `http://localhost:5173` in your browser
3. **Upload your `sales.csv`** file
4. **Wait for predictions** (processing takes ~2-3 seconds)
5. **View results:**
   - Statistics cards (highest, lowest, average, total)
   - Area chart (forecast trend)
   - Bar chart (monthly breakdown)
   - Detailed data table
6. **Export results** as CSV if needed

---

## 🎯 Key Features

✨ **Dark & Futuristic Theme**
- Neon green (#00ff88) and cyan accents
- Animated grid background
- Floating glow orbs
- Smooth transitions and micro-interactions

📊 **Interactive Visualizations**
- Area chart showing sales trend
- Bar chart for monthly breakdown
- Statistics cards with growth metrics
- Detailed data table with growth percentages

📁 **Smart File Handling**
- Drag & drop CSV upload
- File validation
- Loading states
- Error handling

💾 **Export Functionality**
- Download predictions as CSV
- Ready for further analysis

---

## 🔧 Customization

### Change API URL
In `SalesForecastDashboard.jsx`, update:
```javascript
const API_URL = 'http://your-api-url:8000';
```

### Modify Colors
In `SalesForecastDashboard.css`, edit CSS variables:
```css
:root {
  --primary-dark: #0a1919;
  --neon-green: #00ff88;
  --neon-cyan: #00d9ff;
  --neon-purple: #a100ff;
  /* etc... */
}
```

### Adjust Animations
Modify `@keyframes` sections in the CSS file for different animation speeds and effects.

---

## 📝 Environment Setup

### Backend Requirements (`requirements.txt`)

```
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
scikit-learn==1.3.2
python-multipart==0.0.6
python-cors==1.0.1
```

Install with:
```bash
pip install -r requirements.txt
```

---

## 🐛 Troubleshooting

### CORS Error
If you see a CORS error, ensure the FastAPI backend has `CORSMiddleware` configured with correct allowed origins.

### API Connection Failed
- Check if backend is running on `http://localhost:8000`
- Verify `API_URL` in `SalesForecastDashboard.jsx`
- Check browser console for detailed error messages

### Missing CSV Headers
Ensure your CSV has columns: `Year`, `Month`, `Sales`

### Model Not Found
Verify `sales_model.pkl` exists in the backend directory

---

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 🎨 Design Details

- **Font**: Orbitron (titles), Roboto (body)
- **Color Scheme**: Dark mode with neon accents
- **Animations**: Staggered fade-ins, floating effects, hover states
- **Layout**: CSS Grid with responsive breakpoints
- **Charts**: Recharts library with custom styling

---

## 📧 Support

For issues or questions, refer to:
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Recharts Documentation](https://recharts.org/)

Enjoy your Sales Forecast Dashboard! 🚀
