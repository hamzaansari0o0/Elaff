'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, Download, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { buildTemplateCsv, normalizeImportRow } from '@/lib/csvImport';

// Small chunks keep each request comfortably under serverless function
// timeouts even when every row's images need to be fetched from Cloudinary.
const CHUNK_SIZE = 4;

function downloadTemplate() {
  const csv = buildTemplateCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'elaff-product-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductImportForm() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState([]);

  function isExcelFile(file) {
    return (
      /\.xlsx?$/i.test(file.name) ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );
  }

  function parseCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: reject,
      });
    });
  }

  async function parseExcel(file) {
    // Loaded on demand — it's a large library and most imports will be plain CSV.
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  }

  async function handleFile(file) {
    setParseError('');
    setRows([]);
    setLog([]);
    setFileName(file.name);

    try {
      const rawRows = isExcelFile(file) ? await parseExcel(file) : await parseCsv(file);
      const normalized = rawRows.map(normalizeImportRow).filter((r) => r.title);
      if (normalized.length === 0) {
        setParseError('No valid rows found — make sure the file has a "Title" column with values.');
        return;
      }
      setRows(normalized);
    } catch (err) {
      setParseError(err.message || 'Could not read this file.');
    }
  }

  async function startImport() {
    setImporting(true);
    setProgress(0);
    setLog([]);

    const chunks = [];
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    let done = 0;
    for (const chunk of chunks) {
      try {
        const res = await fetch('/api/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunk, updateExisting }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.results) {
          setLog((prev) => [...prev, ...data.results]);
        } else {
          setLog((prev) => [
            ...prev,
            ...chunk.map((r) => ({ title: r.title, status: 'error', message: data.error || 'Request failed' })),
          ]);
        }
      } catch (err) {
        setLog((prev) => [
          ...prev,
          ...chunk.map((r) => ({ title: r.title, status: 'error', message: err.message })),
        ]);
      }
      done += chunk.length;
      setProgress(Math.round((done / rows.length) * 100));
    }

    setImporting(false);
  }

  const summary = log.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">1. Get the template</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Download the template, fill in your products (one row each), then upload it below as CSV or
              Excel (.xlsx). Image URLs are fetched automatically and re-hosted on Cloudinary. For multiple
              images or specifications in one cell, separate values with a pipe ( | ).
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 border border-gray-300 hover:border-brand-navy text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg uppercase tracking-wide transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">2. Upload your file</h2>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-brand-navy rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-navy transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs font-bold uppercase">{fileName || 'Click to choose a CSV or Excel file'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {parseError && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {parseError}
          </p>
        )}

        {rows.length > 0 && (
          <div className="text-xs text-gray-600 bg-slate-50 border border-gray-200 rounded-lg px-3 py-2">
            <strong>{rows.length}</strong> product{rows.length === 1 ? '' : 's'} ready to import from{' '}
            <strong>{fileName}</strong>.
          </div>
        )}
      </section>

      {rows.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">3. Import</h2>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="w-4 h-4 accent-brand-navy"
            />
            Update products that already exist (matched by slug) instead of skipping them
          </label>

          <button
            type="button"
            onClick={startImport}
            disabled={importing}
            className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
            {importing ? `Importing... ${progress}%` : `Import ${rows.length} Products`}
          </button>

          {importing && (
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-cta transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </section>
      )}

      {log.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Results</h2>
            <div className="flex gap-3 text-xs font-bold">
              {summary.created > 0 && <span className="text-brand-green">{summary.created} created</span>}
              {summary.updated > 0 && <span className="text-brand-cyan">{summary.updated} updated</span>}
              {summary.skipped > 0 && <span className="text-brand-amber">{summary.skipped} skipped</span>}
              {summary.error > 0 && <span className="text-red-600">{summary.error} failed</span>}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
            {log.map((r, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                {r.status === 'created' || r.status === 'updated' ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                ) : r.status === 'skipped' ? (
                  <AlertTriangle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{r.title}</p>
                  <p className={r.message ? 'text-gray-500' : 'text-gray-400 capitalize'}>
                    {r.message || r.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
