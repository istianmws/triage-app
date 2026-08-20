import type { TriageAlgorithmInput, TriageResult, KategoriTriage, PrioritasTriage } from './types';

export const TRIAGE_METADATA: Record<KategoriTriage, {
  label: string;
  prioritas: PrioritasTriage;
  warnaHex: string;
  warnaBg: string;
  warnaBorder: string;
  warnaBadgeText: string;
  kriteriaKunci: string;
  rekomendasiTindakan: string;
}> = {
  merah: {
    label: 'MERAH / IMMEDIATE',
    prioritas: 1,
    warnaHex: '#DC2626',
    warnaBg: '#FEF2F2',
    warnaBorder: '#FCA5A5',
    warnaBadgeText: 'text-red-700 bg-red-100 border-red-300',
    kriteriaKunci: 'Tidak mampu berjalan; RR > 30x/menit; nadi radial tidak teraba/CRT > 2 detik; atau tidak dapat mengikuti perintah sederhana (P/U).',
    rekomendasiTindakan: 'Evakuasi & penanganan medis SEGERA ke RS Rujukan (Prioritas 1). Amankan jalan napas (Airway), berikan oksigenasi, kontrol perdarahan masif.',
  },
  kuning: {
    label: 'KUNING / DELAYED',
    prioritas: 2,
    warnaHex: '#D97706',
    warnaBg: '#FFFBEB',
    warnaBorder: '#FCD34D',
    warnaBadgeText: 'text-amber-700 bg-amber-100 border-amber-300',
    kriteriaKunci: 'Tidak mampu berjalan, namun laju pernapasan RR ≤ 30x/menit, perfusi adekuat (nadi teraba, CRT ≤ 2 detik), dan sadar/mampu ikuti perintah sederhana (A/V).',
    rekomendasiTindakan: 'Perawatan dapat ditunda sementara (Prioritas 2). Pantau ketat tanda-tanda vital secara berkala untuk deteksi perburukan (re-triage berkala).',
  },
  hijau: {
    label: 'HIJAU / MINOR',
    prioritas: 3,
    warnaHex: '#059669',
    warnaBg: '#ECFDF5',
    warnaBorder: '#6EE7B7',
    warnaBadgeText: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    kriteriaKunci: 'Pasien dapat berjalan sendiri ke arah petugas, laju napas & sirkulasi stabil, cedera minimal.',
    rekomendasiTindakan: 'Luka ringan/rawat jalan (Prioritas 3). Arahkan ke titik kumpul aman / puskesmas terdekat, berikan pertolongan pertama dasar & edukasi.',
  },
  hitam: {
    label: 'HITAM / EXPECTANT',
    prioritas: 4,
    warnaHex: '#1E293B',
    warnaBg: '#F1F5F9',
    warnaBorder: '#94A3B8',
    warnaBadgeText: 'text-slate-800 bg-slate-200 border-slate-400',
    kriteriaKunci: 'Tidak ada tanda napas spontan meski jalan napas telah dimanipulasi/dibuka (head tilt-chin lift/jaw thrust).',
    rekomendasiTindakan: 'Korban meninggal dunia / tidak dapat diselamatkan (Prioritas 4). Tempatkan di area terpisah/kantong jenazah, hormati nilai budaya/keluarga, utamakan korban yang masih hidup.',
  },
};

/**
 * Pure function to calculate TC-START Triage outcome based on official clinical flowchart
 */
export function hitungTriage(input: TriageAlgorithmInput): TriageResult {
  // STEP 1 — DAPAT BERJALAN?
  if (input.dapatBerjalan) {
    return {
      kategori: 'hijau',
      prioritas: 3,
      label: TRIAGE_METADATA.hijau.label,
      penjelasan: 'Pasien mampu berjalan mandiri ke arah petugas saat dipanggil.',
      kriteriaKunci: TRIAGE_METADATA.hijau.kriteriaKunci,
      rekomendasiTindakan: TRIAGE_METADATA.hijau.rekomendasiTindakan,
    };
  }

  // STEP 2 — BERNAPAS?
  if (input.bernapas === false) {
    if (input.bernapasSetelahAirway === true) {
      return {
        kategori: 'merah',
        prioritas: 1,
        label: TRIAGE_METADATA.merah.label,
        penjelasan: 'Pasien tidak bernapas spontan awal, tetapi mulai bernapas setelah jalan napas dibuka.',
        kriteriaKunci: TRIAGE_METADATA.merah.kriteriaKunci,
        rekomendasiTindakan: TRIAGE_METADATA.merah.rekomendasiTindakan,
      };
    } else {
      return {
        kategori: 'hitam',
        prioritas: 4,
        label: TRIAGE_METADATA.hitam.label,
        penjelasan: 'Pasien henti napas dan tidak ada tanda napas setelah jalan napas dibuka (Airway Maneuver).',
        kriteriaKunci: TRIAGE_METADATA.hitam.kriteriaKunci,
        rekomendasiTindakan: TRIAGE_METADATA.hitam.rekomendasiTindakan,
      };
    }
  }

  // Laju pernapasan (RR)
  const isHighRR = (input.frekuensiPernafasan !== undefined && input.frekuensiPernafasan > 30) || input.rrKategori === '>30';
  if (isHighRR) {
    return {
      kategori: 'merah',
      prioritas: 1,
      label: TRIAGE_METADATA.merah.label,
      penjelasan: `Frekuensi pernapasan sangat cepat (RR: ${input.frekuensiPernafasan ? input.frekuensiPernafasan + 'x/m' : '> 30x/menit'}).`,
      kriteriaKunci: TRIAGE_METADATA.merah.kriteriaKunci,
      rekomendasiTindakan: TRIAGE_METADATA.merah.rekomendasiTindakan,
    };
  }

  // STEP 3 — PERFUSI (Nadi Radial & CRT)
  const nadiTeraba = input.nadiRadialTeraba !== false;
  const crtNormal = input.crt !== '>2s';
  const perfusiAdekuat = nadiTeraba && crtNormal;

  if (!perfusiAdekuat) {
    const alasan = !nadiTeraba ? 'Nadi radial tidak teraba' : 'Capillary Refill Time (CRT) > 2 detik (perfusi buruk)';
    return {
      kategori: 'merah',
      prioritas: 1,
      label: TRIAGE_METADATA.merah.label,
      penjelasan: `Gangguan sirkulasi/perfusi jaringan: ${alasan}.`,
      kriteriaKunci: TRIAGE_METADATA.merah.kriteriaKunci,
      rekomendasiTindakan: TRIAGE_METADATA.merah.rekomendasiTindakan,
    };
  }

  // STEP 4 — STATUS MENTAL (AVPU)
  const statusAvpu = input.statusMentalAvpu || 'A';
  if (statusAvpu === 'P' || statusAvpu === 'U') {
    return {
      kategori: 'merah',
      prioritas: 1,
      label: TRIAGE_METADATA.merah.label,
      penjelasan: `Penurunan kesadaran berat (AVPU: ${statusAvpu === 'P' ? 'Pain / Hanya respons nyeri' : 'Unresponsive / Tidak responsif'}).`,
      kriteriaKunci: TRIAGE_METADATA.merah.kriteriaKunci,
      rekomendasiTindakan: TRIAGE_METADATA.merah.rekomendasiTindakan,
    };
  }

  // Jika sadar (A atau V) dan parameter sebelumnya aman
  return {
    kategori: 'kuning',
    prioritas: 2,
    label: TRIAGE_METADATA.kuning.label,
    penjelasan: 'Pasien tidak mampu berjalan, tetapi pernapasan stabil (RR ≤ 30), perfusi adekuat, dan dapat merespons perintah sederhana.',
    kriteriaKunci: TRIAGE_METADATA.kuning.kriteriaKunci,
    rekomendasiTindakan: TRIAGE_METADATA.kuning.rekomendasiTindakan,
  };
}
