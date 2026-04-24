import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ForecastProvider } from './context/ForecastContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <ForecastProvider>
        <App />
      </ForecastProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
