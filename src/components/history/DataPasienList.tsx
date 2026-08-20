import React, { useState, useEffect } from 'react';
import type { TriageRecord, KategoriTriage } from '../../lib/types';
import { getTriageRecords } from '../../lib/triage-storage';
import { HasilBadge } from '../HasilBadge';
import {
  Search,
  Calendar,
  Filter,
  Plus,
  Printer,
  ChevronRight,
  FileText,
  Clock,
  MapPin,
  RefreshCw,
  User,
  HeartPulse,
  FileSpreadsheet,
} from 'lucide-react';
import { exportTriageToExcel } from '../../lib/triage-excel';

export const DataPasienList: React.FC = () => {
  const [records, setRecords] = useState<TriageRecord[]>(() => getTriageRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<KategoriTriage | 'semua'>('semua');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');

  // Load records on mount & filter change
  useEffect(() => {
    const data = getTriageRecords({
      namaPasien: searchQuery,
      kategori: selectedKategori,
      dariTanggal: dariTanggal || undefined,
      sampaiTanggal: sampaiTanggal || undefined,
    });
    setRecords(data);
  }, [searchQuery, selectedKategori, dariTanggal, sampaiTanggal]);

  const handleExportExcel = () => {
    if (records.length === 0) {
      alert('Tidak ada data pasien yang sesuai untuk diekspor.');
      return;
    }
    exportTriageToExcel(records);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedKategori('semua');
    setDariTanggal('');
    setSampaiTanggal('');
  };

  const countByKategori = {
    semua: getTriageRecords().length,
    merah: getTriageRecords({ kategori: 'merah' }).length,
    kuning: getTriageRecords({ kategori: 'kuning' }).length,
    hijau: getTriageRecords({ kategori: 'hijau' }).length,
    hitam: getTriageRecords({ kategori: 'hitam' }).length,
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" /> Rekam Medis Prehospital
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data Pasien & Riwayat Triase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar korban dan hasil klasifikasi triase lapangan PSC 119
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition text-xs sm:text-sm active:scale-95"
            title="Ekspor daftar ini ke file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Ekspor Excel
          </button>
          <a
            href="/triage/input"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/25 transition text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" /> Triage Pasien Baru
          </a>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        {/* Search & Date Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search text */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Cari nama pasien, no. kasus, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Date from */}
          <div className="sm:col-span-3 relative">
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-xs sm:text-sm font-medium outline-none"
              title="Dari Tanggal"
            />
          </div>

          {/* Date to */}
          <div className="sm:col-span-3 relative">
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-xs sm:text-sm font-medium outline-none"
              title="Sampai Tanggal"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'semua', label: 'Semua Status', count: countByKategori.semua, bg: 'bg-slate-100 text-slate-800' },
              { id: 'merah', label: '🔴 Merah (P1)', count: countByKategori.merah, bg: 'bg-red-100 text-red-800' },
              { id: 'kuning', label: '🟡 Kuning (P2)', count: countByKategori.kuning, bg: 'bg-amber-100 text-amber-800' },
              { id: 'hijau', label: '🟢 Hijau (P3)', count: countByKategori.hijau, bg: 'bg-emerald-100 text-emerald-800' },
              { id: 'hitam', label: '⚫ Hitam (P4)', count: countByKategori.hitam, bg: 'bg-slate-200 text-slate-900' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedKategori(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedKategori === tab.id
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${tab.bg}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {(searchQuery || dariTanggal || sampaiTanggal || selectedKategori !== 'semua') && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Record List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tidak ada data pasien yang sesuai</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau bersihkan filter tanggal dan kategori warna.
          </p>
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const formattedDate = new Date(rec.waktuKejadian).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <HasilBadge kategori={rec.hasilKategori} prioritas={rec.hasilPrioritas} size="sm" />
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.noKasus}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formattedDate}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 transition">
                      {rec.namaPasien}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {rec.lokasiKejadian}
                      </span>
                      <span className="capitalize">
                        &bull; {rec.jenisKelamin} ({rec.bahasa})
                      </span>
                      {rec.gcs?.total && (
                        <span className="font-semibold text-slate-700">
                          &bull; GCS: {rec.gcs.total}/15
                        </span>
                      )}
                      {rec.skorNyeri !== undefined && (
                        <span className="font-semibold text-slate-700">
                          &bull; Nyeri: {rec.skorNyeri}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <strong>Rujukan:</strong> {rec.tujuanRujukan} &bull; <em>{rec.alasanKategori}</em>
                  </div>
                </div>

                {/* Right CTA buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/triage/hasil/${rec.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5" /> Detail Triase
                  </a>
                  <a
                    href={`/triage/hasil/${rec.id}#print`}
                    onClick={() => {
                      setTimeout(() => {
                        window.location.href = `/triage/hasil/${rec.id}`;
                      }, 100);
                    }}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
                    title="Cetak Lembar Triage"
                  >
                    <Printer className="w-4 h-4" />
                  </a>
                  <a
                    href={`/triage/hasil/${rec.id}`}
                    className="p-2 rounded-xl text-slate-400 group-hover:text-red-600 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
