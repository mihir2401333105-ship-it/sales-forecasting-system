import React, { useState, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './SalesForecastDashboard.css';

const SalesForecastDashboard = () => {
  const [forecasts, setForecasts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const API_URL = 'http://localhost:8000'; // Change to your FastAPI URL

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setForecasts(data);
      setError(null);
    } catch (err) {
      setError(`Failed to process forecast: ${err.message}`);
      setForecasts(null);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = forecasts
    ? forecasts.map((item) => ({
        month: monthNames[item.Month - 1],
        sales: Math.round(item.Predicted_Sales),
        fullMonth: item.Month,
      }))
    : [];

  const stats = forecasts
    ? {
        highest: Math.max(...forecasts.map((f) => f.Predicted_Sales)),
        lowest: Math.min(...forecasts.map((f) => f.Predicted_Sales)),
        average: (forecasts.reduce((sum, f) => sum + f.Predicted_Sales, 0) / forecasts.length).toFixed(0),
        total: forecasts.reduce((sum, f) => sum + f.Predicted_Sales, 0).toFixed(0),
      }
    : null;

  return (
    <div className="dashboard">
      <div className="background-grid"></div>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="dashboard-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="logo" onClick={() => window.location.reload()}>
            <div className="logo-icon">S</div>
            <h1>SalesForecast.ai</h1>
          </div>
          <div className="nav-actions">
            <button className="btn-secondary">Learn More</button>
            <button className="btn-primary">Launch Dashboard</button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="header">
          <h2>Predict the Future of Your Sales</h2>
          <p className="subtitle">
            Unleash the power of AI to forecast your 2026 performance with unprecedented accuracy. 
            All powered by advanced machine learning.
          </p>
        </header>

        {/* Main Upload Content */}
        {!forecasts && (
          <section className="upload-section">
            <div
              className={`upload-area ${dragActive ? 'active' : ''} ${fileName ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="file-input"
              />

              <div className="upload-content">
                <div className="upload-icon">
                  {fileName ? '✓' : '📈'}
                </div>
                <h3 className="upload-title">
                  {fileName ? `File: ${fileName}` : 'Upload Sales Data'}
                </h3>
                <p className="upload-description">
                  {fileName
                    ? 'Processing complete. Ready to visualize.'
                    : 'Drag your historical sales CSV here or click to browse'}
                </p>
                <button
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? 'Analyzing Data...' : 'Get Started'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
          </section>
        )}

        {/* Results Section (Premium Dark Style) */}
        {forecasts && (
          <div className="results-container">
             <div className="header" style={{textAlign: 'left', margin: '0 0 60px 0'}}>
                <h2 style={{fontSize: '48px', color: 'white'}}>2026 Projections</h2>
                <p className="subtitle" style={{margin: '12px 0 0 0'}}>Detailed analysis based on {fileName || 'your data'}</p>
             </div>

            {/* Statistics Cards */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Highest Month</div>
                <div className="stat-value">
                  ${Math.round(stats.highest).toLocaleString()}
                </div>
                <div className="stat-month">
                  Peak: {monthNames[forecasts.findIndex((f) => f.Predicted_Sales === stats.highest)]}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Lowest Month</div>
                <div className="stat-value">
                  ${Math.round(stats.lowest).toLocaleString()}
                </div>
                <div className="stat-month">
                  Trough: {monthNames[forecasts.findIndex((f) => f.Predicted_Sales === stats.lowest)]}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Average Sales</div>
                <div className="stat-value">
                  ${parseFloat(stats.average).toLocaleString()}
                </div>
                <div className="stat-month">Monthly Average</div>
              </div>

              <div className="stat-card" style={{background: 'rgba(0, 102, 255, 0.1)'}}>
                <div className="stat-label" style={{color: '#0088ff'}}>Total Revenue</div>
                <div className="stat-value">
                  ${parseFloat(stats.total).toLocaleString()}
                </div>
                <div className="stat-month" style={{color: 'rgba(255,255,255,0.6)'}}>Full Year 2026</div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="charts-section">
              <div className="chart-container line-chart">
                <h3 className="chart-title">Forecast Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f36',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        color: '#fff'
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#0066ff"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container bar-chart">
                <h3 className="chart-title">Monthly Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f36',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        color: '#fff'
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="#0066ff" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Data Table */}
            <section className="table-section">
              <h3 className="table-title">Full Breakdown</h3>
              <div className="table-wrapper">
                <table className="forecast-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Predicted Revenue</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.map((forecast, index) => {
                      const prev = index > 0 ? forecasts[index - 1].Predicted_Sales : forecast.Predicted_Sales;
                      const growth = (((forecast.Predicted_Sales - prev) / prev) * 100).toFixed(1);
                      return (
                        <tr key={index}>
                          <td>
                            <span className="month-badge">{monthNames[forecast.Month - 1]}</span>
                          </td>
                          <td className="sales-value">
                            ${Math.round(forecast.Predicted_Sales).toLocaleString()}
                          </td>
                          <td className={`growth ${growth > 0 ? 'positive' : 'negative'}`}>
                            {growth > 0 ? '+' : ''}{growth}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Export Section */}
            <section className="export-section">
              <button
                className="export-button"
                onClick={() => {
                  const csv = ['Month,Predicted_Sales'];
                  forecasts.forEach((f) => {
                    csv.push(`${f.Month},${f.Predicted_Sales}`);
                  });
                  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sales_forecast_2026.csv';
                  a.click();
                }}
              >
                📥 Export CSV Report
              </button>
              <button className="btn-primary" style={{marginLeft: '16px'}} onClick={() => setForecasts(null)}>
                New Forecast
              </button>
            </section>
          </div>
        )}

        {/* Footer Section (Consistent with the image's professional look) */}
        <footer className="footer">
          <div className="footer-brand">
            <h3>Forecast.ai</h3>
            <p>Advanced sales predictions powered by enterprise-grade machine learning algorithms.</p>
          </div>
          <div className="footer-col">
            <h4>Application</h4>
            <ul>
               <li><a href="#">Dashboard</a></li>
               <li><a href="#">Predictions</a></li>
               <li><a href="#">Historical Data</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Technology</h4>
            <ul>
               <li><a href="#">FastAPI</a></li>
               <li><a href="#">React 18</a></li>
               <li><a href="#">Scikit-Learn</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
               <li><a href="#">Documentation</a></li>
               <li><a href="#">Support</a></li>
               <li><a href="#">GitHub</a></li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SalesForecastDashboard;

