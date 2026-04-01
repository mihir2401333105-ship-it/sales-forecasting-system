import React, { useState } from 'react';
import {
  TrendingUp, Calendar, ChevronDown, Zap, Info,
  Play, Activity, ArrowRight, AlertCircle, Loader2
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useForecast } from '../context/ForecastContext';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const colorMap = {
    predicted: '#4f46e5',
    upper:     '#818cf8',
    lower:     '#818cf8',
  };
  const nameMap = {
    predicted: 'AI Forecast',
    upper:     'Upper Bound (CI)',
    lower:     'Lower Bound (CI)',
  };
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-5 min-w-[200px]">
      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-8 mb-1.5">
          <span className="flex items-center gap-2 text-xs font-bold" style={{ color: colorMap[p.dataKey] || p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colorMap[p.dataKey] || p.color }} />
            {nameMap[p.dataKey] || p.name}
          </span>
          <span className="text-xs font-extrabold text-slate-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-2xl font-extrabold tracking-tight ${color || 'text-slate-900'}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 font-semibold mt-1">{sub}</p>}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────
const EmptyState = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-[40px]">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
      <AlertCircle className="w-10 h-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">No model loaded</h3>
    <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">
      Upload a sales CSV on the Data Ingestion page to train the model first.
    </p>
    <button
      onClick={() => navigate('/data')}
      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 transition-all"
    >
      Upload Data <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// ─── ForecastingHub ───────────────────────────────────────────────────────
const ForecastingHub = () => {
  const navigate = useNavigate();
  const { status, predictions, modelMetrics, summary, runPredictions, saveReport } = useForecast();

  const [horizon, setHorizon] = useState('12');
  const [localError, setLocalError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isLoading   = status === 'uploading';
  const hasData     = status === 'ready' && predictions.length > 0;
  const noModel     = status === 'idle';

  // Current predictions being displayed
  const displayPredictions = predictions;

  const totalPredicted = displayPredictions.reduce((sum, p) => sum + p.predicted, 0);
  const maxPred   = Math.max(...displayPredictions.map(p => p.upper  || p.predicted), 0);
  const minPred   = Math.min(...displayPredictions.map(p => p.lower  || p.predicted), Infinity);
  const avgPred   = displayPredictions.length > 0 ? totalPredicted / displayPredictions.length : 0;

  const handleRun = async () => {
    setLocalError(null);
    setSaved(false);
    const result = await runPredictions(parseInt(horizon, 10));
    if (!result.success) setLocalError(result.error || 'Prediction failed.');
  };

  const handleSaveReport = async () => {
    if (!hasData) return;
    setIsSaving(true);
    const success = await saveReport({
      name: `Demand Forecast - Next ${horizon} Months`,
      type: 'Forecast',
      size: `${(Math.random() * (3 - 0.5) + 0.5).toFixed(1)} MB`, 
      details: {
        totalPredicted,
        avgPred,
        maxPred,
        horizon,
        predictions,
        modelMetrics,
        summary
      }
    });
    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setLocalError('Failed to archive the report. Server might be down.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Forecasting Hub</h1>
          <p className="text-slate-500 font-medium">Generate high-precision predictions with confidence intervals.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs uppercase font-extrabold tracking-widest border border-indigo-100">
          <Zap className="w-4 h-4" /> RandomForest Model
        </div>
      </div>

      {/* No model guard */}
      {noModel && <EmptyState navigate={navigate} />}

      {!noModel && (
        <>
          {/* Control Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Horizon */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Forecast Horizon
              </label>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-all" />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 shadow-sm appearance-none transition-all hover:shadow-md disabled:opacity-50"
                  value={horizon}
                  disabled={isLoading}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setHorizon(val);
                    setSaved(false);
                    if (!noModel) {
                      setLocalError(null);
                      const result = await runPredictions(parseInt(val, 10));
                      if (!result.success) setLocalError(result.error || 'Prediction failed.');
                    }
                  }}
                >
                  <option value="3">Next 3 Months</option>
                  <option value="6">Next 6 Months</option>
                  <option value="12">Next 12 Months</option>
                  <option value="18">Next 18 Months</option>
                  <option value="24">Next 24 Months</option>
                </select>
              </div>
            </div>

            {/* Calendar range info */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Starting From
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <div className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold text-slate-500 flex items-center">
                  {summary?.data_range?.end
                    ? `After ${summary.data_range.end}`
                    : 'End of historical data'}
                </div>
              </div>
            </div>

            {/* Run button */}
            <div className="flex items-end">
              <button
                onClick={handleRun}
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 text-white rounded-[20px] text-sm font-extrabold shadow-xl shadow-indigo-600/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
              >
                {isLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                  : <><Play className="w-4 h-4 fill-white" /> Run Predictions</>
                }
              </button>
            </div>
          </div>

          {localError && (
            <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" /> {localError}
            </div>
          )}

          {/* Stat Row */}
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard label="Total Forecast" value={fmt(totalPredicted)} color="text-indigo-600" />
              <StatCard label="Avg Monthly"    value={fmt(avgPred)} />
              <StatCard label="Peak Forecast"  value={fmt(maxPred)}  sub="Upper confidence" color="text-emerald-600" />
              <StatCard label="Model R²"       value={modelMetrics?.r2_score != null ? `${modelMetrics.r2_score}%` : '—'} sub={`MAE: ${fmt(modelMetrics?.mae)}`} />
            </motion.div>
          )}

          {/* Main Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Demand Forecast Analysis</h3>
                  <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-indigo-600 inline-block rounded-full" /> AI Prediction
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-3 bg-indigo-100 border border-indigo-200 inline-block rounded-sm opacity-70" /> 95% Confidence Interval
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-[460px]">
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Computing Predictions…
                      </p>
                    </div>
                  </div>
                ) : hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={displayPredictions}>
                      <defs>
                        <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0.04} />
                        </linearGradient>
                        <linearGradient id="gradFore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.08} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        dy={12} interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        width={64}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {/* Upper confidence bound — filled area */}
                      <Area
                        type="monotone" dataKey="upper" name="upper"
                        stroke="#818cf8" strokeWidth={1} strokeDasharray="3 3"
                        fill="url(#gradConf)" fillOpacity={1}
                        dot={false} legendType="none"
                      />
                      {/* Lower confidence bound — baseline of shaded area */}
                      <Area
                        type="monotone" dataKey="lower" name="lower"
                        stroke="#818cf8" strokeWidth={1} strokeDasharray="3 3"
                        fill="#ffffff" fillOpacity={1}
                        dot={false} legendType="none"
                      />
                      {/* Main prediction line */}
                      <Line
                        type="monotone" dataKey="predicted" name="predicted"
                        stroke="#4f46e5" strokeWidth={3.5}
                        dot={{ fill: '#4f46e5', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1200}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                      Run predictions to see the chart
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Optimization Alert */}
              <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group cursor-pointer hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[70px] opacity-40 -translate-y-1/2 translate-x-1/2" />
                <h4 className="text-lg font-bold mb-3 relative z-10">Forecast Summary</h4>
                <p className="text-slate-400 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                  {hasData
                    ? `Over ${horizon} months, total predicted revenue is ${fmt(totalPredicted)}, averaging ${fmt(avgPred)} per month.`
                    : 'Select a horizon and click Run to generate a forecast.'}
                </p>
                <div
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-widest relative z-10 hover:text-white transition-colors"
                >
                  <span>View Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Model Quality */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Model Quality</h4>
                  <Info className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <h5 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                    {modelMetrics?.r2_score ?? '—'}
                    {modelMetrics?.r2_score != null && <span className="text-xl text-indigo-600">%</span>}
                  </h5>
                  <div className="text-xs font-bold text-emerald-500 mb-1 uppercase tracking-wider">R² Score</div>
                </div>
                <p className="text-slate-500 text-sm font-semibold mb-6 leading-snug">
                  {modelMetrics?.r2_score >= 90
                    ? 'Excellent fit — highly reliable predictions.'
                    : modelMetrics?.r2_score >= 70
                    ? 'Good fit — predictions are reasonably accurate.'
                    : 'Model trained. More historical data improves accuracy.'}
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-10 bg-indigo-500 rounded-full" />
                  <div className="text-xs uppercase tracking-widest font-extrabold text-slate-400">
                    MAE: <span className="text-slate-900">{fmt(modelMetrics?.mae)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Predicted Data Table */}
          {hasData && (
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm mt-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-extrabold text-slate-900">Predicted Data Overview</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hidden sm:inline-block">
                    Data from {summary?.data_range?.end ? `after ${summary.data_range.end}` : 'end of historical data'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSaveReport}
                    disabled={isSaving || saved}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                      saved ? <span className="text-emerald-400">Archived!</span> : 'Generate Report'}
                  </button>
                  <button onClick={() => navigate('/reports')} className="text-xs font-extrabold text-blue-600 uppercase tracking-widest hover:underline transition-all">
                    View Archive
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[440px] overflow-y-auto relative rounded-3xl border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="sticky top-0 bg-slate-50 shadow-sm z-20">
                    <tr className="border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50">Period</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right bg-slate-50">Predicted Sales</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right bg-slate-50">Lower Bound</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right bg-slate-50">Upper Bound</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayPredictions.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-slate-900">{row.name}</td>
                        <td className="py-4 px-6 text-sm font-extrabold text-blue-600 text-right">{fmt(row.predicted)}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-red-500 text-right">{fmt(row.lower)}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-green-500 text-right">{fmt(row.upper)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 sticky bottom-0 border-t border-slate-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] z-20">
                    <tr className="border-b border-slate-100/50">
                      <td className="py-4 px-6 text-xs font-extrabold text-slate-600 uppercase tracking-widest">Total</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-blue-600 text-right">{fmt(totalPredicted)}</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                    </tr>
                    <tr className="border-b border-slate-100/50">
                      <td className="py-4 px-6 text-xs font-extrabold text-slate-600 uppercase tracking-widest">Avg Monthly</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-blue-600 text-right">{fmt(avgPred)}</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-xs font-extrabold text-slate-600 uppercase tracking-widest">Peak Forecast</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-blue-600 text-right">{fmt(maxPred)}</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-400 text-right">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ForecastingHub;
