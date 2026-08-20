import * as XLSX from 'xlsx';
import type { TriageRecord } from './types';
import { TRIAGE_METADATA } from './triage-algorithm';

/**
 * Export triage records to formatted Excel (.xlsx) workbook
 */
export function exportTriageToExcel(records: TriageRecord[], customFilename?: string): void {
  const rows = records.map((rec, index) => {
    const meta = TRIAGE_METADATA[rec.hasilKategori] || TRIAGE_METADATA.hijau;
    const gcsTotal = rec.gcs?.total ?? ((rec.gcs?.e || 0) + (rec.gcs?.m || 0) + (rec.gcs?.v || 0)) || '-';

    return {
      'No.': index + 1,
      'No. Kasus': rec.noKasus,
      'Nama Pasien': rec.namaPasien,
      'Jenis Kelamin': rec.jenisKelamin ? rec.jenisKelamin.toUpperCase() : '-',
      'Bahasa Pasien': rec.bahasa ? rec.bahasa.toUpperCase() : '-',
      'Keadaan Khusus': rec.keadaanKhusus === 'difabel' ? 'Difabel' : 'Umum',
      'Lokasi Kejadian': rec.lokasiKejadian,
      'Waktu Kejadian': new Date(rec.waktuKejadian).toLocaleString('id-ID'),
      'Sesi Waktu': rec.waktuKategori ? rec.waktuKategori.toUpperCase() : '-',
      'Nama Petugas PSC 119': rec.namaPetugas,

      // Hasil Triase
      'Kategori Triase': meta.label,
      'Prioritas': rec.hasilPrioritas,
      'RS Rujukan Tujuan': rec.tujuanRujukan,

      // Parameter Keputusan Algoritma
      'Dapat Berjalan?': rec.dapatBerjalan ? 'YA' : 'TIDAK',
      'Bernapas Spontan?': rec.bernapas === false ? (rec.bernapasSetelahAirway ? 'YA (Setelah Airway)' : 'TIDAK (Henti Napas)') : 'YA',
      'Frekuensi Napas (RR)': rec.frekuensiPernafasan ? `${rec.frekuensiPernafasan} x/m` : '-',
      'Kategori RR': rec.rrKategori || '-',
      'Nadi Radial Teraba?': rec.nadiRadialTeraba !== undefined ? (rec.nadiRadialTeraba ? 'YA' : 'TIDAK') : '-',
      'Capillary Refill (CRT)': rec.crt || '-',
      'Status Mental (AVPU)': rec.statusMentalAvpu || '-',

      // Dokumentasi Klinis
      'GCS Eye (E)': rec.gcs?.e ?? '-',
      'GCS Motorik (M)': rec.gcs?.m ?? '-',
      'GCS Verbal (V)': rec.gcs?.v ?? '-',
      'GCS Total (/15)': gcsTotal,
      'Skor Nyeri (/10)': rec.skorNyeri !== undefined ? rec.skorNyeri : '-',

      // Transcultural Nursing
      'Bahasa Dipahami': rec.transcultural?.bahasaDipahami ? 'YA' : 'TIDAK',
      'Sensitivitas Gender': rec.transcultural?.genderDiperhatikan ? 'YA' : 'TIDAK',
      'Respons Nyeri Empatik': rec.transcultural?.nyeriEkspresiDiperhatikan ? 'YA' : 'TIDAK',
      'Dukungan Keluarga': rec.transcultural?.dukunganKeluargaDilibatkan ? 'YA' : 'TIDAK',
      'Catatan Budaya': rec.transcultural?.catatan || '-',
      'Alasan / Catatan Klinis': rec.alasanKategori || '-',
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths automatically
  const colWidths = [
    { wch: 6 },  // No.
    { wch: 18 }, // No Kasus
    { wch: 25 }, // Nama Pasien
    { wch: 14 }, // Jenis Kelamin
    { wch: 14 }, // Bahasa
    { wch: 14 }, // Keadaan Khusus
    { wch: 30 }, // Lokasi
    { wch: 22 }, // Waktu Kejadian
    { wch: 12 }, // Sesi Waktu
    { wch: 24 }, // Petugas
    { wch: 22 }, // Kategori
    { wch: 10 }, // Prioritas
    { wch: 20 }, // RS Rujukan
    { wch: 15 }, // Dapat Berjalan
    { wch: 20 }, // Bernapas
    { wch: 18 }, // RR
    { wch: 14 }, // Kategori RR
    { wch: 18 }, // Nadi
    { wch: 18 }, // CRT
    { wch: 18 }, // AVPU
    { wch: 12 }, // GCS E
    { wch: 14 }, // GCS M
    { wch: 14 }, // GCS V
    { wch: 14 }, // GCS Total
    { wch: 16 }, // Nyeri
    { wch: 16 }, // TC Bahasa
    { wch: 18 }, // TC Gender
    { wch: 20 }, // TC Nyeri
    { wch: 18 }, // TC Keluarga
    { wch: 30 }, // TC Catatan
    { wch: 35 }, // Alasan Klinis
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Rekam Triase PSC 119');

  // File name
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const filename = customFilename || `TC-START-Data-Pasien-${dateStr}.xlsx`;

  // Trigger download in browser
  XLSX.writeFile(workbook, filename);
}
