import pptxgen from 'pptxgenjs';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatRupiah } from './formatters';

export function generateAndDownloadPowerPoint(items: RkasItem[], school: SchoolIdentity): void {
  const pptx = new pptxgen();

  pptx.author = school.namaSekolah;
  pptx.company = 'RKT-RKAS Generator';
  pptx.title = `Presentasi RKT & RKAS ${school.namaSekolah} ${school.tahunAnggaran}`;
  pptx.subject = 'Rencana Kerja Tahunan dan Anggaran Sekolah';

  const PRIMARY_COLOR = '0F766E'; // Teal 700
  const SECONDARY_COLOR = '1E293B'; // Slate 800
  const LIGHT_BG = 'F8FAFC'; // Slate 50
  const WHITE = 'FFFFFF';
  const ACCENT_COLOR = '0D9488'; // Teal 600

  // -------------------------------------------------------------
  // SLIDE 1: COVER SLIDE
  // -------------------------------------------------------------
  const slideCover = pptx.addSlide();
  slideCover.background = { fill: PRIMARY_COLOR };

  slideCover.addText('RENCANA KERJA TAHUNAN & RKAS', {
    x: 0.8,
    y: 1.8,
    w: '85%',
    h: 1.0,
    fontSize: 32,
    bold: true,
    color: WHITE,
    fontFace: 'Arial',
  });

  slideCover.addText(`TAHUN ANGGARAN ${school.tahunAnggaran}`, {
    x: 0.8,
    y: 2.8,
    w: '85%',
    h: 0.6,
    fontSize: 20,
    bold: true,
    color: '99F6E4',
    fontFace: 'Arial',
  });

  slideCover.addText(`${school.namaSekolah}\nNPSN: ${school.npsn} | ${school.kecamatanKabKota}`, {
    x: 0.8,
    y: 4.0,
    w: '85%',
    h: 1.2,
    fontSize: 14,
    color: WHITE,
    fontFace: 'Arial',
  });

  // -------------------------------------------------------------
  // SLIDE 2: IDENTITAS & PROFIL SEKOLAH
  // -------------------------------------------------------------
  const slideId = pptx.addSlide();
  slideId.background = { fill: LIGHT_BG };

  slideId.addText('PROFIL & IDENTITAS SATUAN PENDIDIKAN', {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.8,
    fontSize: 22,
    bold: true,
    color: SECONDARY_COLOR,
  });

  const identityRows = [
    ['Nama Sekolah:', school.namaSekolah],
    ['NPSN:', school.npsn],
    ['Jenjang:', school.jenjang],
    ['Alamat:', school.alamat],
    ['Wilayah:', school.kecamatanKabKota],
    ['Kepala Sekolah:', school.kepalaSekolah],
    ['Bendahara:', school.bendahara],
    ['Pagu Total Anggaran:', formatRupiah(school.paguAnggaran)],
  ];

  slideId.addTable(
    identityRows.map((row) => [
      { text: row[0], options: { bold: true, color: SECONDARY_COLOR, fontSize: 13 } },
      { text: row[1], options: { color: '334155', fontSize: 13 } },
    ]),
    {
      x: 0.8,
      y: 1.6,
      w: 8.4,
      h: 4.2,
      colW: [2.8, 5.6],
      border: { pt: 0.5, color: 'E2E8F0' },
      fill: { color: WHITE },
    }
  );

  // -------------------------------------------------------------
  // SLIDE 3: RINGKASAN KEGIATAN RKT (8 SNP)
  // -------------------------------------------------------------
  const slideRkt = pptx.addSlide();
  slideRkt.background = { fill: LIGHT_BG };

  slideRkt.addText('RINGKASAN RENCANA KERJA TAHUNAN (RKT)', {
    x: 0.8,
    y: 0.6,
    w: '85%',
    h: 0.8,
    fontSize: 22,
    bold: true,
    color: SECONDARY_COLOR,
  });

  const totalItems = items.length;
  const totalAnggaranAll = items.reduce((sum, i) => sum + i.totalAnggaran, 0);

  slideRkt.addText(
    `Total Kegiatan Teranggarkan: ${totalItems} Program/Rincian Belanja\nAkumulasi Anggaran RKAS: ${formatRupiah(totalAnggaranAll)}`,
    {
      x: 0.8,
      y: 1.5,
      w: '85%',
      h: 1.0,
      fontSize: 14,
      color: ACCENT_COLOR,
      bold: true,
    }
  );

  const sampleRktRows = items.slice(0, 6).map((item, idx) => [
    { text: String(idx + 1), options: { fontSize: 11 } },
    { text: item.snp.slice(0, 24), options: { fontSize: 11 } },
    { text: item.uraianKegiatan.slice(0, 30), options: { fontSize: 11 } },
    { text: formatRupiah(item.totalAnggaran), options: { fontSize: 11 } },
  ]);

  slideRkt.addTable(
    [
      [
        { text: 'No', options: { bold: true, fill: { color: PRIMARY_COLOR }, color: WHITE, fontSize: 11 } },
        { text: 'SNP / Program', options: { bold: true, fill: { color: PRIMARY_COLOR }, color: WHITE, fontSize: 11 } },
        { text: 'Uraian Kegiatan', options: { bold: true, fill: { color: PRIMARY_COLOR }, color: WHITE, fontSize: 11 } },
        { text: 'Anggaran', options: { bold: true, fill: { color: PRIMARY_COLOR }, color: WHITE, fontSize: 11 } },
      ],
      ...sampleRktRows,
    ],
    {
      x: 0.8,
      y: 2.6,
      w: 8.4,
      h: 3.5,
      colW: [0.6, 2.6, 3.2, 2.0],
      border: { pt: 0.5, color: 'CBD5E1' },
    }
  );

  // -------------------------------------------------------------
  // SLIDE 4: PENUTUP / PENGESAHAN
  // -------------------------------------------------------------
  const slideClose = pptx.addSlide();
  slideClose.background = { fill: LIGHT_BG };

  slideClose.addText('PENGESAHAN & PENUTUP', {
    x: 0.8,
    y: 0.8,
    w: '85%',
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: SECONDARY_COLOR,
  });

  slideClose.addText(
    `Dokumen Rencana Kerja Tahunan (RKT) dan Rencana Kegiatan dan Anggaran Sekolah (RKAS) ${school.namaSekolah} Tahun Anggaran ${school.tahunAnggaran} disusun untuk mencapai standar mutu pendidikan terbaik.`,
    {
      x: 0.8,
      y: 1.8,
      w: '85%',
      h: 1.2,
      fontSize: 14,
      color: '475569',
    }
  );

  slideClose.addText(
    `Mengetahui,\nKepala Sekolah\n\n\n${school.kepalaSekolah}\nNIP. ${school.nipKepalaSekolah}`,
    {
      x: 0.8,
      y: 3.6,
      w: 3.8,
      h: 2.2,
      fontSize: 12,
      color: SECONDARY_COLOR,
      align: 'center',
    }
  );

  slideClose.addText(
    `Dibuat oleh,\nBendahara Sekolah\n\n\n${school.bendahara}\nNIP. ${school.nipBendahara}`,
    {
      x: 5.4,
      y: 3.6,
      w: 3.8,
      h: 2.2,
      fontSize: 12,
      color: SECONDARY_COLOR,
      align: 'center',
    }
  );

  const safeSchoolName = school.namaSekolah.replace(/[^a-zA-Z0-9_-]/g, '_');
  pptx.writeFile({ fileName: `Presentasi_RKT_RKAS_${safeSchoolName}_${school.tahunAnggaran}.pptx` });
}
