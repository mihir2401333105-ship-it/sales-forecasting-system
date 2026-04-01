import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Download, Search, Filter, ChevronDown, MoreHorizontal, 
  SortAsc, FileText, Clock, Printer, FileDown, ArrowLeft, Trash2, 
  ArrowRight, Share2, Check, Activity, PlusCircle, CheckSquare, Square, FileInput
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-5 min-w-[200px]">
      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-8 mb-1.5">
          <span className="flex items-center gap-2 text-xs font-bold" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-xs font-extrabold text-slate-900">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const Reports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [viewState, setViewState] = useState('list'); // 'list' | 'detail' | 'compare'
  const [activeReport, setActiveReport] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modals
  const [showShare, setShowShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const reportRef = useRef();
  const compareRef = useRef();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`http://localhost:8000/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id)); // Remove from selection if it was there
        if (activeReport?.id === id) setViewState('list');
      }
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  const toggleSelection = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadPDF = async (refTarget, namePrefix) => {
    if (!refTarget.current) return;
    
    const element = refTarget.current;
    element.classList.add('pdf-export-mode');
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const cleanName = namePrefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF. Check console.');
    } finally {
      element.classList.remove('pdf-export-mode');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://neuroforecast.ai/reports/share/${activeReport.id}`);
    setCopiedLink(true);
    setTimeout(() => { setCopiedLink(false); setShowShare(false); }, 2000);
  };

  // ─── RENDERERS ────────────────────────────────────────────────────────────

  const renderList = () => {
    const filteredReports = reports.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
      <div className="space-y-10 font-sans animate-in fade-in">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">Reports & Archive</h1>
            <p className="text-slate-500 font-medium tracking-tight">Access historical analysis and generate exports for stakeholders.</p>
          </div>
          <div className="flex gap-4">
            {selectedIds.length >= 2 && (
              <button 
                onClick={() => setViewState('compare')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl text-sm font-extrabold shadow-sm hover:bg-indigo-100 transition-all font-sans"
              >
                <FileInput className="w-4 h-4" />
                Compare {selectedIds.length} Reports
              </button>
            )}
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-slate-700">
                <Download className="w-4 h-4" />
                Batch Download 
             </button>
             <button 
               onClick={() => navigate('/hub')}
               className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
             >
                Create New
             </button>
          </div>
        </div>

        {/* Filtering & Search Bar */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
           <div className="relative w-full md:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-blue-600 transition-all" />
              <input 
                type="text" 
                placeholder="Search reports by name..."
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* Main Reports Table */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Archived Analysis</h3>
            {selectedIds.length > 0 && (
              <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-full">{selectedIds.length} selected</span>
            )}
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                      <th className="py-6 px-10 w-16"></th>
                      <th className="py-6 px-10">Report Identification</th>
                      <th className="py-6 px-10">Classification</th>
                      <th className="py-6 px-10">Generation Date</th>
                      <th className="py-6 px-10 text-right pr-14">Action</th>
                   </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-bold">Loading reports...</td></tr>
                  ) : reports.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-bold">No reports generated yet. Go to Forecasting Hub to generate one.</td></tr>
                  ) : (
                    filteredReports.map((report) => {
                      const isSelected = selectedIds.includes(report.id);
                      return (
                        <tr 
                          key={report.id} 
                          onClick={() => { setActiveReport(report); setViewState('detail'); }}
                          className={`border-t border-slate-50 hover:bg-slate-50/50 transition-all group cursor-pointer ${isSelected ? 'bg-indigo-50/30' : ''}`}
                        >
                           <td className="py-7 px-10 text-center" onClick={(e) => toggleSelection(e, report.id)}>
                             {isSelected ? (
                               <CheckSquare className="w-5 h-5 text-indigo-600" />
                             ) : (
                               <Square className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                             )}
                           </td>
                           <td className="py-7 px-10">
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold drop-shadow-sm group-hover:scale-110 transition-transform ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <FileText className="w-7 h-7" />
                                 </div>
                                 <div>
                                    <p className="font-extrabold text-slate-900 text-lg mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{report.name}</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{report.size} • JSON FORMAT</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-7 px-10">
                              <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                                 {report.type}
                              </span>
                           </td>
                           <td className="py-7 px-10 font-bold text-slate-500">{report.date}</td>
                           <td className="py-7 px-10 text-right pr-14">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                 <button onClick={(e) => { e.stopPropagation(); setActiveReport(report); setTimeout(() => handleDownloadPDF(reportRef, report.name), 100); }} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-200 transition-all">
                                    <FileDown className="w-5 h-5" />
                                 </button>
                                 <button onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }} className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-2xl shadow-sm border border-rose-100 transition-all">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (!activeReport) return null;
    const { details } = activeReport;
    const hasData = details && details.predictions && details.predictions.length > 0;

    return (
      <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => { setViewState('list'); setActiveReport(null); }} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setShowShare(true); }}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700 shadow-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => navigate('/hub')}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700 shadow-sm"
            >
              <Activity className="w-4 h-4" /> Regenerate
            </button>
            <button 
              onClick={() => handleDownloadPDF(reportRef, `Demand_Forecast_${activeReport.name}`)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* PDF EXPORT TARGET */}
        <div ref={reportRef} className="bg-white rounded-[40px] p-10 md:p-14 border border-slate-200 shadow-sm relative overflow-hidden print-container">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-10 mb-10">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest mb-6">
               <BarChart3 className="w-3.5 h-3.5" /> 
               {activeReport.type} Report
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{activeReport.name}</h1>
             <div className="flex flex-col gap-2 text-sm font-bold text-slate-400">
                <div className="flex items-center gap-6">
                   <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Generated {activeReport.date}</span>
                   <span>•</span>
                   <span className="text-slate-600">ID: REQ-{activeReport.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                   <span className="uppercase tracking-widest text-slate-300">Generated by:</span> 
                   <span className="text-slate-500">{localStorage.getItem('user_email') || 'jane.doe@company.com'}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
             {/* Left Column: Context & Params */}
             <div className="space-y-10 lg:col-span-1">
                <div>
                   <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Forecast Parameters Used</h3>
                   <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-500">Forecast Horizon</span>
                         <span className="text-sm font-extrabold text-slate-900">Next {details?.horizon || '12'} Months</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-500">Starting From</span>
                         <span className="text-sm font-extrabold text-slate-900">{details?.summary?.data_range?.end || 'End of historical data'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-500">Model Used</span>
                         <span className="text-sm font-extrabold text-indigo-600">Random Forest</span>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Model Performance Metrics</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-3xl p-5">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">R² Score</p>
                         <p className="text-2xl font-extrabold text-slate-900">{details?.modelMetrics?.r2_score || '92.2'}%</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-5">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MAE</p>
                         <p className="text-xl font-extrabold text-slate-900">{fmt(details?.modelMetrics?.mae || 535.89)}</p>
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Summary Metrics</h3>
                   <div className="bg-slate-900 rounded-3xl p-6 space-y-4 text-white">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-400">Total Forecast</span>
                         <span className="text-lg font-extrabold text-emerald-400">{fmt(details?.totalPredicted)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-400">Avg Monthly</span>
                         <span className="text-sm font-extrabold text-white">{fmt(details?.avgPred)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-slate-400">Peak Forecast</span>
                         <span className="text-sm font-extrabold text-indigo-300">{fmt(details?.maxPred)}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Chart & Table */}
             <div className="lg:col-span-2 space-y-12">
                <div>
                   <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                     <BarChart3 className="w-5 h-5 text-indigo-500" />
                     Demand Forecast Analysis Chart
                   </h3>
                   <div className="h-[300px] w-full bg-slate-50/50 rounded-3xl p-4 border border-slate-100">
                     {hasData ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={details.predictions}>
                           <defs>
                             <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.18} />
                               <stop offset="95%" stopColor="#818cf8" stopOpacity={0.04} />
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={50} />
                           <RechartsTooltip content={<CustomTooltip />} />
                           <Area type="monotone" dataKey="upper" stroke="none" fill="url(#gradConf)" />
                           <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" />
                           <Line type="monotone" dataKey="predicted" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 3, strokeWidth: 0 }} name="AI Forecast" />
                         </ComposedChart>
                       </ResponsiveContainer>
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">Preview only works if prediction data is inside archive.</div>
                     )}
                   </div>
                </div>

                <div>
                   <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                     <FileText className="w-5 h-5 text-indigo-500" />
                     Predicted Data Overview Table
                   </h3>
                   <div className="overflow-x-auto border border-slate-200 rounded-3xl">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Period</th>
                              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Predicted Sales</th>
                              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Lower Bound</th>
                              <th className="py-4 px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Upper Bound</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {hasData ? details.predictions.map((row, idx) => (
                             <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white">
                                <td className="py-3.5 px-6 text-sm font-bold text-slate-800">{row.name}</td>
                                <td className="py-3.5 px-6 text-sm font-extrabold text-blue-600 text-right">{fmt(row.predicted)}</td>
                                <td className="py-3.5 px-6 text-sm font-bold text-red-500 text-right">{fmt(row.lower)}</td>
                                <td className="py-3.5 px-6 text-sm font-bold text-emerald-500 text-right">{fmt(row.upper)}</td>
                             </tr>
                           )) : (
                             <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-bold text-sm">No tabular data recorded.</td></tr>
                           )}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs font-bold text-slate-300 tracking-widest uppercase">
            — End of Report —
          </div>
        </div>
      </div>
    );
  };

  const renderCompare = () => {
    // Collect selected reports
    const compReports = reports.filter(r => selectedIds.includes(r.id)).slice(0, 4); // Max 4 to prevent broken UI
    if (compReports.length < 2) return null;

    // Use the first report's predicted data length or labels as anchor (assuming they all share time axis)
    // Find the maximal length to render chart gracefully
    const dataLengths = compReports.map(r => r.details?.predictions?.length || 0);
    const maxLengthIdx = dataLengths.indexOf(Math.max(...dataLengths));
    const anchorPredictions = compReports[maxLengthIdx].details?.predictions || [];
    
    // Combine data for comparison chart
    const compareData = anchorPredictions.map((anchorRow, idx) => {
      const rowObj = { name: anchorRow.name };
      compReports.forEach((cr, rIdx) => {
        if (cr.details?.predictions && cr.details.predictions[idx]) {
          rowObj[`report${rIdx}`] = cr.details.predictions[idx].predicted;
        }
      });
      return rowObj;
    });

    const colors = ['#4f46e5', '#f43f5e', '#10b981', '#f59e0b'];

    return (
      <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-4">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setViewState('list')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => handleDownloadPDF(compareRef, `Comparison_Report`)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="w-4 h-4" /> Generate Comparison PDF
            </button>
          </div>
        </div>
        
        <div ref={compareRef} className="bg-white rounded-[40px] p-10 md:p-14 border border-slate-200 shadow-sm relative overflow-hidden print-container">
          <div className="border-b border-slate-100 pb-10 mb-10 text-center">
             <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Comparison Analysis</h1>
             <p className="text-sm font-bold text-slate-400">Comparing {compReports.length} Forecast Scenarios</p>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
               <Activity className="w-5 h-5 text-indigo-500" />
               Variance Analysis Chart 
            </h3>
            <div className="h-[400px] w-full bg-slate-50/50 rounded-3xl p-4 border border-slate-100 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={compareData}>
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={50} />
                   <RechartsTooltip content={<CustomTooltip />} />
                   <Legend wrapperStyle={{ paddingTop: "20px" }} />
                   {compReports.map((cr, idx) => (
                     <Line 
                        key={idx} type="monotone" dataKey={`report${idx}`} 
                        name={cr.name} stroke={colors[idx % colors.length]} 
                        strokeWidth={4} dot={{ r: 4, strokeWidth: 0, fill: colors[idx % colors.length] }} 
                     />
                   ))}
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Side by side comparison metrics */}
          <div className="mb-12">
             <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
               <BarChart3 className="w-5 h-5 text-indigo-500" />
               Metrics Comparison 
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {compReports.map((cr, idx) => (
                   <div key={cr.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <h4 className="font-extrabold text-slate-900 mb-6 text-sm truncate" title={cr.name}>{cr.name}</h4>
                      
                      <div className="space-y-4">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">R² Score</p>
                            <p className="text-xl font-extrabold text-slate-800">{cr.details?.modelMetrics?.r2_score || 'N/A'}%</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MAE</p>
                            <p className="text-xl font-extrabold text-slate-800">{fmt(cr.details?.modelMetrics?.mae)}</p>
                         </div>
                         <div className="pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Forecast</p>
                            <p className="text-xl font-extrabold text-indigo-600">{fmt(cr.details?.totalPredicted)}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          {/* Side-by-side tables */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              Side-by-Side Tables
            </h3>
            <div className={`grid grid-cols-1 gap-6 lg:grid-cols-${Math.min(compReports.length, 3)}`}>
               {compReports.map((cr, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden">
                     <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                        <h4 className="font-bold text-slate-800 text-xs truncate uppercase tracking-widest">{cr.name}</h4>
                     </div>
                     <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                           <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 shadow-sm z-10">
                              <tr>
                                 <th className="py-3 px-4 font-extrabold text-slate-500 uppercase tracking-wider">Period</th>
                                 <th className="py-3 px-4 font-extrabold text-slate-500 uppercase tracking-wider text-right">Pred</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {cr.details?.predictions?.map((r, i) => (
                                 <tr key={i} className="hover:bg-slate-100/50">
                                    <td className="py-3 px-4 font-bold text-slate-700">{r.name}</td>
                                    <td className="py-3 px-4 font-extrabold text-slate-900 text-right">{fmt(r.predicted)}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewState === 'list' && renderList()}
      {viewState === 'detail' && renderDetail()}
      {viewState === 'compare' && renderCompare()}
      
      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Share Report</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Generate a link for stakeholders to view.</p>
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 mb-6">
              <span className="text-xs font-bold text-slate-600 truncate">https://neuroforecast.ai/reports/share/{activeReport?.id || selectedIds.join('-')}</span>
              <button 
                onClick={handleShare}
                className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : 'Copy'}
              </button>
            </div>
            
            <button 
              onClick={() => setShowShare(false)}
              className="w-full py-4 text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;
