import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, Legend, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart2, 
  Users, 
  ArrowUpRight, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const KPI = ({ icon: Icon, label, value, trend, trendValue, color }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex flex-col justify-between"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {trendValue}
      </div>
    </div>
    
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-semibold mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [forecastData, setForecastData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch latest predictions
      const predRes = await fetch('http://localhost:8000/predict?horizon_months=6', { method: 'POST' });
      if (predRes.ok) {
        const predData = await predRes.json();
        setForecastData(predData);
      }

      // Fetch file history to get summary if available
      const filesRes = await fetch('http://localhost:8000/files');
      if (filesRes.ok) {
        const files = await filesRes.json();
        if (files.length > 0) {
          // For this demo, we'll just use the latest file's summary if we had a summary endpoint
          // But our upload endpoint returns summary. In a real app, we'd persist this.
          // Let's mock a summary based on if files exist.
          setSummary({
            total_sales: "$124.5k",
            growth: "+14.2%",
            projected: "$156.2k",
            aov: "$342.10",
            customers: "1,248"
          });
        }
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Executive Summary</h1>
          <p className="text-slate-500 font-medium">Real-time performance metrics and AI-powered projections.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
             <Calendar className="w-4 h-4 text-slate-400" />
             Last 6 Months
          </button>
          <button 
            onClick={fetchDashboardData}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5"
          >
             Refresh Data
          </button>
        </div>
      </div>

      {/* Scorecards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI 
          icon={DollarSign} 
          label="Total Sales (MTD)" 
          value={summary?.total_sales || "$0.00"} 
          trend="up" 
          trendValue={summary?.growth || "0%"} 
          color="bg-blue-600"
        />
        <KPI 
          icon={TrendingUp} 
          label="Projected Revenue" 
          value={summary?.projected || "$0.00"} 
          trend="up" 
          trendValue="+8.5%" 
          color="bg-emerald-600"
        />
        <KPI 
          icon={BarChart2} 
          label="Avg Order Value" 
          value={summary?.aov || "$0.00"} 
          trend="down" 
          trendValue="-2.3%" 
          color="bg-amber-600"
        />
        <KPI 
          icon={Users} 
          label="Active Customers" 
          value={summary?.customers || "0"} 
          trend="up" 
          trendValue="+24.1%" 
          color="bg-indigo-600"
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Forecast</h3>
            <p className="text-sm text-slate-400 font-semibold tracking-wide uppercase">Core Intelligence</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span> AI Prediction
             </div>
          </div>
        </div>
        
        <div className="h-[400px]">
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#2563eb', strokeWidth: 2}}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active models detected. Upload data to initialize.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-6">Market Insight Snapshot</h4>
             <div className="space-y-6">
                {[
                  { name: 'Electronics', growth: '+24%', amount: '$42,500', color: 'bg-blue-600' },
                  { name: 'Personal Care', growth: '+18%', amount: '$28,200', color: 'bg-indigo-600' },
                  { name: 'Home Office', growth: '+12%', amount: '$19,800', color: 'bg-emerald-600' },
                  { name: 'Furniture', growth: '-4%', amount: '$12,400', color: 'bg-amber-600' },
                ].map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${cat.color}`}></div>
                        <div>
                           <p className="font-bold text-slate-900 leading-none mb-1">{cat.name}</p>
                           <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Market Share: {(Math.random() * 30 + 10).toFixed(0)}%</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-slate-900 leading-none mb-1">{cat.amount}</p>
                        <p className={`text-xs font-bold ${cat.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{cat.growth}</p>
                     </div>
                  </div>
                ))}
             </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
               <div className="p-3 bg-white bg-opacity-10 w-fit rounded-2xl mb-6">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
               </div>
               <h4 className="text-xl font-bold mb-2">AI Insights</h4>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {forecastData.length > 0 ? 
                    "Based on predicted trends, Electronics demand will likely surge by 12% in the coming quarter. Stock optimization is recommended." :
                    "Upload historical data to unlock AI-driven inventory optimization and demand insights for your business."
                  }
               </p>
            </div>
            
            <button className="relative z-10 w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm transition-all hover:bg-slate-100">
               View Strategy Guide
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
