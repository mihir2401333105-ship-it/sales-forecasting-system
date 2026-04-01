/**
 * ForecastContext — The Brain
 * ─────────────────────────────────────────────────────────────────────────────
 * A single React Context that holds ALL application state.
 * Every page subscribes here; no page fetches independently for shared data.
 *
 *  State shape:
 *  {
 *    status:        'idle' | 'uploading' | 'ready' | 'error'
 *    fileInfo:      { filename, rows, uploaded_at }
 *    summary:       { total_historical_sales, avg_monthly_sales,
 *                     total_predicted_sales, growth_rate, data_range }
 *    modelMetrics:  { r2_score, mae }
 *    historical:    [{ name, date, sales }]
 *    predictions:   [{ name, date, predicted, upper, lower, month, year }]
 *    error:         string | null
 *  }
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const API = 'http://localhost:8000';

// ─── Default empty state ───────────────────────────────────────────────────
const EMPTY = {
  status:       'idle',
  fileInfo:     null,
  summary:      null,
  modelMetrics: null,
  historical:   [],
  predictions:  [],
  error:        null,
};

const ForecastContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────
export function ForecastProvider({ children }) {
  const [state, setState] = useState(EMPTY);

  // ── Helper to merge partial state ───────────────────────────────────────
  const patch = (partial) => setState((prev) => ({ ...prev, ...partial }));

  // ── Upload + train ───────────────────────────────────────────────────────
  const processFile = useCallback(async (file, dateCol, salesCol) => {
    patch({ status: 'uploading', error: null });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date_col', dateCol);
    formData.append('sales_col', salesCol);

    try {
      const res = await fetch(`${API}/process`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        patch({ status: 'error', error: json.detail || 'Upload failed.' });
        return { success: false, error: json.detail };
      }

      patch({
        status:       'ready',
        fileInfo:     json.file_info,
        summary:      json.summary,
        modelMetrics: json.model_metrics,
        historical:   json.historical,
        predictions:  json.predictions,
        error:        null,
      });

      return { success: true };
    } catch (err) {
      const msg = 'Cannot reach backend. Is the server running?';
      patch({ status: 'error', error: msg });
      return { success: false, error: msg };
    }
  }, []);

  // ── Re-run predictions for a different horizon ───────────────────────────
  const runPredictions = useCallback(async (horizonMonths) => {
    patch({ status: 'uploading', error: null });

    try {
      const res = await fetch(`${API}/predict?horizon_months=${horizonMonths}`, {
        method: 'POST',
      });

      const json = await res.json();

      if (!res.ok) {
        patch({ status: 'ready', error: json.detail || 'Prediction failed.' });
        return { success: false, error: json.detail };
      }

      // Use functional setState to avoid stale closure on summary
      setState((prev) => ({
        ...prev,
        status:       'ready',
        predictions:  json.predictions,
        modelMetrics: json.model_metrics,
        summary: prev.summary
          ? { ...prev.summary, total_predicted_sales: json.total_predicted_sales }
          : null,
        error: null,
      }));

      return { success: true, predictions: json.predictions };
    } catch (err) {
      patch({ status: 'ready', error: 'Cannot reach backend.' });
      return { success: false };
    }
  }, []);

  // ── Sync with server state on app load ──────────────────────────────────
  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch(`${API}/state`);
      const json = await res.json();

      if (json.ready) {
        // We have a trained model on the server — fetch default predictions too
        const predRes = await fetch(`${API}/predict?horizon_months=12`, {
          method: 'POST',
        });
        const predJson = await predRes.json();

        patch({
          status:       'ready',
          fileInfo:     json.file_info,
          summary: {
            ...json.summary,
            total_predicted_sales: predJson.total_predicted_sales,
            growth_rate: null,
          },
          modelMetrics: json.model_metrics,
          historical:   json.historical,
          predictions:  predJson.predictions,
          error:        null,
        });
      }
    } catch (_) {
      // silent — server may not be up yet
    }
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => setState(EMPTY), []);

  // ── Archive/Save Report ──────────────────────────────────────────────────
  const saveReport = useCallback(async (reportData) => {
    try {
      const res = await fetch(`${API}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Failed to save report', err);
      return false;
    }
  }, []);

  const value = {
    ...state,
    processFile,
    runPredictions,
    syncFromServer,
    reset,
    saveReport,
  };

  return (
    <ForecastContext.Provider value={value}>
      {children}
    </ForecastContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useForecast() {
  const ctx = useContext(ForecastContext);
  if (!ctx) throw new Error('useForecast must be used inside <ForecastProvider>');
  return ctx;
}
