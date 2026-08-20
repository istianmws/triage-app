export type KategoriTriage = 'merah' | 'kuning' | 'hijau' | 'hitam';
export type PrioritasTriage = 1 | 2 | 3 | 4;

export type KategoriWaktu = 'pagi' | 'siang' | 'malam' | 'dini_hari';
export type BahasaPasien = 'indonesia' | 'jawa' | 'madura' | 'sunda' | 'inggris';
export type JenisKelamin = 'laki-laki' | 'perempuan';
export type KeadaanKhusus = 'tidak_ada' | 'difabel';
export type CrtValue = '<=2s' | '>2s';
export type AvpuValue = 'A' | 'V' | 'P' | 'U';

export interface GcsScore {
  e?: number; // 1-4 Eye
  m?: number; // 1-6 Motor
  v?: number; // 1-5 Verbal
  total?: number; // 3-15
}

export interface TransculturalAssessment {
  bahasaDipahami: boolean;
  genderDiperhatikan: boolean;
  nyeriEkspresiDiperhatikan: boolean;
  dukunganKeluargaDilibatkan: boolean;
  catatan?: string;
}

export interface TriageAlgorithmInput {
  dapatBerjalan: boolean;
  bernapas?: boolean;
  bernapasSetelahAirway?: boolean;
  frekuensiPernafasan?: number; // x/menit
  rrKategori?: '<=30' | '>30';
  nadiRadialTeraba?: boolean;
  crt?: CrtValue;
  statusMentalAvpu?: AvpuValue;
}

export interface TriageResult {
  kategori: KategoriTriage;
  prioritas: PrioritasTriage;
  label: string;
  penjelasan: string;
  kriteriaKunci: string;
  rekomendasiTindakan: string;
}

export interface TriageRecord {
  id: string;
  noKasus: string; // TCS-YYYYMMDD-XXX

  // Bagian A: Identitas & Konteks
  namaPasien: string;
  namaPetugas: string;
  lokasiKejadian: string;
  waktuKejadian: string; // ISO datetime
  waktuKategori: KategoriWaktu;
  bahasa: BahasaPasien;
  jenisKelamin: JenisKelamin;
  keadaanKhusus: KeadaanKhusus;

  // Bagian B: Alur Algoritma
  dapatBerjalan: boolean;
  bernapas?: boolean;
  bernapasSetelahAirway?: boolean;
  frekuensiPernafasan?: number;
  rrKategori?: '<=30' | '>30';
  nadiRadialTeraba?: boolean;
  crt?: CrtValue;
  statusMentalAvpu?: AvpuValue;

  // Bagian C: Dokumentasi Klinis
  gcs?: GcsScore;
  skorNyeri?: number;

  // Bagian D: Asesmen Transcultural
  transcultural: TransculturalAssessment;

  // Bagian E: Hasil & Rujukan
  hasilKategori: KategoriTriage;
  hasilPrioritas: PrioritasTriage;
  alasanKategori?: string;
  tujuanRujukan: string;

  createdAt: string;
}

export interface TriageFilterOptions {
  namaPasien?: string;
  dariTanggal?: string;
  sampaiTanggal?: string;
  kategori?: KategoriTriage | 'semua';
}
