import React, { useState, useEffect } from 'react';
import {
  getSavedOfficerName,
  setSavedOfficerName,
  getSavedUnitName,
  setSavedUnitName,
  getTriageRecords,
} from '../../lib/triage-storage';
import { Settings, Save, Trash2, Download, CheckCircle2, Shield, PhoneCall, FileSpreadsheet } from 'lucide-react';
import { exportTriageToExcel } from '../../lib/triage-excel';

export const SettingsView: React.FC = () => {
  const [officerName, setOfficerName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    setOfficerName(getSavedOfficerName());
    setUnitName(getSavedUnitName());
    setRecordCount(getTriageRecords().length);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedOfficerName(officerName);
    setSavedUnitName(unitName);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportExcel = () => {
    const data = getTriageRecords();
    if (data.length === 0) {
      alert('Tidak ada data triase untuk diekspor.');
      return;
    }
    exportTriageToExcel(data);
  };

  const handleExportJSON = () => {
    const data = getTriageRecords();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tc-start-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data demo triase? Data kustom akan digantikan dengan data percontohan.')) {
      localStorage.removeItem('tc_start_triage_records');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" /> Konfigurasi Sistem
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kelola profil petugas default, unit PSC 119, dan pencadangan data
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Profil Petugas & Layanan Prehospital
        </h2>

        {savedSuccess && (
          <div className="p-4 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            Pengaturan berhasil disimpan! Nama petugas akan otomatis terisi saat input triase berikutnya.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Nama Petugas Lapangan Default
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="Contoh: Ahmad S., Ners - PSC 119"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Nama ini akan selalu muncul otomatis pada formulir triase baru tanpa perlu mengetik ulang setiap saat.
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
              Nama Unit PSC 119 / Tim Siaga
            </label>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="Contoh: PSC 119 Garda Waluyo Kota Magelang"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/20 transition text-sm"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </form>

      {/* Backup & Storage Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Manajemen Data Triase ({recordCount} Rekam Medis)
        </h2>

        <p className="text-xs sm:text-sm text-slate-600">
          Semua data tersimpan secara lokal dan aman di browser/WebView perangkat Anda. Anda dapat mengunduh salinan laporan dalam format Excel (.xlsx) atau cadangan JSON.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor ke Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" /> Ekspor Backup Data (JSON)
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <Trash2 className="w-4 h-4" /> Reset ke Data Contoh
          </button>
        </div>
      </div>
    </div>
  );
};
