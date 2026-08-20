import React, { useState, useEffect } from 'react';
import type { TriageRecord } from '../../lib/types';
import { getTriageById, getTriageRecords } from '../../lib/triage-storage';
import { TRIAGE_METADATA } from '../../lib/triage-algorithm';
import { HasilBadge } from '../HasilBadge';
import { PrintView } from '../PrintView';
import {
  Printer,
  Download,
  RotateCcw,
  ArrowLeft,
  Hospital,
  Clock,
  User,
  MapPin,
  HeartPulse,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Share2,
  Copy,
  FileCheck,
} from 'lucide-react';

interface HasilTriageViewProps {
  recordId?: string;
}

export const HasilTriageView: React.FC<HasilTriageViewProps> = ({ recordId }) => {
  const [record, setRecord] = useState<TriageRecord | null>(() => {
    if (typeof window !== 'undefined') {
      const searchId = new URLSearchParams(window.location.search).get('id');
      if (searchId) {
        const r = getTriageById(searchId);
        if (r) return r;
      }
    }
    if (recordId && recordId !== '[id]' && recordId !== 'hasil') {
      return getTriageById(recordId);
    }
    const all = getTriageRecords();
    return all.length > 0 ? all[0] : null;
  });
  const [showPrintMode, setShowPrintMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let id = recordId;
    if (typeof window !== 'undefined') {
      const searchId = new URLSearchParams(window.location.search).get('id');
      if (searchId) id = searchId;

      if (!id || id === '[id]' || id === 'hasil') {
        const parts = window.location.pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart !== 'hasil') id = lastPart;
      }
    }

    if (id && id !== '[id]' && id !== 'hasil') {
      const rec = getTriageById(id);
      if (rec) {
        setRecord(rec);
        return;
      }
    }

    // Fallback to newest record
    const all = getTriageRecords();
    if (all.length > 0) {
      setRecord(all[0]);
    }
  }, [recordId]);

  if (!record) {
    return (
      <div className="w-full max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <HeartPulse className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Memuat Hasil Triase...</h2>
        <p className="text-xs text-slate-500">Mencari data rekam triase prehospital.</p>
        <a
          href="/triage/input"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm"
        >
          <Plus className="w-4 h-4" /> Input Triase Baru
        </a>
      </div>
    );
  }

  const meta = TRIAGE_METADATA[record.hasilKategori] || TRIAGE_METADATA.hijau;
  const formattedWaktu = new Date(record.waktuKejadian).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const handleCopySummary = () => {
    const text = `[HASIL TC-START PSC 119]\nNo: ${record.noKasus}\nPasien: ${record.namaPasien}\nKategori: ${meta.label} (Prioritas ${record.hasilPrioritas})\nRujukan: ${record.tujuanRujukan}\nGCS: ${record.gcs?.total || '-'}/15 | Nyeri: ${record.skorNyeri !== undefined ? record.skorNyeri + '/10' : '-'}\nPetugas: ${record.namaPetugas}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <a
            href="/data-pasien"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Riwayat Pasien
          </a>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">{record.noKasus}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            title="Salin Ringkasan Pesan Cepat"
          >
            {copied ? <FileCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Rekap'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" /> PDF / Cetak
          </button>
          <a
            href="/triage/input"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Pasien Baru
          </a>
        </div>
      </div>

      {/* Hero Result Banner Card */}
      <HasilBadge
        kategori={record.hasilKategori}
        prioritas={record.hasilPrioritas}
        size="hero"
        showDescription={true}
      />

      {/* Recommendation Action Alert */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl flex-shrink-0">
          <Hospital className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-600">Rekomendasi Tindakan Segera</span>
            <span className="text-xs text-slate-400">&bull; Rujukan: <strong>{record.tujuanRujukan}</strong></span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {meta.rekomendasiTindakan}
          </p>
          <p className="text-xs text-slate-500">
            Penjelasan Klinis: {record.alasanKategori || meta.kriteriaKunci}
          </p>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Identitas Korban */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-red-600" /> Identitas & Konteks Lapangan
            </h3>
            <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {record.noKasus}
            </span>
          </div>

          <table className="w-full text-xs sm:text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold w-32">Nama Pasien</td>
                <td className="py-2 font-bold text-slate-900">{record.namaPasien}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Jenis Kelamin</td>
                <td className="py-2 capitalize text-slate-800">{record.jenisKelamin}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Bahasa Utama</td>
                <td className="py-2 capitalize text-slate-800">{record.bahasa}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Keadaan Khusus</td>
                <td className="py-2 capitalize text-slate-800">
                  {record.keadaanKhusus === 'difabel' ? 'Difabel / Kebutuhan Khusus' : 'Tidak Ada'}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Lokasi TKP</td>
                <td className="py-2 text-slate-800">{record.lokasiKejadian}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-semibold">Waktu Kejadian</td>
                <td className="py-2 text-slate-800">
                  {formattedWaktu} ({record.waktuKategori.toUpperCase()})
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Petugas Lapangan</td>
                <td className="py-2 font-bold text-slate-900">{record.namaPetugas}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: Alur Keputusan Algoritma START */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" /> Alur Keputusan Algoritma
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Step 1 */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Step 1: Mobilisasi</span>
                <span className="font-bold text-slate-800">Dapat Berjalan?</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${record.dapatBerjalan ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {record.dapatBerjalan ? 'YA (Minor / Hijau)' : 'TIDAK'}
              </span>
            </div>

            {/* Step 2 */}
            {!record.dapatBerjalan && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Step 2: Pernapasan & Laju RR</span>
                  <span className="font-bold text-slate-800">
                    {record.bernapas === false
                      ? record.bernapasSetelahAirway
                        ? 'Bernapas setelah Airway dibuka'
                        : 'Tidak Bernapas (Henti Napas)'
                      : `Bernapas: ${record.frekuensiPernafasan || '-'} x/menit`}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  {record.rrKategori || (record.bernapas ? 'Stabil' : 'Airway')}
                </span>
              </div>
            )}

            {/* Step 3 */}
            {!record.dapatBerjalan && record.bernapas !== false && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Step 3: Perfusi & Sirkulasi</span>
                  <span className="font-bold text-slate-800">
                    Nadi: {record.nadiRadialTeraba ? 'Teraba' : 'Tidak Teraba'} &bull; CRT: {record.crt || '-'}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${record.nadiRadialTeraba && record.crt === '<=2s' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {record.nadiRadialTeraba && record.crt === '<=2s' ? 'Adekuat' : 'Tidak Adekuat'}
                </span>
              </div>
            )}

            {/* Step 4 */}
            {!record.dapatBerjalan && record.bernapas !== false && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Step 4: Status Mental (AVPU)</span>
                  <span className="font-bold text-slate-800">
                    Skala: {record.statusMentalAvpu || '-'} ({record.statusMentalAvpu === 'A' ? 'Alert / Sadar' : record.statusMentalAvpu === 'V' ? 'Verbal' : record.statusMentalAvpu === 'P' ? 'Pain only' : 'Unresponsive'})
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${record.statusMentalAvpu === 'A' || record.statusMentalAvpu === 'V' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {record.statusMentalAvpu === 'A' || record.statusMentalAvpu === 'V' ? 'Sadar Sederhana' : 'Depresi Mental'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Scores & Transcultural Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dokumentasi Klinis */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" /> Dokumentasi Klinis Tambahan
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase block">GCS Total</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {record.gcs?.total ?? ((record.gcs?.e || 0) + (record.gcs?.m || 0) + (record.gcs?.v || 0)) || '-'}/15
              </span>
              <span className="text-xs text-slate-600 mt-1 block">
                E{record.gcs?.e ?? '-'} M{record.gcs?.m ?? '-'} V{record.gcs?.v ?? '-'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase block">Skala Nyeri</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {record.skorNyeri !== undefined ? `${record.skorNyeri}/10` : '-'}
              </span>
              <span className="text-xs text-slate-600 mt-1 block">
                {record.skorNyeri !== undefined
                  ? record.skorNyeri === 0
                    ? 'Bebas Nyeri'
                    : record.skorNyeri <= 3
                    ? 'Ringan'
                    : record.skorNyeri <= 6
                    ? 'Sedang'
                    : 'Nyeri Hebat'
                  : 'Tidak Dinilai'}
              </span>
            </div>
          </div>
        </div>

        {/* Transcultural Nursing Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-red-600" /> Pendekatan Transcultural
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.bahasaDipahami ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {record.transcultural.bahasaDipahami ? '✓' : '✗'}
              </span>
              <span className="text-slate-700">Bahasa komunikasi dipahami pasien</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.genderDiperhatikan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {record.transcultural.genderDiperhatikan ? '✓' : '✗'}
              </span>
              <span className="text-slate-700">Sensitivitas gender & privasi terjaga</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.nyeriEkspresiDiperhatikan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {record.transcultural.nyeriEkspresiDiperhatikan ? '✓' : '✗'}
              </span>
              <span className="text-slate-700">Ekspresi nyeri kultural direspons empatik</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.dukunganKeluargaDilibatkan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {record.transcultural.dukunganKeluargaDilibatkan ? '✓' : '✗'}
              </span>
              <span className="text-slate-700">Dukungan keluarga dilibatkan</span>
            </div>
            {record.transcultural.catatan && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs italic text-slate-600">
                "{record.transcultural.catatan}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Print Sheet that activates on window.print() */}
      <div className="hidden print:block">
        <PrintView record={record} />
      </div>
    </div>
  );
};
