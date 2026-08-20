import React from 'react';
import type { TriageRecord } from '../lib/types';
import { TRIAGE_METADATA } from '../lib/triage-algorithm';
import { Printer, Download, ArrowLeft, ShieldCheck, Heart, UserCheck, Stethoscope } from 'lucide-react';

interface PrintViewProps {
  record: TriageRecord;
}

export const PrintView: React.FC<PrintViewProps> = ({ record }) => {
  const meta = TRIAGE_METADATA[record.hasilKategori] || TRIAGE_METADATA.hijau;

  const handlePrint = () => {
    window.print();
  };

  const formattedWaktu = new Date(record.waktuKejadian).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="w-full">
      {/* Action Bar (Screen Only) */}
      <div className="no-print mb-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <a
            href={`/triage/hasil/${record.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Hasil
          </a>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Kasus: <strong className="text-slate-800">{record.noKasus}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Download className="w-4 h-4" /> Simpan PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" /> Cetak Lembar Triase
          </button>
        </div>
      </div>

      {/* Printable Sheet (Medical Handover Form) */}
      <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl sm:border sm:border-slate-200 sm:shadow-lg max-w-4xl mx-auto print:p-0 print:border-0 print:shadow-none">
        {/* Kop Surat Medis */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl tracking-tighter">
              119
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                PSC 119 EMERGENCY MEDICAL SERVICES
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                LEMBAR SERAH TERIMA TRIASE LAPANGAN — METODE TC-START (TRANSCULTURAL NURSING)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-slate-500">NO. KASUS</div>
            <div className="text-base sm:text-lg font-mono font-black text-slate-900 bg-slate-100 px-3 py-0.5 rounded border border-slate-300">
              {record.noKasus}
            </div>
          </div>
        </div>

        {/* Triage Ribbon Banner */}
        <div
          className="mb-6 p-4 rounded-xl text-white flex items-center justify-between border-2"
          style={{
            backgroundColor: meta.warnaHex,
            borderColor: meta.warnaHex,
            color: record.hasilKategori === 'hitam' ? '#ffffff' : '#ffffff',
          }}
        >
          <div>
            <div className="text-xs uppercase tracking-widest font-black opacity-90">KATEGORI TRIASE</div>
            <div className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {meta.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider font-bold opacity-90">PRIORITAS</div>
            <div className="text-3xl sm:text-4xl font-black">{record.hasilPrioritas}</div>
          </div>
        </div>

        {/* 2-Column Grid of Patient & Decision Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
          {/* Box 1: Identitas & Waktu */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 border-b pb-1">
              A. DATA IDENTITAS & KEJADIAN
            </h3>
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600 w-36">Nama Pasien</td>
                  <td className="py-1.5 font-bold text-slate-900">{record.namaPasien}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600">Jenis Kelamin</td>
                  <td className="py-1.5 capitalize text-slate-800">{record.jenisKelamin}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600">Keadaan Khusus</td>
                  <td className="py-1.5 capitalize text-slate-800">
                    {record.keadaanKhusus === 'difabel' ? 'Difabel / Kebutuhan Khusus' : 'Tidak Ada'}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600">Bahasa Utama</td>
                  <td className="py-1.5 capitalize text-slate-800">{record.bahasa}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600">Lokasi Kejadian</td>
                  <td className="py-1.5 text-slate-800">{record.lokasiKejadian}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Waktu / Sesi</td>
                  <td className="py-1.5 text-slate-800">
                    {formattedWaktu} ({record.waktuKategori.toUpperCase()})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Box 2: Alur Keputusan Algoritma */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 border-b pb-1">
              B. ALUR KEPUTUSAN TC-START
            </h3>
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-600 w-44">1. Dapat Berjalan?</td>
                  <td className="py-1.5 font-bold">
                    {record.dapatBerjalan ? (
                      <span className="text-emerald-700">YA (Minor / Hijau)</span>
                    ) : (
                      <span className="text-red-700">TIDAK (Lanjut Step 2)</span>
                    )}
                  </td>
                </tr>
                {!record.dapatBerjalan && (
                  <>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 font-semibold text-slate-600">2. Pernapasan (Airway)</td>
                      <td className="py-1.5">
                        {record.bernapas === false ? (
                          record.bernapasSetelahAirway ? (
                            <span className="text-red-700 font-bold">Bernapas stlh Airway dibuka</span>
                          ) : (
                            <span className="text-slate-900 font-bold">Tidak Bernapas (Hitam)</span>
                          )
                        ) : (
                          <span>
                            Bernapas (RR: <strong>{record.frekuensiPernafasan || '-'}x/m</strong> {record.rrKategori})
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 font-semibold text-slate-600">3. Perfusi & Nadi</td>
                      <td className="py-1.5">
                        Nadi Radial: <strong>{record.nadiRadialTeraba ? 'Teraba' : 'TIDAK Teraba'}</strong> | CRT:{' '}
                        <strong>{record.crt || '-'}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">4. Kesadaran (AVPU)</td>
                      <td className="py-1.5">
                        Skala: <strong>{record.statusMentalAvpu || '-'}</strong> (
                        {record.statusMentalAvpu === 'A'
                          ? 'Alert / Sadar Penuh'
                          : record.statusMentalAvpu === 'V'
                          ? 'Verbal / Respons Suara'
                          : record.statusMentalAvpu === 'P'
                          ? 'Pain / Respons Nyeri'
                          : 'Unresponsive'}
                        )
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column: Dokumentasi Klinis & Transcultural */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
          {/* Dokumentasi Klinis Tambahan */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 border-b pb-1">
              C. DOKUMENTASI KLINIS (SERAH TERIMA)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Glasgow Coma Scale (GCS)</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  E{record.gcs?.e ?? '-'} M{record.gcs?.m ?? '-'} V{record.gcs?.v ?? '-'}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  Total: <strong>{record.gcs?.total ?? ((record.gcs?.e || 0) + (record.gcs?.m || 0) + (record.gcs?.v || 0)) || '-'}</strong> / 15
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold uppercase">Skala Nyeri (NRS / Face)</div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {record.skorNyeri !== undefined ? `${record.skorNyeri} / 10` : '-'}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  {record.skorNyeri !== undefined
                    ? record.skorNyeri === 0
                      ? 'Tidak Nyeri'
                      : record.skorNyeri <= 3
                      ? 'Nyeri Ringan'
                      : record.skorNyeri <= 6
                      ? 'Nyeri Sedang'
                      : 'Nyeri Berat / Hebat'
                    : 'Tidak Dinilai'}
                </div>
              </div>
            </div>
          </div>

          {/* Asesmen Transcultural Nursing */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 border-b pb-1">
              D. ASESMEN TRANSCULTURAL NURSING
            </h3>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.bahasaDipahami ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {record.transcultural.bahasaDipahami ? '✓' : '✗'}
                </span>
                <span>Bahasa komunikasi dipahami pasien</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.genderDiperhatikan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {record.transcultural.genderDiperhatikan ? '✓' : '✗'}
                </span>
                <span>Sensitivitas gender & privasi diperhatikan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.nyeriEkspresiDiperhatikan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {record.transcultural.nyeriEkspresiDiperhatikan ? '✓' : '✗'}
                </span>
                <span>Ekspresi nyeri kultural direspons empatik</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-black ${record.transcultural.dukunganKeluargaDilibatkan ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {record.transcultural.dukunganKeluargaDilibatkan ? '✓' : '✗'}
                </span>
                <span>Dukungan keluarga / pendamping dilibatkan</span>
              </div>
              {record.transcultural.catatan && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs italic text-slate-700 bg-white p-2 rounded">
                  "{record.transcultural.catatan}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tujuan Rujukan & Rekomendasi */}
        <div className="mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="font-semibold text-slate-600 uppercase text-xs">Rumah Sakit Rujukan Tujuan:</span>
              <div className="text-base font-extrabold text-slate-900">{record.tujuanRujukan || 'RSU Tidar'}</div>
            </div>
            <div className="text-right sm:text-right">
              <span className="font-semibold text-slate-600 uppercase text-xs">Rekomendasi Tindakan Segera:</span>
              <div className="text-xs sm:text-sm font-medium text-slate-800 max-w-md">{meta.rekomendasiTindakan}</div>
            </div>
          </div>
        </div>

        {/* Kolom Tanda Tangan Serah Terima */}
        <div className="border-t-2 border-slate-900 pt-4 mt-8 grid grid-cols-2 gap-8 text-xs sm:text-sm">
          <div className="text-center">
            <p className="text-slate-600">Petugas Lapangan PSC 119</p>
            <div className="h-16 flex items-end justify-center">
              <p className="font-bold text-slate-900 underline">{record.namaPetugas}</p>
            </div>
            <p className="text-slate-400 text-xs">Tanda Tangan & Nama Terang</p>
          </div>

          <div className="text-center">
            <p className="text-slate-600">Penerima di RS Rujukan ({record.tujuanRujukan})</p>
            <div className="h-16 flex items-end justify-center">
              <p className="font-bold text-slate-900">( ...................................................... )</p>
            </div>
            <p className="text-slate-400 text-xs">Dokter / Perawat Triase IGD</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Dokumen ini dicetak otomatis dari Sistem Aplikasi TC-START Prehospital PSC 119. Waktu Cetak: {new Date().toLocaleString('id-ID')}.
        </div>
      </div>
    </div>
  );
};
