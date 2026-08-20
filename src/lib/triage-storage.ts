import type { TriageRecord, TriageFilterOptions } from './types';
import { hitungTriage } from './triage-algorithm';

const STORAGE_KEY = 'tc_start_triage_records';
const OFFICER_KEY = 'tc_start_officer_name';
const UNIT_KEY = 'tc_start_unit_name';

/**
 * Generate No. Kasus with format TCS-YYYYMMDD-XXX
 */
export function generateNoKasus(existingCount = 0): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const index = String(existingCount + 1).padStart(3, '0');
  return `TCS-${year}${month}${day}-${index}`;
}

export function determineWaktuKategori(date: Date = new Date()): 'pagi' | 'siang' | 'malam' | 'dini_hari' {
  const hours = date.getHours();
  if (hours >= 5 && hours < 11) return 'pagi';
  if (hours >= 11 && hours < 15) return 'siang';
  if (hours >= 15 && hours < 21) return 'malam';
  return 'dini_hari';
}

const INITIAL_SEEDS: TriageRecord[] = [
  {
    id: 'seed-001',
    noKasus: 'TCS-20260820-001',
    namaPasien: 'Ny. Siti Aminah (48 th)',
    namaPetugas: 'Ahmad S., Ners - PSC 119',
    lokasiKejadian: 'Simpang Tiga Jl. Pemuda, Magelang',
    waktuKejadian: new Date(Date.now() - 3600000 * 2).toISOString(),
    waktuKategori: 'pagi',
    bahasa: 'jawa',
    jenisKelamin: 'perempuan',
    keadaanKhusus: 'tidak_ada',
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 34,
    rrKategori: '>30',
    nadiRadialTeraba: true,
    crt: '<=2s',
    statusMentalAvpu: 'A',
    gcs: { e: 3, m: 6, v: 4, total: 13 },
    skorNyeri: 8,
    transcultural: {
      bahasaDipahami: true,
      genderDiperhatikan: true,
      nyeriEkspresiDiperhatikan: true,
      dukunganKeluargaDilibatkan: true,
      catatan: 'Pasien lebih nyaman berkomunikasi dengan bahasa Jawa halus (Kromo Inggil). Suami mendampingi di ambulans.',
    },
    hasilKategori: 'merah',
    hasilPrioritas: 1,
    alasanKategori: 'Frekuensi pernapasan sangat cepat (RR: 34x/menit > 30x/m).',
    tujuanRujukan: 'RSU Tidar',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-002',
    noKasus: 'TCS-20260820-002',
    namaPasien: 'Tn. Joko Prakoso (32 th)',
    namaPetugas: 'Ahmad S., Ners - PSC 119',
    lokasiKejadian: 'Jl. Ahmad Yani No. 45',
    waktuKejadian: new Date(Date.now() - 3600000 * 4).toISOString(),
    waktuKategori: 'pagi',
    bahasa: 'indonesia',
    jenisKelamin: 'laki-laki',
    keadaanKhusus: 'tidak_ada',
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 20,
    rrKategori: '<=30',
    nadiRadialTeraba: true,
    crt: '<=2s',
    statusMentalAvpu: 'A',
    gcs: { e: 4, m: 6, v: 5, total: 15 },
    skorNyeri: 5,
    transcultural: {
      bahasaDipahami: true,
      genderDiperhatikan: true,
      nyeriEkspresiDiperhatikan: true,
      dukunganKeluargaDilibatkan: false,
      catatan: 'Fraktur tertutup radius ulna dekstra, hemodinamik stabil.',
    },
    hasilKategori: 'kuning',
    hasilPrioritas: 2,
    alasanKategori: 'Tidak mampu berjalan, namun pernapasan stabil (RR: 20), perfusi baik, sadar penuh (Alert).',
    tujuanRujukan: 'RST Soedjono',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'seed-003',
    noKasus: 'TCS-20260820-003',
    namaPasien: 'Sdr. Dimas Wahyu (21 th)',
    namaPetugas: 'Rina P., Amd.Kep - PSC 119',
    lokasiKejadian: 'Area Pasar Rejowinangun',
    waktuKejadian: new Date(Date.now() - 3600000 * 6).toISOString(),
    waktuKategori: 'pagi',
    bahasa: 'indonesia',
    jenisKelamin: 'laki-laki',
    keadaanKhusus: 'tidak_ada',
    dapatBerjalan: true,
    transcultural: {
      bahasaDipahami: true,
      genderDiperhatikan: true,
      nyeriEkspresiDiperhatikan: true,
      dukunganKeluargaDilibatkan: false,
      catatan: 'Luka lecet di siku dan lutut, orientasi baik.',
    },
    hasilKategori: 'hijau',
    hasilPrioritas: 3,
    alasanKategori: 'Pasien dapat berjalan mandiri saat dipanggil petugas.',
    tujuanRujukan: 'RS Harapan',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export function getTriageRecords(filter?: TriageFilterOptions): TriageRecord[] {
  let records: TriageRecord[] = INITIAL_SEEDS;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        records = JSON.parse(raw);
      } else {
        records = INITIAL_SEEDS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
      }
    } catch (err) {
      console.error('Error reading triage records from localStorage:', err);
      records = INITIAL_SEEDS;
    }
  }

  if (!filter) {
    return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return [...records]
    .filter((rec) => {
      // Filter nama pasien / no kasus / lokasi
      if (filter.namaPasien && filter.namaPasien.trim()) {
        const query = filter.namaPasien.toLowerCase().trim();
        const matchName = rec.namaPasien.toLowerCase().includes(query);
        const matchNo = rec.noKasus.toLowerCase().includes(query);
        const matchLoc = rec.lokasiKejadian.toLowerCase().includes(query);
        if (!matchName && !matchNo && !matchLoc) return false;
      }

      // Filter kategori
      if (filter.kategori && filter.kategori !== 'semua') {
        if (rec.hasilKategori !== filter.kategori) return false;
      }

      // Filter dari tanggal
      if (filter.dariTanggal) {
        const recDate = new Date(rec.waktuKejadian).toISOString().split('T')[0];
        if (recDate < filter.dariTanggal) return false;
      }

      // Filter sampai tanggal
      if (filter.sampaiTanggal) {
        const recDate = new Date(rec.waktuKejadian).toISOString().split('T')[0];
        if (recDate > filter.sampaiTanggal) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTriageById(id: string): TriageRecord | null {
  const records = getTriageRecords();
  return records.find((r) => r.id === id || r.noKasus === id) || null;
}

export function saveTriageRecord(recordData: Omit<TriageRecord, 'id' | 'noKasus' | 'hasilKategori' | 'hasilPrioritas' | 'createdAt'> & { id?: string; noKasus?: string }): TriageRecord {
  const records = getTriageRecords();
  
  // Calculate triage result from algorithm
  const result = hitungTriage({
    dapatBerjalan: recordData.dapatBerjalan,
    bernapas: recordData.bernapas,
    bernapasSetelahAirway: recordData.bernapasSetelahAirway,
    frekuensiPernafasan: recordData.frekuensiPernafasan,
    rrKategori: recordData.rrKategori,
    nadiRadialTeraba: recordData.nadiRadialTeraba,
    crt: recordData.crt,
    statusMentalAvpu: recordData.statusMentalAvpu,
  });

  const now = new Date().toISOString();
  const id = recordData.id || `tcs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const noKasus = recordData.noKasus || generateNoKasus(records.length);

  const fullRecord: TriageRecord = {
    ...recordData,
    id,
    noKasus,
    hasilKategori: result.kategori,
    hasilPrioritas: result.prioritas,
    alasanKategori: result.penjelasan,
    createdAt: now,
  };

  if (typeof window !== 'undefined') {
    const updated = [fullRecord, ...records.filter((r) => r.id !== id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return fullRecord;
}

export function getSavedOfficerName(): string {
  if (typeof window === 'undefined') return 'Petugas PSC 119';
  return localStorage.getItem(OFFICER_KEY) || 'Petugas PSC 119';
}

export function setSavedOfficerName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(OFFICER_KEY, name);
  }
}

export function getSavedUnitName(): string {
  if (typeof window === 'undefined') return 'PSC 119 Garda Waluyo';
  return localStorage.getItem(UNIT_KEY) || 'PSC 119 Garda Waluyo';
}

export function setSavedUnitName(unit: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(UNIT_KEY, unit);
  }
}
