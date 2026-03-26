import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudUpload, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Trash2,
  Table as TableIcon,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataIngestion = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch file history on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail}`);
      } else {
        await fetchFiles();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Make sure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Year,Month,Sales\n2024,1,5000\n2024,2,5200\n2024,3,4800";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_data_template.csv';
    a.click();
  };

  const deleteFile = (id) => {
    // For this demo, since it's in-memory, we just filter local state if needed
    // In a real app, delete from server first
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Data Management</h1>
          <p className="text-slate-500 font-medium">Manage your datasets and historical performance records.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-700"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        className={`relative bg-white border-2 border-dashed rounded-[32px] p-16 transition-all cursor-pointer ${
          dragActive ? 'border-blue-600 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleFileSelect}
          accept=".csv"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
           <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 drop-shadow-sm transition-all ${isUploading ? 'bg-blue-600 text-white animate-bounce' : 'bg-blue-600/10 text-blue-600'}`}>
              <CloudUpload className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-bold mb-2">{isUploading ? 'Uploading Data...' : 'Upload datasets'}</h2>
           <p className="text-slate-500 max-w-sm font-medium mb-8">
             {isUploading ? 'Our AI is currently parsing and cleaning your dataset.' : 'Drag and drop your historical sales data (CSV) and we\'ll automatically train the model.'}
           </p>
           {!isUploading && (
             <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20">
               Choose File
             </button>
           )}
        </div>

        {/* Floating Icons */}
        <div className="absolute top-10 left-10 opacity-10 rotate-12">
           <TableIcon className="w-12 h-12" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 -rotate-12">
           <FileText className="w-12 h-12" />
        </div>
      </div>

      {/* Files Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Recent Datasets</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{files.length} Total Files</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
                 <th className="py-5 px-8">File Details</th>
                 <th className="py-5 px-8">Status</th>
                 <th className="py-5 px-8">Data Points</th>
                 <th className="py-5 px-8 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {files.map((file, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={file.id} 
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <FileText className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-extrabold text-slate-900 mb-1">{file.filename || file.name}</p>
                            <p className="text-xs text-slate-400 font-bold">{file.size} • {file.date}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      {file.status === 'processed' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-bold text-[11px] uppercase tracking-wide">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Processed
                        </div>
                      )}
                      {file.status === 'error' && (
                         <div className="group/error relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full font-bold text-[11px] uppercase tracking-wide cursor-help">
                            <XCircle className="w-3.5 h-3.5" />
                            Error
                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/error:opacity-100 transition-all invisible group-hover/error:visible w-48 text-center uppercase tracking-wider">
                               {file.error || 'Check column formatting'}
                            </div>
                         </div>
                      )}
                    </td>
                    <td className="py-6 px-8 font-bold text-slate-600">
                      {file.rows > 0 ? file.rows.toLocaleString() : '-'}
                    </td>
                    <td className="py-6 px-8 text-right pr-12">
                       <button 
                         onClick={() => deleteFile(file.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {files.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[32px] shadow-sm"
          >
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8">
               <Database className="w-12 h-12" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">No datasets found</h3>
             <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-4">
                Start by uploading your first dataset. We'll automatically identify columns and clean the data.
             </p>
             <button 
               onClick={() => fileInputRef.current.click()} 
               className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all"
             >
               Upload Dataset
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataIngestion;
