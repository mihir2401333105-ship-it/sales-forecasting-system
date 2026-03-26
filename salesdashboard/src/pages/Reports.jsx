import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  SortAsc, 
  SortDesc, 
  FileBox, 
  FileText,
  Clock,
  Printer,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([
    { id: 1, name: 'Oct-2025 Seasonal Strategy', type: 'Strategic', date: 'Oct 24, 2025', status: 'ready', size: '2.4 MB' },
    { id: 2, name: 'Inventory Rebalancing Hub', type: 'Operations', date: 'Oct 12, 2025', status: 'ready', size: '1.2 MB' },
    { id: 3, name: 'Q4 Electronics Demand Projections', type: 'Forecast', date: 'Oct 08, 2025', status: 'ready', size: '4.8 MB' },
    { id: 4, name: 'Regional Performance Audit', type: 'Audit', date: 'Oct 02, 2025', status: 'ready', size: '560 KB' },
    { id: 5, name: 'Black Friday Sales Impact v2', type: 'Forecast', date: 'Sep 28, 2025', status: 'ready', size: '8.1 MB' },
    { id: 6, name: 'Churn Risk Prediction Set', type: 'Customer', date: 'Sep 15, 2025', status: 'processing', size: '1.4 MB' },
  ]);

  return (
    <div className="space-y-10 font-sans">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">Reports & Archive</h1>
          <p className="text-slate-500 font-medium tracking-tight">Access historical analysis and generate exports for stakeholders.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-slate-700">
              <Download className="w-4 h-4" />
              Batch Download 
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5">
              <PlusCircle className="w-4 h-4" />
              New Report
           </button>
        </div>
      </div>

      {/* Filtering & Search Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-blue-600 transition-all" />
            <input 
              type="text" 
              placeholder="Search reports by name, type, or date..."
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="flex gap-4 w-full md:w-auto">
            <button className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all">
               <Filter className="w-4 h-4" />
               Category
               <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all">
               <Clock className="w-4 h-4" />
               Timeframe
               <ChevronDown className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Main Reports Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900">Archived Analysis</h3>
          <div className="flex gap-6">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                <SortAsc className="w-4 h-4" /> Sort
             </div>
             <button className="text-xs font-extrabold text-blue-600 uppercase tracking-widest hover:underline transition-all">Clear Filters</button>
          </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                    <th className="py-6 px-10">Report Identification</th>
                    <th className="py-6 px-10">Classification</th>
                    <th className="py-6 px-10">Generation Date</th>
                    <th className="py-6 px-10">Status</th>
                    <th className="py-6 px-10 text-right pr-14">Action</th>
                 </tr>
              </thead>
              <tbody className="text-sm">
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-all group">
                     <td className="py-7 px-10">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl drop-shadow-sm group-hover:scale-110 transition-transform">
                              <FileText className="w-7 h-7" />
                           </div>
                           <div>
                              <p className="font-extrabold text-slate-900 text-lg mb-1 leading-tight">{report.name}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{report.size} • PDF FORMAT</p>
                           </div>
                        </div>
                     </td>
                     <td className="py-7 px-10">
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                           {report.type}
                        </span>
                     </td>
                     <td className="py-7 px-10 font-bold text-slate-500">
                        {report.date}
                     </td>
                     <td className="py-7 px-10">
                        {report.status === 'ready' ? (
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[10px] uppercase tracking-widest ring-1 ring-emerald-600/20 shadow-sm">
                              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                              Ready
                           </div>
                        ) : (
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase tracking-widest ring-1 ring-blue-600/20 shadow-sm">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                              Processing
                           </div>
                        )}
                     </td>
                     <td className="py-7 px-10 text-right pr-14">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                           <button className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-200 transition-all">
                              <FileDown className="w-5 h-5" />
                           </button>
                           <button className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-200 transition-all">
                              <Printer className="w-5 h-5" />
                           </button>
                           <button className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm border border-slate-200 transition-all">
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </div>
                     </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-10 py-8 bg-slate-50/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing 1-6 of 32 results</p>
           <div className="flex gap-2">
              <button disabled className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-300 bg-white">Previous</button>
              <button className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const PlusCircle = ({ className }) => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

export default Reports;
