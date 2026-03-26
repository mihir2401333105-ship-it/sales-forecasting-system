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
      {/* Background Elements */}
      <div className="background-grid"></div>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="dashboard-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">📊</div>
              <h1>Sales Forecast AI</h1>
            </div>
            <p className="subtitle">Predict 2026 sales with machine learning precision</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Upload Section */}
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
                  {fileName ? '✓' : '⬆'}
                </div>
                <h2 className="upload-title">
                  {fileName ? `File: ${fileName}` : 'Upload Historical Sales Data'}
                </h2>
                <p className="upload-description">
                  {fileName
                    ? 'Ready to forecast! Click or drag another file to replace.'
                    : 'Drag your CSV file here or click to browse'}
                </p>
                <button
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Choose File'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
          </section>

          {/* Results Section */}
          {forecasts && (
            <>
              {/* Statistics Cards */}
              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Highest Month</div>
                  <div className="stat-value">
                    ${Math.round(stats.highest).toLocaleString()}
                  </div>
                  <div className="stat-month">
                    {monthNames[forecasts.findIndex((f) => f.Predicted_Sales === stats.highest)]}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Lowest Month</div>
                  <div className="stat-value">
                    ${Math.round(stats.lowest).toLocaleString()}
                  </div>
                  <div className="stat-month">
                    {monthNames[forecasts.findIndex((f) => f.Predicted_Sales === stats.lowest)]}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Average Sales</div>
                  <div className="stat-value">
                    ${parseFloat(stats.average).toLocaleString()}
                  </div>
                  <div className="stat-month">Monthly Average</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">
                    ${parseFloat(stats.total).toLocaleString()}
                  </div>
                  <div className="stat-month">Full Year 2026</div>
                </div>
              </section>

              {/* Charts Section */}
              <section className="charts-section">
                {/* Line Chart */}
                <div className="chart-container line-chart">
                  <h3 className="chart-title">Sales Forecast Trend</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3a3a" />
                      <XAxis dataKey="month" stroke="#00ff88" />
                      <YAxis stroke="#00ff88" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1919',
                          border: '1px solid #00ff88',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#00ff88' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#00ff88"
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="chart-container bar-chart">
                  <h3 className="chart-title">Monthly Breakdown</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3a3a" />
                      <XAxis dataKey="month" stroke="#00ff88" />
                      <YAxis stroke="#00ff88" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a1919',
                          border: '1px solid #00ff88',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#00ff88' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Bar dataKey="sales" fill="#00ff88" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Data Table */}
              <section className="table-section">
                <h3 className="table-title">Detailed Forecast Data</h3>
                <div className="table-wrapper">
                  <table className="forecast-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Predicted Sales</th>
                        <th>Growth vs Previous</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.map((forecast, index) => {
                        const prev = index > 0 ? forecasts[index - 1].Predicted_Sales : forecast.Predicted_Sales;
                        const growth = (((forecast.Predicted_Sales - prev) / prev) * 100).toFixed(1);
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
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
                  📥 Export Forecast as CSV
                </button>
              </section>
            </>
          )}

          {/* Empty State */}
          {!forecasts && !loading && (
            <section className="empty-state">
              <div className="empty-icon">🎯</div>
              <h2>Ready to forecast?</h2>
              <p>Upload your historical sales CSV to generate AI-powered predictions for 2026</p>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>Powered by FastAPI & Machine Learning</p>
        </footer>
      </div>
    </div>
  );
};

export default SalesForecastDashboard;
