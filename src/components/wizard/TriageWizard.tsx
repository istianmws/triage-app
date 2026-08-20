import React, { useState, useEffect, useRef } from 'react';
import type {
  KategoriTriage,
  BahasaPasien,
  JenisKelamin,
  KeadaanKhusus,
  KategoriWaktu,
  CrtValue,
  AvpuValue,
  TriageRecord,
} from '../../lib/types';
import { hitungTriage } from '../../lib/triage-algorithm';
import {
  saveTriageRecord,
  getSavedOfficerName,
  setSavedOfficerName,
  determineWaktuKategori,
  generateNoKasus,
} from '../../lib/triage-storage';
import { HasilBadge } from '../HasilBadge';
import {
  Activity,
  HeartPulse,
  User,
  MapPin,
  Clock,
  Globe2,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  Hospital,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TriageWizard: React.FC = () => {
  // Navigation step state
  // Steps: 'identitas' | 'algoritma' | 'klinis' | 'transcultural' | 'rujukan'
  const [currentStep, setCurrentStep] = useState<
    'identitas' | 'algoritma' | 'klinis' | 'transcultural' | 'rujukan'
  >('identitas');

  // Sub-step inside algoritma: 1 (Jalan) | 2 (Napas/RR) | 3 (Perfusi) | 4 (AVPU)
  const [algoSubStep, setAlgoSubStep] = useState<number>(1);

  // Bagian A State
  const [namaPasien, setNamaPasien] = useState('');
  const [namaPetugas, setNamaPetugas] = useState('');
  const [lokasiKejadian, setLokasiKejadian] = useState('');
  const [waktuKejadian, setWaktuKejadian] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [waktuKategori, setWaktuKategori] = useState<KategoriWaktu>('pagi');
  const [bahasa, setBahasa] = useState<BahasaPasien>('indonesia');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('laki-laki');
  const [keadaanKhusus, setKeadaanKhusus] = useState<KeadaanKhusus>('tidak_ada');

  // Bagian B State (Algoritma)
  const [dapatBerjalan, setDapatBerjalan] = useState<boolean | null>(null);
  const [bernapas, setBernapas] = useState<boolean | null>(null);
  const [bernapasSetelahAirway, setBernapasSetelahAirway] = useState<boolean | null>(null);
  const [frekuensiPernafasan, setFrekuensiPernafasan] = useState<number>(18);
  const [rrKategori, setRrKategori] = useState<'<=30' | '>30'>('<=30');
  const [nadiRadialTeraba, setNadiRadialTeraba] = useState<boolean | null>(null);
  const [crt, setCrt] = useState<CrtValue>('<=2s');
  const [statusMentalAvpu, setStatusMentalAvpu] = useState<AvpuValue>('A');

  // Timer 15s helper state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [tapBreaths, setTapBreaths] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  // Bagian C State (Dokumentasi Klinis)
  const [gcsE, setGcsE] = useState<number>(4);
  const [gcsM, setGcsM] = useState<number>(6);
  const [gcsV, setGcsV] = useState<number>(5);
  const [skorNyeri, setSkorNyeri] = useState<number>(2);

  // Bagian D State (Transcultural)
  const [bahasaDipahami, setBahasaDipahami] = useState(true);
  const [genderDiperhatikan, setGenderDiperhatikan] = useState(true);
  const [nyeriEkspresiDiperhatikan, setNyeriEkspresiDiperhatikan] = useState(true);
  const [dukunganKeluargaDilibatkan, setDukunganKeluargaDilibatkan] = useState(false);
  const [catatanTranscultural, setCatatanTranscultural] = useState('');

  // Bagian E State (Rujukan)
  const [tujuanRujukan, setTujuanRujukan] = useState('RSU Tidar');
  const [customRujukan, setCustomRujukan] = useState('');

  // Auto load officer name & auto update time category
  useEffect(() => {
    setNamaPetugas(getSavedOfficerName());
    setWaktuKategori(determineWaktuKategori(new Date()));
  }, []);

  // Update time category whenever datetime picker changes
  const handleWaktuChange = (val: string) => {
    setWaktuKejadian(val);
    if (val) {
      setWaktuKategori(determineWaktuKategori(new Date(val)));
    }
  };

  // Timer logic for 15s respiratory rate count
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  const startTimer = () => {
    setTimerSeconds(15);
    setTapBreaths(0);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(15);
    setTapBreaths(0);
  };

  const handleTapBreath = () => {
    const updated = tapBreaths + 1;
    setTapBreaths(updated);
    const estimatedRR = updated * 4; // 15 detik x 4 = 60 detik (1 menit)
    setFrekuensiPernafasan(estimatedRR);
    setRrKategori(estimatedRR > 30 ? '>30' : '<=30');
  };

  // Live calculation of current triage result
  const calculatedResult = hitungTriage({
    dapatBerjalan: dapatBerjalan ?? false,
    bernapas: bernapas ?? undefined,
    bernapasSetelahAirway: bernapasSetelahAirway ?? undefined,
    frekuensiPernafasan: frekuensiPernafasan,
    rrKategori: rrKategori,
    nadiRadialTeraba: nadiRadialTeraba ?? undefined,
    crt: crt,
    statusMentalAvpu: statusMentalAvpu,
  });

  // Calculate GCS Total
  const gcsTotal = gcsE + gcsM + gcsV;

  // Validation
  const isIdentitasValid = namaPasien.trim() !== '' && lokasiKejadian.trim() !== '';

  const handleNextFromIdentitas = () => {
    if (!isIdentitasValid) {
      alert('Mohon lengkapi Nama Pasien dan Lokasi Kejadian terlebih dahulu.');
      return;
    }
    if (namaPetugas) {
      setSavedOfficerName(namaPetugas);
    }
    setCurrentStep('algoritma');
    setAlgoSubStep(1);
  };

  // Submit and save record
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRujukan = tujuanRujukan === 'Lainnya' ? customRujukan || 'RS Lainnya' : tujuanRujukan;

    const newRecord = saveTriageRecord({
      namaPasien,
      namaPetugas: namaPetugas || 'Petugas PSC 119',
      lokasiKejadian,
      waktuKejadian: new Date(waktuKejadian).toISOString(),
      waktuKategori,
      bahasa,
      jenisKelamin,
      keadaanKhusus,
      dapatBerjalan: dapatBerjalan ?? false,
      bernapas: bernapas ?? undefined,
      bernapasSetelahAirway: bernapasSetelahAirway ?? undefined,
      frekuensiPernafasan,
      rrKategori,
      nadiRadialTeraba: nadiRadialTeraba ?? undefined,
      crt,
      statusMentalAvpu,
      gcs: {
        e: gcsE,
        m: gcsM,
        v: gcsV,
        total: gcsTotal,
      },
      skorNyeri,
      transcultural: {
        bahasaDipahami,
        genderDiperhatikan,
        nyeriEkspresiDiperhatikan,
        dukunganKeluargaDilibatkan,
        catatan: catatanTranscultural,
      },
      tujuanRujukan: finalRujukan,
    });

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    // Redirect to result page
    setTimeout(() => {
      window.location.href = `/triage/hasil/${newRecord.id}`;
    }, 400);
  };

  const stepsList = [
    { id: 'identitas', label: '1. Identitas' },
    { id: 'algoritma', label: '2. Algoritma START' },
    { id: 'klinis', label: '3. Data Klinis' },
    { id: 'transcultural', label: '4. Transcultural' },
    { id: 'rujukan', label: '5. Rujukan & Simpan' },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-red-700/15 mb-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2">
              <Activity className="w-3.5 h-3.5" /> Wizard Triase Prehospital
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Formulir Triase TC-START</h1>
            <p className="text-sm text-red-100 mt-1">
              Panduan klinis terstruktur cepat dengan pendekatan Transcultural Nursing
            </p>
          </div>
          <div className="text-left sm:text-right bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <span className="text-[11px] uppercase font-bold text-red-200 block">Preview No. Kasus</span>
            <span className="font-mono text-sm font-black text-white">{generateNoKasus(0)}</span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-2 overflow-x-auto pb-1 text-xs font-semibold">
            {stepsList.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (idx <= currentStepIndex || isIdentitasValid) {
                    setCurrentStep(step.id as any);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  currentStep === step.id
                    ? 'bg-white text-red-700 font-extrabold shadow-sm'
                    : idx < currentStepIndex
                    ? 'text-white/90 hover:bg-white/10'
                    : 'text-white/40'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300 rounded-full shadow-sm"
              style={{ width: `${((currentStepIndex + 1) / stepsList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8">
        {/* ============================================================ */}
        {/* STEP A: IDENTITAS & KONTEKS */}
        {/* ============================================================ */}
        {currentStep === 'identitas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-red-600" /> Bagian A: Data Identitas & Konteks Lapangan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Lengkapi identitas pasien dan kondisi awal sebelum memulai alur algoritma triage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Pasien */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Nama Pasien / Label Korban <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ny. Siti Aminah (atau Mr. X jika tanpa identitas)"
                  value={namaPasien}
                  onChange={(e) => setNamaPasien(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                />
              </div>

              {/* Nama Petugas */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Nama Petugas PSC 119 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama & Gelar Petugas"
                  value={namaPetugas}
                  onChange={(e) => setNamaPetugas(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                />
              </div>

              {/* Lokasi Kejadian */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Lokasi / TKP Kejadian <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Pemuda No. 12, Magelang"
                    value={lokasiKejadian}
                    onChange={(e) => setLokasiKejadian(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Waktu Kejadian */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Waktu Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={waktuKejadian}
                  onChange={(e) => handleWaktuChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                />
              </div>

              {/* Sesi Waktu */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Sesi Waktu (Auto / Bisa Diubah)
                </label>
                <select
                  value={waktuKategori}
                  onChange={(e) => setWaktuKategori(e.target.value as KategoriWaktu)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none bg-white capitalize"
                >
                  <option value="pagi">Pagi (05:00 - 11:00)</option>
                  <option value="siang">Siang (11:00 - 15:00)</option>
                  <option value="malam">Malam (15:00 - 21:00)</option>
                  <option value="dini_hari">Dini Hari (21:00 - 05:00)</option>
                </select>
              </div>

              {/* Bahasa Pasien */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Bahasa Utama Pasien
                </label>
                <select
                  value={bahasa}
                  onChange={(e) => setBahasa(e.target.value as BahasaPasien)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none bg-white capitalize"
                >
                  <option value="indonesia">Bahasa Indonesia</option>
                  <option value="jawa">Bahasa Jawa</option>
                  <option value="madura">Bahasa Madura</option>
                  <option value="sunda">Bahasa Sunda</option>
                  <option value="inggris">Bahasa Inggris / Asing</option>
                </select>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Jenis Kelamin Pasien
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisKelamin('laki-laki')}
                    className={`py-3 px-4 rounded-2xl border text-sm font-bold transition flex items-center justify-center gap-2 ${
                      jenisKelamin === 'laki-laki'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisKelamin('perempuan')}
                    className={`py-3 px-4 rounded-2xl border text-sm font-bold transition flex items-center justify-center gap-2 ${
                      jenisKelamin === 'perempuan'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              {/* Keadaan Khusus */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                  Keadaan Khusus Pasien
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeadaanKhusus('tidak_ada')}
                    className={`py-3 px-4 rounded-2xl border text-sm font-bold transition ${
                      keadaanKhusus === 'tidak_ada'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Tidak Ada / Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeadaanKhusus('difabel')}
                    className={`py-3 px-4 rounded-2xl border text-sm font-bold transition ${
                      keadaanKhusus === 'difabel'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Difabel / Kebutuhan Khusus
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Continue */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleNextFromIdentitas}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-500/25 transition text-base"
              >
                Mulai Alur Algoritma START <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP B: ALUR ALGORITMA START (BERCABANG) */}
        {/* ============================================================ */}
        {currentStep === 'algoritma' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sub-step 1: Dapat Berjalan? */}
            {algoSubStep === 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-xs uppercase font-black tracking-wider text-emerald-800">
                    STEP 1 — UJI MOBILISASI (DAPAT BERJALAN)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Apakah pasien mampu berjalan ke arah petugas?
                  </h3>
                  <p className="text-sm text-emerald-900 mt-1 italic">
                    Instruksi Lapangan: "Siapa yang dapat mendengar suara saya dan bisa berjalan, silakan berdiri dan
                    berjalan ke arah saya."
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDapatBerjalan(true);
                    }}
                    className={`p-6 rounded-3xl border-2 text-left transition flex flex-col justify-between h-40 ${
                      dapatBerjalan === true
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-100'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                        ✓
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                        HIJAU / MINOR
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">YA, Mampu Berjalan</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pasien berdiri & berjalan mandiri (Prioritas 3 - Hijau).
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDapatBerjalan(false);
                      setAlgoSubStep(2);
                    }}
                    className={`p-6 rounded-3xl border-2 text-left transition flex flex-col justify-between h-40 ${
                      dapatBerjalan === false
                        ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/10 ring-4 ring-red-100'
                        : 'border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-black">
                        ✗
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-red-100 text-red-800">
                        LANJUT STEP 2
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">TIDAK Mampu Berjalan</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pasien terbaring / tidak dapat bangkit. Lanjut cek pernapasan.
                      </p>
                    </div>
                  </button>
                </div>

                {dapatBerjalan === true && (
                  <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                      <div className="text-xs sm:text-sm text-emerald-900">
                        <strong>Hasil Algoritma: HIJAU / MINOR (Prioritas 3).</strong> Pasien dapat langsung
                        diselesaikan atau lengkapi dokumentasi klinis & rujukan.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('klinis')}
                      className="px-5 py-2.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md text-xs sm:text-sm whitespace-nowrap"
                    >
                      Lanjut ke Dokumentasi &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sub-step 2: Pernapasan & Laju RR */}
            {algoSubStep === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                  <span className="text-xs uppercase font-black tracking-wider text-red-800">
                    STEP 2 — PEMERIKSAAN PERNAPASAN (AIRWAY & BREATHING)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Apakah pasien bernapas secara spontan?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBernapas(true);
                      setBernapasSetelahAirway(null);
                    }}
                    className={`p-5 rounded-2xl border-2 text-left transition ${
                      bernapas === true
                        ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-black text-slate-900 block">YA, Pasien Bernapas</span>
                    <span className="text-xs text-slate-500">Hitung laju pernapasan (RR) selama 15 detik.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBernapas(false);
                    }}
                    className={`p-5 rounded-2xl border-2 text-left transition ${
                      bernapas === false
                        ? 'border-red-500 bg-red-50 ring-4 ring-red-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-black text-slate-900 block">TIDAK Bernapas (Apnea)</span>
                    <span className="text-xs text-slate-500">Perlu tindakan buka jalan napas (Head tilt-chin lift).</span>
                  </button>
                </div>

                {/* Percabangan jika TIDAK bernapas: Airway Maneuver */}
                {bernapas === false && (
                  <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-red-400">
                        TINDAKAN: BUKA JALAN NAPAS (HEAD TILT - CHIN LIFT / JAW THRUST)
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        Setelah jalan napas dibuka/dibersihkan, apakah pasien mulai bernapas?
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBernapasSetelahAirway(true);
                        }}
                        className={`p-4 rounded-xl border text-left transition ${
                          bernapasSetelahAirway === true
                            ? 'border-red-400 bg-red-600/30 text-white ring-2 ring-red-400'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-bold text-sm block">YA, Bernapas Kembali</span>
                        <span className="text-xs opacity-80">Kategori: 🔴 MERAH / IMMEDIATE (Prioritas 1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBernapasSetelahAirway(false);
                        }}
                        className={`p-4 rounded-xl border text-left transition ${
                          bernapasSetelahAirway === false
                            ? 'border-slate-400 bg-slate-700 text-white ring-2 ring-slate-400'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-bold text-sm block">TETAP TIDAK Bernapas</span>
                        <span className="text-xs opacity-80">Kategori: ⚫ HITAM / EXPECTANT (Prioritas 4)</span>
                      </button>
                    </div>

                    {bernapasSetelahAirway !== null && (
                      <div className="pt-3 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('klinis')}
                          className="px-6 py-2.5 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 text-sm"
                        >
                          Lanjut ke Dokumentasi &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Jika YA bernapas: Penghitungan RR (Laju Pernapasan) */}
                {bernapas === true && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Penilaian Frekuensi Pernapasan (RR)
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          Berapa laju pernapasan per menit (x/menit)?
                        </h4>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-black px-3 py-1 rounded-full ${
                            frekuensiPernafasan > 30 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {frekuensiPernafasan} x/menit ({frekuensiPernafasan > 30 ? '> 30x/m (Merah)' : '≤ 30x/m (Stabil)'})
                        </span>
                      </div>
                    </div>

                    {/* Interactive 15-second Timer Widget */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                            timerRunning
                              ? 'bg-red-600 text-white animate-pulse'
                              : timerSeconds === 0
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {timerSeconds}s
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-700">Helper Timer 15 Detik</div>
                          <div className="text-xs text-slate-500">
                            {timerRunning
                              ? 'Tap tombol di samping setiap pasien menarik napas!'
                              : timerSeconds === 0
                              ? `Selesai! Terhitung ${tapBreaths} tarikan napas = ~${tapBreaths * 4} x/m`
                              : 'Hitung napas 15 detik lalu kalikan 4'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!timerRunning ? (
                          <button
                            type="button"
                            onClick={startTimer}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                          >
                            <Play className="w-3.5 h-3.5" /> Mulai 15s
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleTapBreath}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-black bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-md shadow-red-500/20"
                          >
                            TAP NAPAS ({tapBreaths})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={resetTimer}
                          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Manual RR Input Slider & Quick Buckets */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={frekuensiPernafasan}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setFrekuensiPernafasan(val);
                            setRrKategori(val > 30 ? '>30' : '<=30');
                          }}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="80"
                          value={frekuensiPernafasan}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setFrekuensiPernafasan(val);
                            setRrKategori(val > 30 ? '>30' : '<=30');
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-center text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFrekuensiPernafasan(20);
                            setRrKategori('<=30');
                            setAlgoSubStep(3);
                          }}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition text-left ${
                            rrKategori === '<=30' && frekuensiPernafasan <= 30
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="block">RR ≤ 30x / menit</span>
                          <span className="text-xs font-normal text-slate-500">Lanjut cek perfusi (Step 3)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFrekuensiPernafasan(36);
                            setRrKategori('>30');
                          }}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition text-left ${
                            rrKategori === '>30' || frekuensiPernafasan > 30
                              ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="block">RR &gt; 30x / menit (Takipnea)</span>
                          <span className="text-xs font-normal text-slate-500">Kategori: 🔴 MERAH / IMMEDIATE</span>
                        </button>
                      </div>
                    </div>

                    {frekuensiPernafasan > 30 && (
                      <div className="p-4 bg-red-100 rounded-xl border border-red-300 text-xs sm:text-sm text-red-900 flex items-center justify-between">
                        <span>
                          <strong>Kesimpulan:</strong> Laju napas &gt; 30x/menit mengindikasikan distres napas berat
                          (MERAH).
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('klinis')}
                          className="px-4 py-2 rounded-xl font-bold bg-red-600 text-white text-xs whitespace-nowrap hover:bg-red-700"
                        >
                          Lanjut Dokumentasi &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Substep navigation buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAlgoSubStep(1)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali ke Step 1
                  </button>

                  {bernapas === true && frekuensiPernafasan <= 30 && (
                    <button
                      type="button"
                      onClick={() => setAlgoSubStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 text-sm"
                    >
                      Lanjut ke Step 3: Perfusi <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sub-step 3: Perfusi (Nadi Radial & CRT) */}
            {algoSubStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-xs uppercase font-black tracking-wider text-amber-800">
                    STEP 3 — EVALUASI PERFUSI (SIRKULASI)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Nilai Nadi Radial & Capillary Refill Time (CRT)
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900 mt-1">
                    Perfusi adekuat jika nadi radial teraba DAN pengisian kapiler (CRT) ≤ 2 detik.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                      1. Perabaan Nadi Radial (Pergelangan Tangan)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNadiRadialTeraba(true)}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
                          nadiRadialTeraba === true
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        ✓ Teraba Kuat / Jelas
                      </button>
                      <button
                        type="button"
                        onClick={() => setNadiRadialTeraba(false)}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
                          nadiRadialTeraba === false
                            ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        ✗ TIDAK Teraba / Lemah
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                      2. Capillary Refill Time (CRT pada Bantalan Kuku)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCrt('<=2s')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
                          crt === '<=2s'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        ≤ 2 Detik (Normal)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCrt('>2s')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition ${
                          crt === '>2s'
                            ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        &gt; 2 Detik (Memanjang / Syok)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Outcome indicator */}
                {nadiRadialTeraba !== null && (
                  <div>
                    {nadiRadialTeraba === false || crt === '>2s' ? (
                      <div className="p-4 bg-red-100 rounded-2xl border border-red-300 text-xs sm:text-sm text-red-900 flex items-center justify-between">
                        <span>
                          <strong>Perfusi TIDAK Adekuat:</strong> Nadi tidak teraba atau CRT &gt; 2 detik (Syok /
                          Hipovolemia) &rarr; 🔴 <strong>MERAH / IMMEDIATE</strong>.
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('klinis')}
                          className="px-4 py-2 rounded-xl font-bold bg-red-600 text-white text-xs whitespace-nowrap hover:bg-red-700"
                        >
                          Lanjut Dokumentasi &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-100 rounded-2xl border border-emerald-300 text-xs sm:text-sm text-emerald-900 flex items-center justify-between">
                        <span>
                          <strong>Perfusi Adekuat:</strong> Nadi teraba dan CRT ≤ 2 detik. Lanjut ke Step 4 (Status
                          Mental).
                        </span>
                        <button
                          type="button"
                          onClick={() => setAlgoSubStep(4)}
                          className="px-4 py-2 rounded-xl font-bold bg-emerald-700 text-white text-xs whitespace-nowrap hover:bg-emerald-800"
                        >
                          Lanjut ke Step 4 &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAlgoSubStep(2)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali ke Step 2
                  </button>
                </div>
              </div>
            )}

            {/* Sub-step 4: Status Mental (AVPU) */}
            {algoSubStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-xs uppercase font-black tracking-wider text-blue-800">
                    STEP 4 — STATUS MENTAL & KESADARAN (SKALA AVPU)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Apakah pasien dapat mengikuti perintah sederhana?
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-900 mt-1">
                    Instruksi: "Buka mata Anda", "Pegang tangan saya", atau "Sebutkan nama Anda".
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatusMentalAvpu('A')}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      statusMentalAvpu === 'A'
                        ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">A — Alert (Sadar Penuh)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">KUNING</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Spontan sadar, orientasi baik, mampu ikuti perintah sederhana.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusMentalAvpu('V')}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      statusMentalAvpu === 'V'
                        ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">V — Verbal (Respons Suara)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">KUNING</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Merespons panggilan suara / perintah sederhana saat diajak bicara.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusMentalAvpu('P')}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      statusMentalAvpu === 'P'
                        ? 'border-red-500 bg-red-50 ring-4 ring-red-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">P — Pain (Hanya Respons Nyeri)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-200 text-red-900 font-bold">MERAH</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Tidak ikuti perintah, hanya bereaksi saat rangsang nyeri trapezius/sternal.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusMentalAvpu('U')}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      statusMentalAvpu === 'U'
                        ? 'border-red-500 bg-red-50 ring-4 ring-red-100'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">U — Unresponsive (Koma / Tidak Sadar)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-200 text-red-900 font-bold">MERAH</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Sama sekali tidak merespons suara maupun rangsang nyeri.
                    </span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-slate-800">
                    Hasil Status Mental: <strong>{statusMentalAvpu === 'A' || statusMentalAvpu === 'V' ? '🟡 KUNING / DELAYED' : '🔴 MERAH / IMMEDIATE'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('klinis')}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm"
                  >
                    Lanjut ke Dokumentasi Klinis &rarr;
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAlgoSubStep(3)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali ke Step 3
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP C: DOKUMENTASI KLINIS (GCS & NYERI) */}
        {/* ============================================================ */}
        {currentStep === 'klinis' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600" /> Bagian C: Dokumentasi Klinis Tambahan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Untuk data serah terima medis di RS Rujukan (tidak mengubah kalkulasi algoritma TC-START).
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase font-bold">Total GCS</span>
                <span className="text-xl font-black text-slate-900 font-mono">{gcsTotal} / 15</span>
              </div>
            </div>

            {/* Glasgow Coma Scale (GCS) */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">
                1. Glasgow Coma Scale (GCS)
              </h3>

              {/* Eye (E 1-4) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Eye Opening (E: {gcsE})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 4, label: '4 - Spontan' },
                    { val: 3, label: '3 - Perintah Suara' },
                    { val: 2, label: '2 - Rangsang Nyeri' },
                    { val: 1, label: '1 - Tidak Ada' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGcsE(item.val)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        gcsE === item.val
                          ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motoric (M 1-6) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Motor Response (M: {gcsM})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { val: 6, label: '6 - Ikuti Perintah' },
                    { val: 5, label: '5 - Lokalisir Nyeri' },
                    { val: 4, label: '4 - Menarik (Normal Flexion)' },
                    { val: 3, label: '3 - Fleksi Abnormal (Dekortikasi)' },
                    { val: 2, label: '2 - Ekstensi (Deserebrasi)' },
                    { val: 1, label: '1 - Tidak Ada' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGcsM(item.val)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        gcsM === item.val
                          ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verbal (V 1-5) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Verbal Response (V: {gcsV})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { val: 5, label: '5 - Orientasi Baik' },
                    { val: 4, label: '4 - Bingung / Disorientasi' },
                    { val: 3, label: '3 - Kata Tidak Tepat' },
                    { val: 2, label: '2 - Mengerang (Tanpa Arti)' },
                    { val: 1, label: '1 - Tidak Ada' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGcsV(item.val)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        gcsV === item.val
                          ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-400'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Skala Nyeri (NRS & Faces 0-10) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">
                  2. Skala Nyeri Pasien (0 - 10)
                </h3>
                <span className="text-base font-black px-3 py-1 bg-red-100 text-red-800 rounded-full font-mono">
                  {skorNyeri} / 10 (
                  {skorNyeri === 0
                    ? 'Tidak Nyeri'
                    : skorNyeri <= 3
                    ? 'Nyeri Ringan'
                    : skorNyeri <= 6
                    ? 'Nyeri Sedang'
                    : 'Nyeri Hebat'}
                  )
                </span>
              </div>

              {/* Visual Faces representation */}
              <div className="grid grid-cols-6 gap-1 text-center py-2">
                {[
                  { score: 0, face: '😀', desc: '0 - Tidak Nyeri' },
                  { score: 2, face: '🙂', desc: '2 - Ringan' },
                  { score: 4, face: '😐', desc: '4 - Sedang' },
                  { score: 6, face: '🙁', desc: '6 - Mengganggu' },
                  { score: 8, face: '😣', desc: '8 - Berat' },
                  { score: 10, face: '😭', desc: '10 - Tak Tertahankan' },
                ].map((item) => (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setSkorNyeri(item.score)}
                    className={`p-2 rounded-2xl border transition flex flex-col items-center gap-1 ${
                      Math.abs(skorNyeri - item.score) <= 1
                        ? 'border-red-600 bg-red-50 text-red-900 font-bold scale-105 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 opacity-70'
                    }`}
                  >
                    <span className="text-2xl">{item.face}</span>
                    <span className="text-[10px] font-bold leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0"
                max="10"
                value={skorNyeri}
                onChange={(e) => setSkorNyeri(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('algoritma')}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Algoritma
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('transcultural')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm shadow-md"
              >
                Lanjut ke Transcultural &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP D: ASESMEN TRANSCULTURAL NURSING */}
        {/* ============================================================ */}
        {currentStep === 'transcultural' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-red-600" /> Bagian D: Pendekatan Transcultural Nursing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                4 Pilar Asesmen Budaya untuk memastikan komunikasi terapeutik & keselamatan pasien di lapangan.
              </p>
            </div>

            <div className="space-y-3">
              {/* Checklist 1: Bahasa */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  bahasaDipahami ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={bahasaDipahami}
                  onChange={(e) => setBahasaDipahami(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    1. Bahasa Komunikasi Dipahami Pasien
                  </span>
                  <span className="text-xs text-slate-600">
                    Petugas menggunakan bahasa/dialek ({bahasa.toUpperCase()}) yang nyaman & dimengerti korban/keluarga.
                  </span>
                </div>
              </label>

              {/* Checklist 2: Gender & Privasi */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  genderDiperhatikan ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={genderDiperhatikan}
                  onChange={(e) => setGenderDiperhatikan(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    2. Sensitivitas Gender & Privasi Korban
                  </span>
                  <span className="text-xs text-slate-600">
                    Menjaga aurat/privasi saat pemeriksaan pakaian, didampingi sesama gender bila memungkinkan.
                  </span>
                </div>
              </label>

              {/* Checklist 3: Nyeri & Budaya */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  nyeriEkspresiDiperhatikan ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={nyeriEkspresiDiperhatikan}
                  onChange={(e) => setNyeriEkspresiDiperhatikan(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    3. Respons Empatis Terhadap Ekspresi Nyeri
                  </span>
                  <span className="text-xs text-slate-600">
                    Menghargai cara pasien mengekspresikan nyeri (mengerang/berdoa/pasrah) tanpa menghakimi.
                  </span>
                </div>
              </label>

              {/* Checklist 4: Dukungan Keluarga */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                  dukunganKeluargaDilibatkan ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={dukunganKeluargaDilibatkan}
                  onChange={(e) => setDukunganKeluargaDilibatkan(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block">
                    4. Keterlibatan & Dukungan Keluarga / Pendamping
                  </span>
                  <span className="text-xs text-slate-600">
                    Memberikan informasi yang menenangkan kepada keluarga serta mengizinkan pendampingan yang aman.
                  </span>
                </div>
              </label>

              {/* Catatan Transcultural Tambahan */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Kultural Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pasien meminta didoakan sebelum dipindahkan, suami ikut di ambulans."
                  value={catatanTranscultural}
                  onChange={(e) => setCatatanTranscultural(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('klinis')}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Data Klinis
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('rujukan')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm shadow-md"
              >
                Lanjut ke Rujukan & Finalisasi &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP E: RUJUKAN & FINALISASI SUBMIT */}
        {/* ============================================================ */}
        {currentStep === 'rujukan' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Hospital className="w-5 h-5 text-red-600" /> Bagian E: Tujuan Rujukan & Rekap Triase
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pilih rumah sakit rujukan dan konfirmasi hasil keputusan triase sebelum menyimpan data.
              </p>
            </div>

            {/* Live Triage Result Preview Banner */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Hasil Kalkulasi Algoritma TC-START (Otomatis)
              </label>
              <HasilBadge
                kategori={calculatedResult.kategori}
                prioritas={calculatedResult.prioritas}
                size="hero"
                showDescription={true}
              />
            </div>

            {/* Pilihan RS Rujukan */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-700">
                Pilih Rumah Sakit / Fasilitas Rujukan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'RSU Tidar',
                  'RST Soedjono',
                  'RS Soeroyo',
                  'RSI Kota Magelang',
                  'RS Harapan',
                  'RS Lestari',
                  'Lainnya',
                ].map((rs) => (
                  <button
                    key={rs}
                    type="button"
                    onClick={() => setTujuanRujukan(rs)}
                    className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition text-center ${
                      tujuanRujukan === rs
                        ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-400'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {rs}
                  </button>
                ))}
              </div>

              {tujuanRujukan === 'Lainnya' && (
                <input
                  type="text"
                  placeholder="Ketikkan nama RS / Puskesmas rujukan lainnya"
                  value={customRujukan}
                  onChange={(e) => setCustomRujukan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition text-sm font-medium outline-none"
                />
              )}
            </div>

            {/* Patient Summary Recap Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-slate-800 border-b pb-1 flex items-center justify-between">
                <span>Ringkasan Korban: {namaPasien}</span>
                <span className="font-mono text-xs text-slate-500">{lokasiKejadian}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                <div>
                  Petugas: <strong className="text-slate-800">{namaPetugas}</strong>
                </div>
                <div>
                  GCS: <strong className="text-slate-800">{gcsTotal}/15</strong> (E{gcsE} M{gcsM} V{gcsV})
                </div>
                <div>
                  Nyeri: <strong className="text-slate-800">{skorNyeri}/10</strong>
                </div>
                <div>
                  Rujukan: <strong className="text-slate-800">{tujuanRujukan}</strong>
                </div>
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('transcultural')}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali ke Transcultural
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-xl shadow-red-600/30 transition text-base"
              >
                <CheckCircle2 className="w-5 h-5" /> Simpan & Buka Hasil Triase
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
