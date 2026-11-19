import React, { useMemo } from 'react';
import { Printer, Download, FileSpreadsheet } from 'lucide-react';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatNumber, formatRupiah, formatDateIndo } from '../utils/formatters';

interface PrintPreviewViewProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onExportXlsx: () => void;
}

export function PrintPreviewView({
  items,
  school,
  onExportXlsx,
}: PrintPreviewViewProps) {
  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAnggaran, 0),
    [items]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Pratinjau Cetak Dokumen RKAS Resmi
          </h2>
          <p className="text-xs text-slate-500">
            Format cetak lembar pengesahan dan rincian belanja anggaran sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (PDF/Print)</span>
          </button>

          <button
            type="button"
            onClick={onExportXlsx}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Printable Document Sheet */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-sm max-w-[1440px] mx-auto text-slate-900 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="text-center space-y-2 pb-6 border-b-2 border-slate-900">
          <h3 className="font-display text-sm sm:text-base font-semibold tracking-wider uppercase text-slate-700">
            YAYASAN PENDIDIKAN KRISTEN (BOPKRI)
          </h3>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase">
            RENCANA KEGIATAN DAN ANGGARAN SEKOLAH (RKAS)
          </h1>
          <h2 className="font-display text-lg font-bold text-teal-800 uppercase">
            {school.namaSekolah}
          </h2>
          <p className="text-xs text-slate-600">
            NPSN: {school.npsn} &bull; Alamat: {school.alamat}, {school.kecamatanKabKota} &bull; Tahun Anggaran: {school.tahunAnggaran}
          </p>
        </div>

        {/* School Context Metadata */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block">Jenjang Pendidikan</span>
            <strong className="text-slate-900 font-semibold">{school.jenjang}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Pagu Total Anggaran</span>
            <strong className="text-teal-900 font-mono font-bold">{formatRupiah(school.paguAnggaran)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Total Draf Anggaran</span>
            <strong className="text-slate-900 font-mono font-bold">{formatRupiah(totalBudget)}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tanggal Dokumen</span>
            <strong className="text-slate-900">{formatDateIndo(school.tanggalDokumen)}</strong>
          </div>
        </div>

        {/* Formal RKAS Table with Distinct Columns */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-semibold text-center">
                <th className="border border-slate-300 py-2 px-2 w-8">No</th>
                <th className="border border-slate-300 py-2 px-2 text-left">SNP</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Uraian Kegiatan</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Rincian Belanja</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Output (Keluaran)</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Keterangan</th>
                <th className="border border-slate-300 py-2 px-2 text-right">Vol</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Satuan</th>
                <th className="border border-slate-300 py-2 px-2 text-right">Harga Satuan</th>
                <th className="border border-slate-300 py-2 px-2 text-right">Jumlah (Rp)</th>
                <th className="border border-slate-300 py-2 px-2 text-left">Sumber Dana</th>
                <th className="border border-slate-300 py-2 px-2 text-center">Bulan</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="border border-slate-300 py-8 text-center text-slate-500"
                  >
                    Belum ada rincian belanja pada draf RKAS.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="align-top">
                    <td className="border border-slate-300 py-1.5 px-2 text-center font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 font-semibold">
                      {item.snp}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 font-medium">
                      {item.uraianKegiatan}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-slate-700">
                      {item.rincianBelanja}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-teal-900 bg-teal-50/20">
                      {item.keluaran || '-'}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-slate-600">
                      {item.keterangan || '-'}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-right font-mono tabular-nums">
                      {formatNumber(item.volume)}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2">
                      {item.satuan}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                      {formatRupiah(item.hargaSatuan)}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                      {formatRupiah(item.totalAnggaran)}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 whitespace-nowrap">
                      {item.sumberDana}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2 text-center">
                      {item.bulan ? item.bulan.join(', ') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td
                  colSpan={9}
                  className="border border-slate-300 py-2 px-3 text-right"
                >
                  JUMLAH TOTAL ANGGARAN RKAS:
                </td>
                <td
                  colSpan={3}
                  className="border border-slate-300 py-2 px-3 text-right font-mono text-teal-900 tabular-nums"
                >
                  {formatRupiah(totalBudget)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature Block */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs sm:text-sm page-break-inside-avoid">
          <div className="text-center space-y-16">
            <div>
              <p className="font-medium">Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah</p>
            </div>
            <div>
              <p className="font-bold underline">{school.kepalaSekolah}</p>
              <p className="font-mono text-xs text-slate-600">NIP. {school.nipKepalaSekolah}</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <div>
              <p className="font-medium">Dibuat oleh,</p>
              <p className="font-semibold">Bendahara Sekolah</p>
            </div>
            <div>
              <p className="font-bold underline">{school.bendahara}</p>
              <p className="font-mono text-xs text-slate-600">NIP. {school.nipBendahara}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
