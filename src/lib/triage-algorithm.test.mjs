import test from 'node:test';
import assert from 'node:assert/strict';
import { hitungTriage } from './triage-algorithm.js';

test('1. Pasien dapat berjalan -> HIJAU (Prioritas 3)', () => {
  const res = hitungTriage({
    dapatBerjalan: true,
  });
  assert.equal(res.kategori, 'hijau');
  assert.equal(res.prioritas, 3);
});

test('2. Pasien tidak bernapas & setelah airway tetap tidak bernapas -> HITAM (Prioritas 4)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: false,
    bernapasSetelahAirway: false,
  });
  assert.equal(res.kategori, 'hitam');
  assert.equal(res.prioritas, 4);
});

test('3. Pasien tidak bernapas awal & bernapas setelah airway dibuka -> MERAH (Prioritas 1)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: false,
    bernapasSetelahAirway: true,
  });
  assert.equal(res.kategori, 'merah');
  assert.equal(res.prioritas, 1);
});

test('4. Pasien bernapas dengan laju RR > 30x/menit -> MERAH (Prioritas 1)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 36,
  });
  assert.equal(res.kategori, 'merah');
  assert.equal(res.prioritas, 1);
});

test('5. Pasien RR <= 30 tetapi Nadi Radial Tidak Teraba -> MERAH (Prioritas 1)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 20,
    nadiRadialTeraba: false,
    crt: '<=2s',
  });
  assert.equal(res.kategori, 'merah');
  assert.equal(res.prioritas, 1);
});

test('6. Pasien RR <= 30 & CRT > 2s -> MERAH (Prioritas 1)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 22,
    nadiRadialTeraba: true,
    crt: '>2s',
  });
  assert.equal(res.kategori, 'merah');
  assert.equal(res.prioritas, 1);
});

test('7. Pasien RR <= 30, perfusi adekuat, AVPU P (Pain only) -> MERAH (Prioritas 1)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 18,
    nadiRadialTeraba: true,
    crt: '<=2s',
    statusMentalAvpu: 'P',
  });
  assert.equal(res.kategori, 'merah');
  assert.equal(res.prioritas, 1);
});

test('8. Pasien RR <= 30, perfusi adekuat, AVPU A (Alert/mampu ikuti perintah) -> KUNING (Prioritas 2)', () => {
  const res = hitungTriage({
    dapatBerjalan: false,
    bernapas: true,
    frekuensiPernafasan: 20,
    nadiRadialTeraba: true,
    crt: '<=2s',
    statusMentalAvpu: 'A',
  });
  assert.equal(res.kategori, 'kuning');
  assert.equal(res.prioritas, 2);
});
