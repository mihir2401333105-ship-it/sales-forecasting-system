import React, { useState, useRef, useCallback } from 'react';
import {
  CloudUpload, FileText, Download, CheckCircle, ChevronDown,
  ArrowRight, Table as TableIcon, Database, AlertCircle, Loader2,
  Columns, RefreshCw, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForecast } from '../context/ForecastContext';
import { useNavigate } from 'react-router-dom';

// ─── Step indicator ───────────────────────────────────────────────────────
const StepBadge = ({ num, label, active, done }) => (
  <div className={`flex items-center gap-3 ${active || done ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all
      ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
      {done ? <CheckCircle className="w-4 h-4" /> : num}
    </div>
    <span className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const StepDivider = ({ done }) => (
  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-100'}`} />
);

// ─── SelectDropdown ──────────────────────────────────────────────────────
const SelectDropdown = ({ label, value, options, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-all group-hover:text-blue-600" />
      <select
        className="w-full h-14 pl-5 pr-10 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600/30 shadow-sm appearance-none transition-all hover:shadow-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
    </div>
  </div>
);

// ─── DataTable preview ──────────────────────────────────────────────────
const DataPreview = ({ rows, columns }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-100">
    <table className="w-full text-sm text-left">
      <thead>
        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          {columns.map(c => <th key={c} className="py-3 px-4">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 5).map((row, i) => (
          <tr key={i} className="border-t border-slate-100">
            {columns.map(c => (
              <td key={c} className="py-2.5 px-4 text-slate-600 font-medium">{String(row[c] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length > 5 && (
      <div className="py-3 px-4 text-center text-xs font-bold text-slate-400 bg-slate-50 border-t border-slate-100">
        … and {rows.length - 5} more rows
      </div>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────
const DataIngestion = () => {
  const { processFile, status, fileInfo, error, reset } = useForecast();
  const navigate = useNavigate();

  // Step 1 state
  const [step, setStep] = useState(1);          // 1 = upload, 2 = map columns, 3 = success
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Step 2 state
  const [rawFile, setRawFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [dateCol, setDateCol] = useState('');
  const [salesCol, setSalesCol] = useState('');
  const [parseError, setParseError] = useState(null);

  // ── Parse CSV client-side (pure JS, no PapaParse needed) ───────────────
  const parseCSV = useCallback((text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV has fewer than 2 lines.');

    // Detect separator
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));

    const rows = lines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
      return obj;
    });

    return { headers, rows };
  }, []);

  // ── Handle file selection ───────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setParseError('Please select a valid CSV file.');
      return;
    }
    setParseError(null);
    const text = await file.text();
    try {
      const { headers, rows } = parseCSV(text);
      setRawFile(file);
      setColumns(headers);
      setParsedRows(rows);

      // Auto-detect columns
      const lc = headers.map(h => h.toLowerCase());
      const autoDate = headers.find((_, i) =>
        ['date', 'year', 'month', 'time', 'period', 'week'].some(k => lc[i].includes(k))
      ) || '';
      const autoSales = headers.find((_, i) =>
        ['sales', 'revenue', 'amount', 'value', 'total', 'qty', 'quantity'].some(k => lc[i].includes(k))
      ) || '';

      setDateCol(autoDate);
      setSalesCol(autoSales);
      setStep(2);
    } catch (e) {
      setParseError(`Could not parse CSV: ${e.message}`);
    }
  }, [parseCSV]);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleSelect = (e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };

  // ── Submit mapping to backend ───────────────────────────────────────────
  const handleProcess = async () => {
    if (!dateCol || !salesCol) { setParseError('Please select both columns.'); return; }
    if (dateCol === salesCol)  { setParseError('Date and Sales columns must be different.'); return; }
    setParseError(null);

    const result = await processFile(rawFile, dateCol, salesCol);
    if (result.success) setStep(3);
    else setParseError(result.error);
  };

  // ── Download template ───────────────────────────────────────────────────
  const downloadTemplate = () => {
    const csv = 'Date,Sales\n2023-01-01,5200\n2023-02-01,4800\n2023-03-01,5600\n2023-04-01,6100\n2023-05-01,5900\n2023-06-01,6300';
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'sales_template.csv',
    });
    a.click();
  };

  const isProcessing = status === 'uploading';

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Data Ingestion</h1>
          <p className="text-slate-500 font-medium">Upload your historical sales CSV and map your columns.</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-700"
        >
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {/* Step Progress */}
      <div className="flex items-center px-2">
        <StepBadge num={1} label="Upload File"    active={step === 1} done={step > 1} />
        <StepDivider done={step > 1} />
        <StepBadge num={2} label="Map Columns"   active={step === 2} done={step > 2} />
        <StepDivider done={step > 2} />
        <StepBadge num={3} label="Model Trained"  active={step === 3} done={false} />
      </div>

      {/* ── STEP 1: Upload ── */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            <div
              className={`relative bg-white border-2 border-dashed rounded-[32px] p-20 transition-all cursor-pointer text-center
                ${dragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleSelect} />

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6 drop-shadow-sm">
                  <CloudUpload className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Drop your CSV here</h2>
                <p className="text-slate-500 max-w-sm font-medium mb-8">
                  Any column layout works — you'll map your date and sales columns in the next step.
                </p>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                  Choose File
                </button>
              </div>

              {/* Decorative */}
              <div className="absolute top-8 left-8 opacity-10 rotate-12 pointer-events-none">
                <TableIcon className="w-12 h-12" />
              </div>
              <div className="absolute bottom-8 right-8 opacity-10 -rotate-12 pointer-events-none">
                <FileText className="w-12 h-12" />
              </div>
            </div>

            {parseError && (
              <div className="mt-4 flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" /> {parseError}
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Column Mapper ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* File card */}
            <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900">{rawFile?.name}</p>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  {parsedRows.length} rows · {columns.length} columns detected
                </p>
              </div>
              <button
                onClick={() => { setStep(1); setRawFile(null); setParsedRows([]); setColumns([]); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Change
              </button>
            </div>

            {/* Data preview */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Columns className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">Data Preview</span>
              </div>
              <DataPreview rows={parsedRows} columns={columns} />
            </div>

            {/* Column mapping form */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Columns className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900">Map Your Columns</h3>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">Tell us which column is your date and which is your sales figure.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <SelectDropdown
                  label="Date / Time Column"
                  value={dateCol}
                  options={Array.from(new Set([...columns, 'Year', 'Month']))}
                  onChange={setDateCol}
                  placeholder="— Select date column —"
                />
                <SelectDropdown
                  label="Sales / Revenue Column"
                  value={salesCol}
                  options={Array.from(new Set([...columns, 'Year', 'Month']))}
                  onChange={setSalesCol}
                  placeholder="— Select sales column —"
                />
              </div>

              {/* Hint about Year/Month CSVs */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl mb-6">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                  <strong>Tip:</strong> If your CSV has separate <em>Year</em> and <em>Month</em> columns, select <em>Year</em> as the Date column — the backend will auto-detect the Month column.
                  For a single date column (e.g. "2024-03-01"), just pick that column.
                </p>
              </div>

              {parseError && (
                <div className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-bold mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {parseError}
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || !dateCol || !salesCol}
                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:translate-y-0"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Training Model…</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Process Data &amp; Train Model</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 rounded-[40px] shadow-sm p-16 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Model Trained!</h2>
            <p className="text-slate-500 font-medium max-w-md mb-2">
              Your file <span className="font-bold text-slate-700">{fileInfo?.filename}</span> was processed
              successfully. <span className="font-bold text-slate-700">{fileInfo?.rows}</span> data points loaded
              and the forecasting model is ready.
            </p>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => { setStep(1); setRawFile(null); setParsedRows([]); setColumns([]); reset(); }}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Upload New File
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-extrabold shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 transition-all"
              >
                View Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info when idle */}
      {step === 1 && (
        <div className="flex gap-6">
          {[
            { icon: Database, label: 'Any Column Layout', desc: 'No fixed schema required' },
            { icon: Sparkles, label: 'Auto Column Detection', desc: 'We guess the right columns' },
            { icon: CheckCircle, label: 'Instant Model Training', desc: 'RandomForest trains on upload' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex-1 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataIngestion;
