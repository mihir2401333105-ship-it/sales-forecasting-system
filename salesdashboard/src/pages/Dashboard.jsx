import React, { useEffect } from 'react';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Calendar, AlertCircle, ArrowRight, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForecast } from '../context/ForecastContext';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
};

const pct = (n) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(1)}%`);

// ─── KPI Card ─────────────────────────────────────────────────────────────
const KPI = ({ icon: Icon, label, value, sub, positive, bg }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex flex-col justify-between"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${bg}`}>
        <Icon className="w-6 h-6" />
      </div>
      {sub != null && (
        <div className={`flex items-center gap-1 text-sm font-bold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {sub}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-semibold mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</h3>
    </div>
  </motion.div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-4 min-w-[160px]">
      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 mb-1">
          <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-xs font-extrabold text-slate-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────
const EmptyState = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-[40px]">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
      <AlertCircle className="w-10 h-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">No data loaded yet</h3>
    <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">
      Upload a CSV file to train the model, then come back here to see your executive summary.
    </p>
    <button
      onClick={() => navigate('/data')}
      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 transition-all"
    >
      Upload Data <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    status, summary, modelMetrics,
    historical, predictions,
    syncFromServer
  } = useForecast();

  // On mount: if state is idle (page refresh), try to sync from server
  useEffect(() => {
    if (status === 'idle') syncFromServer();
  }, []); // eslint-disable-line

  const hasData = status === 'ready' && historical.length > 0;
  const isLoading = status === 'uploading';

  // ── Build combined chart data ─────────────────────────────────────────
  // Merge historical + predictions on a single timeline
  const chartData = React.useMemo(() => {
    const hist = (historical || []).map(h => ({
      name:       h.name,
      historical: h.sales,
      predicted:  null,
      upper:      null,
      lower:      null,
    }));
    const pred = (predictions || []).map(p => ({
      name:       p.name,
      historical: null,
      predicted:  p.predicted,
      upper:      p.upper,
      lower:      p.lower,
    }));
    return [...hist, ...pred];
  }, [historical, predictions]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Synchronising Engine…
        </p>
      </div>
    </div>
  );

  const firstName = localStorage.getItem('user_first_name') || 'Jane';
  const emailStr = localStorage.getItem('user_email') || 'jane.doe@company.com';

  if (!hasData) return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-500 mb-2">Welcome, {firstName}! 👋</h2>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Executive Summary</h1>
        <p className="text-slate-500 font-medium">Real-time performance metrics and AI-powered projections.</p>
      </div>
      <EmptyState navigate={navigate} />
    </div>
  );

  // ── KPI values ────────────────────────────────────────────────────────
  const totalHist  = summary?.total_historical_sales;
  const totalPred  = summary?.total_predicted_sales;
  const avgMonthly = summary?.avg_monthly_sales;
  const growthRate = summary?.growth_rate;
  const r2         = modelMetrics?.r2_score;
  const mae        = modelMetrics?.mae;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-500 mb-2">Welcome, {firstName}! 👋</h2>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Executive Summary</h1>
          <p className="text-slate-500 font-medium">
            Based on <span className="font-bold text-slate-700">{historical.length}</span> months of history
            · Predicting <span className="font-bold text-slate-700">{predictions.length}</span> months ahead
          </p>
        </div>
        <button
          onClick={() => navigate('/data')}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
        >
          <Calendar className="w-4 h-4 text-slate-400" /> Change Dataset
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          icon={DollarSign}
          label="Total Historical Sales"
          value={fmt(totalHist)}
          bg="bg-blue-50 text-blue-600"
        />
        <KPI
          icon={TrendingUp}
          label="Total Predicted Sales"
          value={fmt(totalPred)}
          sub={pct(growthRate)}
          positive={(growthRate || 0) >= 0}
          bg="bg-emerald-50 text-emerald-600"
        />
        <KPI
          icon={BarChart2}
          label="Avg Monthly Sales"
          value={fmt(avgMonthly)}
          bg="bg-amber-50 text-amber-600"
        />
        <KPI
          icon={Activity}
          label="Model Accuracy (R²)"
          value={r2 != null ? `${r2}%` : '—'}
          sub={mae != null ? `MAE: ${fmt(mae)}` : null}
          positive={true}
          bg="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Forecast</h3>
            <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase">
              Historical (solid) · Predicted (dashed)
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-600 inline-block rounded-full" /> Historical
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5 bg-emerald-500 border-dashed border-t-2 inline-block" /> Predicted
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false} tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                dy={10} interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical area */}
              <Area
                type="monotone" dataKey="historical" name="Historical"
                stroke="#2563eb" strokeWidth={3}
                fill="url(#gradHist)" fillOpacity={1}
                dot={false} connectNulls={false}
              />

              {/* Predicted dashed line */}
              <Line
                type="monotone" dataKey="predicted" name="Predicted"
                stroke="#10b981" strokeWidth={3} strokeDasharray="8 4"
                dot={false} connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Model Stats */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-6">Model Intelligence</h4>
          <div className="space-y-4">
            {[
              { label: 'R² Accuracy',        value: r2 != null ? `${r2}%` : '—',    color: 'bg-blue-500' },
              { label: 'Mean Absolute Error', value: mae != null ? fmt(mae) : '—',   color: 'bg-amber-500' },
              { label: 'Historical Months',  value: String(historical.length),       color: 'bg-emerald-500' },
              { label: 'Forecast Horizon',   value: `${predictions.length} months`,  color: 'bg-indigo-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${color}`} />
                  <span className="text-sm font-bold text-slate-700">{label}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data range */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-6">Data Summary</h4>
          <div className="space-y-4">
            {[
              { label: 'Data Start',       value: summary?.data_range?.start   || '—' },
              { label: 'Data End',         value: summary?.data_range?.end     || '—' },
              { label: 'Total Historical', value: fmt(totalHist) },
              { label: 'Total Predicted',  value: fmt(totalPred) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-sm font-semibold text-slate-500">{label}</span>
                <span className="text-sm font-extrabold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="p-3 bg-white/10 w-fit rounded-2xl mb-6">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold mb-2">Forecast Insight</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {growthRate != null
                ? `Model forecasts a ${growthRate >= 0 ? 'growth' : 'decline'} of ${Math.abs(growthRate).toFixed(1)}% over the next ${predictions.length} months compared to historical performance.`
                : 'AI model is ready. Navigate to the Forecasting Hub to run custom horizon predictions.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/forecasts')}
            className="relative z-10 w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm transition-all hover:bg-slate-100 flex items-center justify-center gap-2"
          >
            Open Forecasting Hub <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
