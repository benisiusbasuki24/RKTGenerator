import * as XLSX from 'xlsx';
import { BULAN_LIST, SNP_DETAILS, SNP_LIST, SUMBER_DANA_LIST } from '../data/rkasConstants';
import { Bulan, RkasItem, SchoolIdentity } from '../types/rkas';
import {
  calculateMonthlyAllocation,
  formatDateIndo,
  sanitizeFilename,
} from './formatters';

export function exportRkasToXlsx(items: RkasItem[], school: SchoolIdentity): void {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: DRAF RKAS LENGKAP ---
  const sheet1Rows: (string | number | { f: string })[][] = [
    ['RENCANA KEGIATAN DAN ANGGARAN SEKOLAH (RKAS)'],
    [`TAHUN ANGGARAN ${school.tahunAnggaran}`],
    [],
    ['Nama Sekolah', school.namaSekolah, '', 'NPSN', school.npsn],
    ['Jenjang', school.jenjang, '', 'Alamat', `${school.alamat}, ${school.kecamatanKabKota}`],
    ['Pagu Anggaran', school.paguAnggaran, '', 'Tanggal Dokumen', formatDateIndo(school.tanggalDokumen)],
    [],
    [
      'No',
      'Standar Nasional Pendidikan (SNP)',
      'Jenis Belanja',
      'Uraian Kegiatan',
      'Rincian Belanja',
      'Output (Keluaran)',
      'Keterangan / Dokumen',
      'Volume',
      'Satuan',
      'Harga Satuan (Rp)',
      'Total Anggaran (Rp)',
      'Sumber Dana',
      'Bulan Pelaksanaan',
      'Penanggung Jawab',
      'Prioritas',
    ],
  ];

  const startDataRow = 9; // 1-indexed Excel row where item 1 starts
  items.forEach((item, idx) => {
    const excelRow = startDataRow + idx;
    sheet1Rows.push([
      idx + 1,
      item.snp,
      item.jenisBelanja,
      item.uraianKegiatan,
      item.rincianBelanja,
      item.keluaran || '-',
      item.keterangan || '-',
      item.volume,
      item.satuan,
      item.hargaSatuan,
      { f: `H${excelRow}*J${excelRow}` },
      item.sumberDana,
      item.bulan ? item.bulan.join(', ') : '-',
      item.penanggungJawab || '-',
      item.prioritas,
    ]);
  });

  const endDataRow = startDataRow + Math.max(items.length - 1, 0);
  const totalRow =
    items.length > 0
      ? [
          '',
          '',
          '',
          'JUMLAH TOTAL ANGGARAN RKAS',
          '',
          '',
          '',
          '',
          '',
          '',
          { f: `SUM(K${startDataRow}:K${endDataRow})` },
          '',
          '',
          '',
          '',
        ]
      : ['', '', '', 'JUMLAH TOTAL ANGGARAN RKAS', '', '', '', '', '', '', 0, '', '', '', ''];

  sheet1Rows.push(totalRow);
  sheet1Rows.push([]);
  sheet1Rows.push([
    '',
    'Mengetahui,',
    '',
    '',
    '',
    '',
    '',
    '',
    'Dibuat oleh,',
  ]);
  sheet1Rows.push([
    '',
    'Kepala Sekolah',
    '',
    '',
    '',
    '',
    '',
    '',
    'Bendahara Sekolah',
  ]);
  sheet1Rows.push([]);
  sheet1Rows.push([]);
  sheet1Rows.push([
    '',
    school.kepalaSekolah || '...........................',
    '',
    '',
    '',
    '',
    '',
    '',
    school.bendahara || '...........................',
  ]);
  sheet1Rows.push([
    '',
    `NIP. ${school.nipKepalaSekolah || '-'}`,
    '',
    '',
    '',
    '',
    '',
    '',
    `NIP. ${school.nipBendahara || '-'}`,
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1['!cols'] = [
    { wch: 5 },  // No
    { wch: 32 }, // SNP
    { wch: 24 }, // Jenis Belanja
    { wch: 36 }, // Uraian
    { wch: 38 }, // Rincian Belanja
    { wch: 32 }, // Output
    { wch: 32 }, // Keterangan
    { wch: 10 }, // Volume
    { wch: 14 }, // Satuan
    { wch: 18 }, // Harga Satuan
    { wch: 20 }, // Total Anggaran
    { wch: 22 }, // Sumber Dana
    { wch: 24 }, // Bulan
    { wch: 22 }, // PJ
    { wch: 12 }, // Prioritas
  ];

  // Apply number format to currency columns in Sheet 1 (Harga Satuan = col 9, Total = col 10)
  for (let r = startDataRow - 1; r <= startDataRow + items.length; r++) {
    const priceCell = ws1[XLSX.utils.encode_cell({ r, c: 9 })];
    const totalCell = ws1[XLSX.utils.encode_cell({ r, c: 10 })];
    if (priceCell) priceCell.z = '#,##0';
    if (totalCell) totalCell.z = '#,##0';
  }
  const paguCell = ws1[XLSX.utils.encode_cell({ r: 5, c: 1 })];
  if (paguCell) paguCell.z = '#,##0';

  XLSX.utils.book_append_sheet(wb, ws1, 'Draf RKAS');

  // --- SHEET 2: REKAP SUMBER DANA & BULAN ---
  const totalAll = items.reduce((acc, item) => acc + item.totalAnggaran, 0);

  const sumberRows: (string | number)[][] = [
    ['REKAPITULASI ANGGARAN BERDASARKAN SUMBER DANA'],
    [`${school.namaSekolah} — Tahun Anggaran ${school.tahunAnggaran}`],
    [],
    ['No', 'Sumber Dana', 'Jumlah Item', 'Total Anggaran (Rp)', 'Persentase (%)'],
  ];

  SUMBER_DANA_LIST.forEach((sd, index) => {
    const matching = items.filter((item) => item.sumberDana === sd);
    const sum = matching.reduce((acc, item) => acc + item.totalAnggaran, 0);
    const pct = totalAll > 0 ? Number(((sum / totalAll) * 100).toFixed(2)) : 0;
    sumberRows.push([index + 1, sd, matching.length, sum, pct]);
  });
  sumberRows.push(['', 'TOTAL KESELURUHAN', items.length, totalAll, totalAll > 0 ? 100 : 0]);
  sumberRows.push([]);
  sumberRows.push(['REKAPITULASI PROYEKSI PENCAIRAN PER BULAN']);
  sumberRows.push(['Bulan Pelaksanaan', 'Alokasi Anggaran (Rp)', 'Persentase (%)']);

  const bulanTotals: Record<Bulan, number> = {
    Januari: 0,
    Februari: 0,
    Maret: 0,
    April: 0,
    Mei: 0,
    Juni: 0,
    Juli: 0,
    Agustus: 0,
    September: 0,
    Oktober: 0,
    November: 0,
    Desember: 0,
  };
  items.forEach((item) => {
    const alloc = calculateMonthlyAllocation(item);
    BULAN_LIST.forEach((m) => {
      bulanTotals[m] += alloc[m];
    });
  });

  BULAN_LIST.forEach((m) => {
    const val = bulanTotals[m];
    const pct = totalAll > 0 ? Number(((val / totalAll) * 100).toFixed(2)) : 0;
    sumberRows.push([m, val, pct]);
  });
  sumberRows.push(['TOTAL', totalAll, totalAll > 0 ? 100 : 0]);

  sumberRows.push([]);
  sumberRows.push(['REKAPITULASI PER 8 STANDAR NASIONAL PENDIDIKAN (SNP)']);
  sumberRows.push(['Standar Nasional Pendidikan', 'Jumlah Item', 'Total Anggaran (Rp)', 'Persentase (%)']);
  SNP_LIST.forEach((snp) => {
    const matching = items.filter((item) => item.snp === snp);
    const sum = matching.reduce((acc, item) => acc + item.totalAnggaran, 0);
    const pct = totalAll > 0 ? Number(((sum / totalAll) * 100).toFixed(2)) : 0;
    sumberRows.push([snp, matching.length, sum, pct]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sumberRows);
  ws2['!cols'] = [{ wch: 36 }, { wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Rekap Sumber & Bulan');

  // --- SHEET 3: MATRIKS RKT BERBASIS 8 SNP ---
  const activityMap = new Map<
    string,
    {
      snp: string;
      uraianKegiatan: string;
      itemCount: number;
      total: number;
      sumberDanaSet: Set<string>;
      pjSet: Set<string>;
      keteranganList: string[];
    }
  >();

  items.forEach((item) => {
    const key = `${item.snp}__${item.uraianKegiatan}`;
    const existing = activityMap.get(key);
    if (existing) {
      existing.itemCount += 1;
      existing.total += item.totalAnggaran;
      existing.sumberDanaSet.add(item.sumberDana);
      if (item.penanggungJawab) existing.pjSet.add(item.penanggungJawab);
      if (item.keterangan) existing.keteranganList.push(item.keterangan);
    } else {
      activityMap.set(key, {
        snp: item.snp,
        uraianKegiatan: item.uraianKegiatan,
        itemCount: 1,
        total: item.totalAnggaran,
        sumberDanaSet: new Set([item.sumberDana]),
        pjSet: new Set(item.penanggungJawab ? [item.penanggungJawab] : []),
        keteranganList: item.keterangan ? [item.keterangan] : [],
      });
    }
  });

  const rktRows: (string | number)[][] = [
    ['MATRIKS RENCANA KERJA TAHUNAN (RKT) BERBASIS 8 STANDAR NASIONAL PENDIDIKAN'],
    [`${school.namaSekolah} — Tahun Anggaran ${school.tahunAnggaran}`],
    [],
    ['RINGKASAN 8 STANDAR NASIONAL PENDIDIKAN (SNP)'],
    [
      'Kode',
      'Standar Nasional Pendidikan (SNP)',
      'Fokus Program RKT',
      'Jumlah Kegiatan',
      'Jumlah Rincian Belanja',
      'Total Anggaran (Rp)',
      'Proporsi (%)',
    ],
  ];

  SNP_DETAILS.forEach((snpDetail) => {
    const matching = items.filter((item) => item.snp === snpDetail.label);
    const total = matching.reduce((sum, item) => sum + item.totalAnggaran, 0);
    const actCount = new Set(matching.map((m) => m.uraianKegiatan.trim())).size;
    const pct = totalAll > 0 ? Number(((total / totalAll) * 100).toFixed(2)) : 0;
    rktRows.push([
      snpDetail.kode,
      snpDetail.label,
      snpDetail.fokusRkt,
      actCount,
      matching.length,
      total,
      pct,
    ]);
  });

  rktRows.push([]);
  rktRows.push(['DAFTAR RINCIAN KEGIATAN RKT TERHUBUNG KE RKAS']);
  rktRows.push([
    'No',
    'Standar Nasional Pendidikan (SNP)',
    'Uraian Kegiatan / Program RKT',
    'Jumlah Rincian Belanja',
    'Total Anggaran Kegiatan (Rp)',
    'Sumber Dana',
    'Penanggung Jawab',
    'Indikator / Keterangan',
  ]);

  Array.from(activityMap.values()).forEach((act, idx) => {
    rktRows.push([
      idx + 1,
      act.snp,
      act.uraianKegiatan,
      act.itemCount,
      act.total,
      Array.from(act.sumberDanaSet).join(', '),
      Array.from(act.pjSet).join(', ') || '-',
      act.keteranganList.slice(0, 2).join('; ') || '-',
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(rktRows);
  ws3['!cols'] = [
    { wch: 8 },
    { wch: 36 },
    { wch: 46 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 44 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Matriks RKT 8 SNP');

  const safeSchool = sanitizeFilename(school.namaSekolah || 'Sekolah');
  const filename = `RKAS_${safeSchool}_${school.tahunAnggaran}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportRkasToCsv(items: RkasItem[], school: SchoolIdentity): void {
  const headers = [
    'No',
    'Standar Nasional Pendidikan',
    'Jenis Belanja',
    'Uraian Kegiatan',
    'Rincian Belanja',
    'Output (Keluaran)',
    'Keterangan',
    'Volume',
    'Satuan',
    'Harga Satuan (Rp)',
    'Total Anggaran (Rp)',
    'Sumber Dana',
    'Bulan Pelaksanaan',
    'Penanggung Jawab',
    'Prioritas',
  ];

  const escapeCsv = (val: string | number): string => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((item, idx) => [
    idx + 1,
    item.snp,
    item.jenisBelanja,
    item.uraianKegiatan,
    item.rincianBelanja,
    item.keluaran,
    item.keterangan,
    item.volume,
    item.satuan,
    item.hargaSatuan,
    item.totalAnggaran,
    item.sumberDana,
    item.bulan ? item.bulan.join(' | ') : '',
    item.penanggungJawab,
    item.prioritas,
  ]);

  const totalAll = items.reduce((acc, item) => acc + item.totalAnggaran, 0);
  rows.push([
    '',
    '',
    '',
    'JUMLAH TOTAL ANGGARAN',
    '',
    '',
    '',
    '',
    '',
    '',
    totalAll,
    '',
    '',
    '',
    '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSchool = sanitizeFilename(school.namaSekolah || 'Sekolah');
  link.href = url;
  link.setAttribute('download', `RKAS_${safeSchool}_${school.tahunAnggaran}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
