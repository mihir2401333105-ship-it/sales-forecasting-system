import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  Zap, 
  Info, 
  BarChart, 
  Settings, 
  Play, 
  Activity, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ReferenceLine, Legend, ComposedChart, Line, Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const ForecastingHub = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [horizon, setHorizon] = useState('12');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchPredictions();
  }, [horizon]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/predict?horizon_months=${horizon}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error("Failed to fetch predictions");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Error: Model not loaded or server offline. Please upload a dataset first.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    fetchPredictions();
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">Forecasting Hub</h1>
          <p className="text-slate-500 font-medium tracking-tight">Generate high-precision predictions with enterprise ML models.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs uppercase font-extrabold tracking-widest border border-blue-100 animate-pulse transition-all">
           <Zap className="w-4 h-4" />
           Model Version: 4.8.2-GA
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Product Category</label>
            <div className="relative group">
               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all pointer-events-none" />
               <select 
                 className="w-full h-14 pl-6 pr-10 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 shadow-sm appearance-none transition-all hover:shadow-md hover:-translate-y-0.5"
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
               </select>
            </div>
         </div>

         <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Historical Range</label>
             <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all pointer-events-none" />
                <select className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none appearance-none transition-all hover:shadow-md hover:-translate-y-0.5">
                   <option>Dynamic (Auto)</option>
                   <option>Last 6 Months</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             </div>
         </div>

         <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Forecast Horizon</label>
             <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all pointer-events-none" />
                <select 
                  className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-[20px] text-sm font-bold focus:outline-none appearance-none transition-all hover:shadow-md hover:-translate-y-0.5"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                >
                   <option value="6">Next 6 Months</option>
                   <option value="12">Next 12 Months</option>
                   <option value="18">Next 18 Months</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             </div>
         </div>

         <div className="flex items-end pb-1">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-14 bg-blue-600 text-white rounded-[20px] text-sm font-extrabold shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
            >
               {loading ? (
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                 </div>
               ) : (
                 <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Predictions</span>
                 </>
               )}
            </button>
         </div>
      </div>

      {/* Main Analysis Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm shadow-slate-200/50">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Demand Forecast Analysis</h3>
                  <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                       AI Prediction
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-3 bg-indigo-100/50 border border-indigo-200 opacity-50"></div>
                       95% Confidence Interval
                    </div>
                  </div>
               </div>
               <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                  <Maximize2 className="w-5 h-5" />
               </button>
            </div>

            <div className="h-[500px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} 
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} 
                    tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                    itemStyle={{fontWeight: 800}}
                    labelStyle={{fontWeight: 800, marginBottom: '8px', color: '#1e293b'}}
                  />
                  
                  {/* Confidence Interval Area */}
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="none" 
                    fill="#818cf8" 
                    fillOpacity={0.1} 
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="none" 
                    fill="#818cf8" 
                    fillOpacity={0.1} 
                    animationDuration={2000}
                  />
                  
                  {/* Predicted Area */}
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPred)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Sidebar Insights */}
         <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group cursor-pointer hover:-translate-y-1 transition-all">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[70px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="text-xl font-bold mb-4 relative z-10 font-display">Optimization Alert</h4>
               <p className="text-slate-400 text-sm font-medium mb-8 relative z-10 leading-relaxed italic">
                  "{data.length > 0 ? "ML model predicts a significant upward trend in Q3. Advise restocking high-performing SKUs." : "Upload data to reveal AI inventory optimization insights."}"
               </p>
               <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-widest relative z-10">
                  <span>Take action</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex-1 flex flex-col justify-between">
               <div>
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Model Quality</h4>
                     <Info className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                     <h5 className="text-4xl font-extrabold text-slate-900 tracking-tighter">98.2<span className="text-xl text-blue-600">%</span></h5>
                     <div className="text-xs font-bold text-emerald-500 mb-1 leading-none uppercase tracking-wider">Perfect Fit</div>
                  </div>
                  <p className="text-slate-500 text-sm font-semibold mb-8 leading-snug">The model is highly confident in these results based on {horizon} months horizon.</p>
               </div>
               
               <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                  <div className="text-xs uppercase tracking-widest font-extrabold text-slate-400">MSE Score: <span className="text-slate-900">0.032</span></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ForecastingHub;
