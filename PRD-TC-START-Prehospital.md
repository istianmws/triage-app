# PRD — TC-START Prehospital
**Transcultural Nursing – START Triage untuk Layanan Prehospital**

| | |
|---|---|
| Versi | 0.2 (Disempurnakan) |
| Tanggal | 18 Agustus 2026 |
| Pemilik Produk | nvermind |
| Status | Siap masuk tahap development (MVP) |

**Riwayat Revisi**
- v0.1 — Draft awal berdasarkan mockup Home, Form Input, Hasil Triage.
- v0.2 — Algoritma disesuaikan dengan kartu referensi resmi "ALGORITMA TC-START", open questions dikonfirmasi, rancangan frontend & backend detail ditambahkan.

---

## 1. Ringkasan Produk

TC-START Prehospital adalah aplikasi triage lapangan berbasis web (di-embed ke Android) yang membantu petugas PSC 119 / tenaga medis prehospital melakukan **triase cepat** menggunakan metode **START (Simple Triage And Rapid Treatment)** yang diperkaya dengan pendekatan **transcultural nursing** (bahasa, sensitivitas gender, respons nyeri, dukungan keluarga).

Fungsi inti aplikasi hanya dua hal:
1. **Input data pasien** di lokasi kejadian, mengikuti alur algoritma START step-by-step.
2. **Menampilkan hasil triage** (kategori warna + prioritas + tujuan rujukan) secara instan, yang bisa dicetak/di-PDF-kan dan dilihat lintas perangkat (HP petugas di lapangan & laptop di RS/koordinator pusat).

## 2. Ruang Lingkup MVP

Sesuai keputusan, **rilis pertama hanya fase MVP** (lihat §13 — fase 2/3/4 ditunda, tidak dikerjakan dulu).

### In-scope (MVP)
- Halaman Home
- Form Input Data Triage (mengikuti alur algoritma bercabang)
- Kalkulasi otomatis hasil triage sesuai algoritma resmi
- Halaman Hasil Triage
- Simpan otomatis ke database (Supabase/Postgres)
- Cetak (browser print) & Export PDF
- Daftar/riwayat Data Pasien dengan filter **nama pasien** dan **tanggal**
- Full responsive (mobile-first untuk embed Android, tetap rapi di laptop)
- **Tanpa autentikasi/login** — akses langsung, nama petugas diisi manual sebagai free text per kasus

### Out-of-scope (MVP — ditunda ke fase berikutnya jika dibutuhkan)
- Login/autentikasi multi-user
- Multi-lokasi/multi-unit (untuk sekarang 1 unit/PSC saja)
- Hapus/retensi/anonimisasi data (belum ada kebutuhan)
- Integrasi SIMRS, notifikasi otomatis ke RS rujukan
- Mode offline
- Peta lokasi (GPS) interaktif

---

## 3. Target Pengguna

- **Petugas lapangan PSC 119 / paramedis** — pengguna utama, input data via HP (embed Android/WebView).
- **Supervisor/koordinator PSC** — melihat rekap data pasien via laptop/browser.

---

## 4. Algoritma Triage (Sumber Kebenaran: Kartu "ALGORITMA TC-START")

Ini adalah logika bisnis inti aplikasi. Semua keputusan warna **mengikuti flowchart di bawah**, bukan interpretasi bebas.

```
STEP 1 — DAPAT BERJALAN?
  Instruksi: "Silakan berjalan ke arah saya"
  YA   → HIJAU / MINOR — Prioritas 3  [SELESAI]
  TIDAK → lanjut STEP 2

STEP 2 — BERNAPAS?
  YA → Hitung laju pernapasan (RR) selama 15 detik
        RR > 30x/menit  → MERAH / IMMEDIATE — Prioritas 1  [SELESAI]
        RR ≤ 30x/menit  → lanjut STEP 3
  TIDAK → Buka jalan napas (head tilt–chin lift). Apakah bernapas (setelah dibuka)?
        TIDAK → HITAM / EXPECTANT (Meninggal) — Prioritas 4  [SELESAI]
        YA    → MERAH / IMMEDIATE — Prioritas 1  [SELESAI]

STEP 3 — PERFUSI
  Nilai nadi radial atau kapiler refill (CRT)
        TIDAK ADEKUAT (nadi radial tidak teraba ATAU CRT > 2 detik)
              → MERAH / IMMEDIATE — Prioritas 1  [SELESAI]
        ADEKUAT (nadi radial teraba DAN CRT ≤ 2 detik)
              → lanjut STEP 4

STEP 4 — STATUS MENTAL
  Dapat mengikuti perintah sederhana? (skala AVPU: Alert/Verbal/Pain/Unresponsive)
        TIDAK (P atau U)  → MERAH / IMMEDIATE — Prioritas 1  [SELESAI]
        YA (A atau V)     → KUNING / DELAYED — Prioritas 2  [SELESAI]
```

**Re-triage**: jika kondisi pasien memburuk, petugas mengulang alur ini (dibuatkan entri triage baru untuk pasien yang sama — lihat §7.4). Tidak perlu fitur teknis khusus di MVP, cukup mendorong pola "Nama pasien" konsisten agar mudah dicari saat filter riwayat.

**Catatan penting**: GCS (E/M/V) dan skor nyeri **tidak dipakai sebagai penentu warna** dalam algoritma resmi ini — keduanya tetap dikumpulkan sebagai **data dokumentasi klinis untuk serah terima ke RS rujukan**, bukan variabel keputusan. Faktor transcultural (bahasa, gender, nyeri, dukungan keluarga) juga **tidak menentukan warna triase**, hanya memperkaya dokumentasi & komunikasi.

### Tabel Kriteria (ringkasan, sesuai kartu referensi)

| Kategori | Prioritas | Kriteria Kunci |
|---|---|---|
| 🔴 MERAH / IMMEDIATE | 1 — Segera | Tidak mampu berjalan; RR > 30x/menit; nadi radial tidak teraba/CRT > 2 detik; tidak dapat mengikuti perintah sederhana |
| 🟡 KUNING / DELAYED | 2 — Tidak Gawat | Tidak berjalan namun RR ≤ 30, perfusi adekuat, dapat mengikuti perintah sederhana |
| 🟢 HIJAU / MINOR | 3 — Ringan | Dapat berjalan, RR normal, nadi radial teraba, keluhan minimal |
| ⚫ HITAM / EXPECTANT | 4 — Tidak Dapat Diselamatkan | Tidak ada tanda kehidupan meski jalan napas sudah dibuka |

---

## 5. User Flow

```
Home
 ├─ [Mulai Triage] → Form Input (step-by-step sesuai algoritma) → Hasil Triage → Cetak / PDF
 ├─ [Data Pasien] → List Riwayat (filter: nama, tanggal) → Detail (= Hasil Triage, read-only)
 ├─ [Pengaturan] → Preferensi tampilan dasar (opsional)
 └─ [Tentang Aplikasi] → Info app/versi/kontak PSC 119
```

---

## 6. Fitur & Functional Requirements

### 6.1 Home
- 4 kartu kategori triage (Merah/Kuning/Hijau/Hitam) sebagai referensi visual cepat, sesuai kartu resmi.
- Section "Transcultural Nursing Approach" — informatif, tidak interaktif di MVP.
- CTA: `Mulai Triage`, `Data Pasien`, `Pengaturan`, `Tentang Aplikasi`.

### 6.2 Form Input Data Triage — **Wizard Bercabang**

Form dirancang sebagai **step-by-step wizard**, bukan satu form panjang, mengikuti percabangan algoritma agar petugas hanya mengisi pertanyaan yang relevan (mempercepat pengisian di lapangan).

**Bagian A — Data Identitas & Konteks** (selalu diisi, di awal)
| Field | Tipe | Wajib |
|---|---|---|
| No. Kasus | Auto-generate (server, format: `TCS-YYYYMMDD-XXX`) | Otomatis |
| Nama pasien | Text | Ya |
| Nama petugas | Text (free text, tanpa login) | Ya |
| Lokasi kejadian | Text | Ya |
| Waktu kejadian | Datetime picker (default: waktu saat ini) + kategori Pagi/Siang/Malam/Dini Hari (auto dari jam, bisa diubah) | Ya |
| Bahasa pasien | Pilihan: Indonesia/Jawa/Madura/Sunda/Inggris | Ya |
| Jenis kelamin | Laki-laki/Perempuan | Ya |
| Keadaan khusus | Tidak ada/Difabel | Ya |

**Bagian B — Alur Algoritma (Wizard)**
| Step | Field | Tipe | Muncul Jika |
|---|---|---|---|
| 1 | Dapat berjalan? | Ya/Tidak | Selalu |
| 2a | Bernapas? | Ya/Tidak | Jika Step 1 = Tidak |
| 2b | Setelah dibuka jalan napas, apakah bernapas? | Ya/Tidak | Jika Step 2a = Tidak |
| 2c | Frekuensi pernafasan (RR), dihitung 15 detik | Angka (x/menit) atau bucket `>30` / `≤30` | Jika Step 2a = Ya, atau Step 2b = Ya |
| 3 | Nadi radial teraba? | Ya/Tidak | Jika RR ≤ 30 |
| 3 | CRT (kapiler refill) | `≤ 2 detik` / `> 2 detik` | Jika RR ≤ 30 |
| 4 | Dapat mengikuti perintah sederhana? (AVPU) | Alert/Verbal/Pain/Unresponsive | Jika perfusi adekuat |

**Bagian C — Dokumentasi Klinis Tambahan** (tidak memengaruhi warna, untuk serah terima RS)
| Field | Tipe |
|---|---|
| GCS — Eye (E) | 1–4 |
| GCS — Motorik (M) | 1–6 |
| GCS — Verbal (V) | 1–5 |
| Skor nyeri (Face/numerik) | 1–10 |

**Bagian D — Asesmen Transcultural Cepat** (checklist, sesuai kartu kanan)
| Field | Tipe |
|---|---|
| Bahasa yang digunakan dipahami pasien | Checkbox |
| Preferensi gender diperhatikan | Checkbox |
| Nyeri & ekspresi diperhatikan | Checkbox |
| Dukungan keluarga dilibatkan | Checkbox |
| Catatan tambahan transcultural | Textarea (opsional) |

**Bagian E — Rujukan**
| Field | Tipe |
|---|---|
| Tujuan rujukan | RSU Tidar/RST/RS Soeroyo/RSI/RS Harapan/RS Lestari/Lainnya (text jika Lainnya) |

- Hasil kategori (Merah/Kuning/Hijau/Hitam) **dihitung otomatis di step terakhir yang relevan** — begitu jawaban cukup untuk menyimpulkan kategori, wizard langsung menampilkan hasil (tidak perlu memaksa isi Bagian C jika sudah HIJAU di Step 1, tapi Bagian C & D tetap ditawarkan sebagai halaman opsional sebelum submit final untuk kelengkapan dokumentasi).

### 6.3 Hasil Triage
- Ringkasan data pasien lengkap (identitas, hasil tiap step algoritma, dokumentasi klinis, asesmen transcultural).
- **Badge besar** kategori (warna + label + prioritas) sesuai kartu resmi.
- Tujuan rujukan.
- Tombol `Cetak` (browser print, `window.print()` dengan CSS `@media print` khusus) dan tombol `Simpan sebagai PDF` (lihat §9.4).
- Data tersimpan otomatis ke database saat wizard selesai/submit (bukan menunggu klik simpan).

### 6.4 Data Pasien (Riwayat)
- List semua triage tersimpan, urut terbaru.
- **Filter**: nama pasien (search text) dan rentang tanggal.
- Klik item → halaman Hasil Triage (read-only) untuk data tersebut.
- Mendukung pola re-triage: petugas bisa mencari nama pasien yang sama untuk melihat riwayat triage sebelumnya sebelum melakukan triage ulang.

### 6.5 Pengaturan & Tentang Aplikasi
- Pengaturan: minimal di MVP (placeholder — misal pilihan bahasa UI), tidak ada pengaturan akun karena tanpa login.
- Tentang Aplikasi: versi app, kontak PSC 119, penjelasan singkat metode TC-START.

---

## 7. Data Model (Skema PostgreSQL/Supabase)

```sql
create table triage_records (
  id uuid primary key default gen_random_uuid(),
  no_kasus text unique not null,               -- auto: TCS-YYYYMMDD-XXX

  -- Bagian A: Identitas & Konteks
  nama_pasien text not null,
  nama_petugas text not null,
  lokasi_kejadian text not null,
  waktu_kejadian timestamptz not null,
  waktu_kategori text check (waktu_kategori in ('pagi','siang','malam','dini_hari')),
  bahasa text check (bahasa in ('indonesia','jawa','madura','sunda','inggris')),
  jenis_kelamin text check (jenis_kelamin in ('laki-laki','perempuan')),
  keadaan_khusus text check (keadaan_khusus in ('tidak_ada','difabel')),

  -- Bagian B: Alur Algoritma
  dapat_berjalan boolean not null,
  bernapas boolean,                              -- null jika tidak relevan (langsung hijau)
  bernapas_setelah_airway boolean,                -- null jika tidak relevan
  frekuensi_pernafasan int,                       -- nilai x/menit aktual
  rr_kategori text check (rr_kategori in ('>30','<=30')),
  nadi_radial_teraba boolean,
  crt text check (crt in ('<=2s','>2s')),
  status_mental_avpu text check (status_mental_avpu in ('A','V','P','U')),

  -- Bagian C: Dokumentasi Klinis (tidak memengaruhi warna)
  gcs_e int check (gcs_e between 1 and 4),
  gcs_m int check (gcs_m between 1 and 6),
  gcs_v int check (gcs_v between 1 and 5),
  skor_nyeri int check (skor_nyeri between 1 and 10),

  -- Bagian D: Asesmen Transcultural
  bahasa_dipahami boolean default false,
  gender_diperhatikan boolean default false,
  nyeri_ekspresi_diperhatikan boolean default false,
  dukungan_keluarga_dilibatkan boolean default false,
  catatan_transcultural text,

  -- Bagian E: Hasil & Rujukan
  hasil_kategori text not null check (hasil_kategori in ('merah','kuning','hijau','hitam')),
  hasil_prioritas int not null check (hasil_prioritas between 1 and 4),
  tujuan_rujukan text not null,

  created_at timestamptz default now()
);

create index idx_triage_nama_pasien on triage_records (nama_pasien);
create index idx_triage_created_at on triage_records (created_at desc);
```

*(RLS/Row Level Security bisa disederhanakan di MVP karena belum ada auth — akses via server-side service role saja, lihat §8.2.)*

---

## 8. Rancangan Arsitektur

### 8.1 Tech Stack
| Layer | Teknologi |
|---|---|
| Frontend | Astro + Tailwind CSS |
| State wizard (client) | Astro island (React/Preact/vanilla — rekomendasi: **Preact** ringan untuk WebView) |
| Database | PostgreSQL via Supabase |
| Hosting | Vercel (Astro SSR adapter) |
| Target Runtime | WebView Android (embed) + browser desktop/laptop |
| PDF/Print | Browser-native `window.print()` + CSS `@media print` (lihat §9.4) |

### 8.2 Pisah Frontend/Backend? — Tetap 1 Project (Monorepo, Astro SSR)

Tidak perlu backend server terpisah. Astro API routes berperan sebagai backend tipis:

- Kredensial Supabase (service role key) **hanya ada di server-side** (Astro API routes / `.server.ts`), tidak pernah dikirim ke client — krusial karena app di-embed WebView Android.
- Astro dijalankan dengan `output: 'server'` + adapter Vercel.
- Business logic algoritma triage (§4) ditulis sebagai **pure function terpisah** (`lib/triage-algorithm.ts`) agar mudah di-unit-test tanpa tergantung UI atau DB — ini penting karena algoritma menyangkut keselamatan pasien.

### 8.3 Struktur Folder

```
tc-start-prehospital/
├── src/
│   ├── pages/
│   │   ├── index.astro                    Home
│   │   ├── triage/
│   │   │   ├── input.astro                 Wizard form (island interaktif)
│   │   │   └── hasil/[id].astro            Hasil Triage (SSR, fetch by id)
│   │   ├── data-pasien/
│   │   │   └── index.astro                 List riwayat + filter
│   │   ├── pengaturan.astro
│   │   ├── tentang.astro
│   │   └── api/
│   │       ├── triage.ts                   POST (simpan baru), GET (list + filter)
│   │       └── triage/[id].ts              GET (detail satu record)
│   ├── lib/
│   │   ├── supabase.ts                     Server-side client (service role key dari env)
│   │   ├── triage-algorithm.ts             Pure function: input jawaban → { kategori, prioritas }
│   │   └── no-kasus.ts                     Generator No. Kasus (TCS-YYYYMMDD-XXX)
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── StepBerjalan.tsx
│   │   │   ├── StepBernapas.tsx
│   │   │   ├── StepRR.tsx
│   │   │   ├── StepPerfusi.tsx
│   │   │   ├── StepStatusMental.tsx
│   │   │   ├── StepDokumentasiKlinis.tsx
│   │   │   └── StepTranscultural.tsx
│   │   ├── HasilBadge.tsx                  Badge warna+prioritas (dipakai di Hasil & List)
│   │   ├── TriageCard.tsx                  Kartu ringkas (dipakai di list Data Pasien)
│   │   └── PrintView.tsx                   Layout khusus untuk cetak/PDF
│   └── layouts/
│       └── BaseLayout.astro                Mobile-first, viewport meta, dsb.
├── astro.config.mjs                        output: 'server', adapter: vercel()
├── .env                                    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
└── PRD.md
```

### 8.4 API Contract (Astro API Routes)

**`POST /api/triage`** — simpan hasil triage baru
```jsonc
// Request body
{
  "namaPasien": "Ny. Fulan",
  "namaPetugas": "Budi",
  "lokasiKejadian": "Jl. Ikhlas",
  "waktuKejadian": "2026-08-18T17:08:00+07:00",
  "bahasa": "jawa",
  "jenisKelamin": "perempuan",
  "keadaanKhusus": "difabel",
  "dapatBerjalan": false,
  "bernapas": true,
  "frekuensiPernafasan": 32,
  "nadiRadialTeraba": true,
  "crt": "<=2s",
  "statusMentalAvpu": "A",
  "gcs": { "e": 3, "m": 6, "v": 4 },
  "skorNyeri": 9,
  "transcultural": {
    "bahasaDipahami": true,
    "genderDiperhatikan": true,
    "nyeriEkspresiDiperhatikan": true,
    "dukunganKeluargaDilibatkan": false,
    "catatan": ""
  },
  "tujuanRujukan": "RSU Tidar"
}

// Response 201
{
  "id": "uuid",
  "noKasus": "TCS-20260818-001",
  "hasilKategori": "merah",
  "hasilPrioritas": 1
}
```
> Kategori & prioritas **dihitung di server** (memanggil `triage-algorithm.ts`) berdasarkan jawaban wizard, bukan dikirim dari client — mencegah manipulasi/inkonsistensi hasil.

**`GET /api/triage?nama=...&dari=YYYY-MM-DD&sampai=YYYY-MM-DD`** — list riwayat dengan filter
```jsonc
{
  "data": [
    { "id": "uuid", "noKasus": "TCS-20260818-001", "namaPasien": "Ny. Fulan",
      "waktuKejadian": "2026-08-18T17:08:00+07:00", "hasilKategori": "merah", "tujuanRujukan": "RSU Tidar" }
  ]
}
```

**`GET /api/triage/:id`** — detail satu record (dipakai halaman Hasil Triage & Print)

### 8.5 Alur Kalkulasi Algoritma (`triage-algorithm.ts`)

```ts
type Input = {
  dapatBerjalan: boolean;
  bernapas?: boolean;
  bernapasSetelahAirway?: boolean;
  frekuensiPernafasan?: number;  // x/menit
  nadiRadialTeraba?: boolean;
  crt?: '<=2s' | '>2s';
  statusMentalAvpu?: 'A' | 'V' | 'P' | 'U';
};

type Hasil = { kategori: 'merah' | 'kuning' | 'hijau' | 'hitam'; prioritas: 1 | 2 | 3 | 4 };

function hitungTriage(input: Input): Hasil {
  if (input.dapatBerjalan) return { kategori: 'hijau', prioritas: 3 };

  if (input.bernapas === false) {
    return input.bernapasSetelahAirway
      ? { kategori: 'merah', prioritas: 1 }
      : { kategori: 'hitam', prioritas: 4 };
  }

  if ((input.frekuensiPernafasan ?? 0) > 30) return { kategori: 'merah', prioritas: 1 };

  const perfusiAdekuat = input.nadiRadialTeraba === true && input.crt === '<=2s';
  if (!perfusiAdekuat) return { kategori: 'merah', prioritas: 1 };

  const responsif = input.statusMentalAvpu === 'A' || input.statusMentalAvpu === 'V';
  return responsif ? { kategori: 'kuning', prioritas: 2 } : { kategori: 'merah', prioritas: 1 };
}
```
*(Fungsi ini harus punya unit test untuk tiap cabang keputusan — minimal 7 test case sesuai 7 titik `[SELESAI]` di §4.)*

### 8.6 Embed Android
- WebView atau Trusted Web Activity (TWA) — cukup WebView untuk MVP.
- Viewport & touch target sudah sesuai desain (tombol besar).

---

## 9. Non-Functional Requirements

- **Responsive**: mobile-first (360–428px, WebView Android), tetap rapi di laptop (≥1024px) — terutama halaman Hasil Triage & Data Pasien.
- **Kecepatan input**: wizard bercabang membuat rata-rata pengisian jauh lebih cepat dari form monolitik (petugas kasus HIJAU hanya menjawab 1 pertanyaan inti + identitas).
- **Keamanan**: kredensial Supabase hanya server-side; tanpa login di MVP, jadi tidak ada data sensitif akun yang perlu diamankan, tapi endpoint POST/GET tetap divalidasi (server-side validation, bukan percaya input client mentah).
- **Reliabilitas**: feedback jelas saat submit (loading state, retry jika gagal simpan — penting karena koneksi lapangan bisa tidak stabil).
- **Aksesibilitas warna**: kategori selalu disertai label teks + ikon (bukan warna saja).

### 9.4 Cetak & PDF
- Implementasi **satu mekanisme untuk dua kebutuhan**: halaman Hasil Triage punya layout khusus cetak (`PrintView.tsx` + CSS `@media print`).
- Tombol `Cetak` → `window.print()` langsung.
- Tombol `Simpan sebagai PDF` → memicu dialog print browser yang sama, di mana user memilih tujuan "Save as PDF" (built-in di Chrome/Android WebView & browser desktop) — tidak perlu library PDF generation terpisah di MVP, mengurangi kompleksitas & beban server.
- *(Fase berikutnya, jika dibutuhkan PDF dengan branding presisi terlepas dari browser: pertimbangkan server-side generation, misal Puppeteer via serverless function terpisah — tidak untuk MVP.)*

---

## 10. Keputusan yang Sudah Dikonfirmasi

| Topik | Keputusan |
|---|---|
| Autentikasi | Tidak ada login di MVP; nama petugas diisi manual per kasus |
| Algoritma | Mengikuti kartu resmi "ALGORITMA TC-START" (lihat §4) |
| Cetak/PDF | Browser print (`window.print`) yang mendukung print langsung maupun "Save as PDF" |
| Filter Data Pasien | Berdasarkan nama pasien & rentang tanggal saja |
| Multi-lokasi | Satu unit/PSC saja untuk saat ini |
| Retensi data | Tidak ada kebutuhan hapus/anonimisasi saat ini |
| Cakupan rilis | Hanya fase MVP, fase 2–4 ditunda |

---

## 11. Fase Pengembangan

| Fase | Cakupan | Status |
|---|---|---|
| **Fase 1 — MVP** | Home, Wizard Input, Algoritma, Hasil Triage, Simpan ke Supabase, Cetak/PDF, Data Pasien (filter nama+tanggal) | **Dikerjakan sekarang** |
| Fase 2 (belum dikerjakan) | Autentikasi petugas, multi-lokasi, PDF branded server-side |
| Fase 3 (belum dikerjakan) | Mode offline/sync, retensi/hapus data |
| Fase 4 (belum dikerjakan) | Integrasi SIMRS, notifikasi RS rujukan |

---

*Dokumen ini sudah mencakup rancangan frontend (struktur halaman, komponen, wizard) dan backend (API contract, skema database, penempatan kredensial) — siap dijadikan acuan implementasi Fase 1/MVP.*
