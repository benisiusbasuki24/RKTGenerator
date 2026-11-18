import { Download, Printer } from 'lucide-react';
import { SNP_DETAILS } from '../data/rkasConstants';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatDateIndo, formatNumber, formatRupiah } from '../utils/formatters';

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
  const grandTotal = items.reduce((sum, item) => sum + item.totalAnggaran, 0);

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Pratinjau Dokumen Resmi RKAS
          </h2>
          <p className="text-xs text-slate-500">
            Siap dicetak dalam format kertas A4 Landscape atau disimpan sebagai PDF melalui dialog cetak browser.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Unduh Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Sheet */}
      <article className="print-only-container bg-white border border-slate-200 rounded-xl p-8 sm:p-10 text-slate-900">
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h1 className="font-display text-lg font-bold tracking-tight uppercase">
            Rencana Kegiatan dan Anggaran Sekolah (RKAS)
          </h1>
          <p className="text-sm font-semibold mt-0.5">
            Tahun Anggaran {school.tahunAnggaran}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {school.namaSekolah} · NPSN {school.npsn} · {school.alamat},{' '}
            {school.kecamatanKabKota}
          </p>
        </div>

        {/* School Metadata */}
        <div className="grid grid-cols-2 gap-6 py-4 text-xs border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-36 text-slate-500">Satuan Pendidikan</span>
              <span className="font-semibold">: {school.namaSekolah}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500">NPSN / Jenjang</span>
              <span>
                : {school.npsn} ({school.jenjang})
              </span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500">Kecamatan / Kab-Kota</span>
              <span>: {school.kecamatanKabKota}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-36 text-slate-500">Tahun Anggaran</span>
              <span className="font-semibold">: {school.tahunAnggaran}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500">Pagu Anggaran</span>
              <span className="font-mono tabular-nums">
                : {formatRupiah(school.paguAnggaran)}
              </span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-500">Total Draf RKAS</span>
              <span className="font-mono font-semibold tabular-nums">
                : {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Formal RKAS Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-semibold">
                <th className="border border-slate-300 py-2 px-2 text-center w-8">
                  No
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Kode Rekening
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Uraian Kegiatan & SNP
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Rincian Belanja
                </th>
                <th className="border border-slate-300 py-2 px-2 text-right">
                  Vol
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Satuan
                </th>
                <th className="border border-slate-300 py-2 px-2 text-right">
                  Harga Satuan
                </th>
                <th className="border border-slate-300 py-2 px-2 text-right">
                  Jumlah (Rp)
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Sumber Dana
                </th>
                <th className="border border-slate-300 py-2 px-2 text-left">
                  Keterangan / TW
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
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
                    <td className="border border-slate-300 py-1.5 px-2 font-mono tabular-nums whitespace-nowrap">
                      {item.kodeRekening}
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2">
                      <div className="font-medium">{item.uraianKegiatan}</div>
                      <div className="text-[10px] text-slate-600">{item.snp}</div>
                    </td>
                    <td className="border border-slate-300 py-1.5 px-2">
                      {item.rincianBelanja}
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
                    <td className="border border-slate-300 py-1.5 px-2">
                      <div>{item.triwulan.join(', ')}</div>
                      {item.keterangan && (
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          {item.keterangan}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td
                  colSpan={7}
                  className="border border-slate-300 py-2 px-3 text-right"
                >
                  JUMLAH TOTAL ANGGARAN RKAS
                </td>
                <td className="border border-slate-300 py-2 px-2 text-right font-mono tabular-nums whitespace-nowrap">
                  {formatRupiah(grandTotal)}
                </td>
                <td colSpan={2} className="border border-slate-300 py-2 px-2" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 8 SNP Summary Table */}
        <div className="mt-6">
          <h2 className="font-display text-xs font-bold uppercase tracking-wide text-slate-800 mb-2">
            Rekapitulasi Anggaran per 8 Standar Nasional Pendidikan (SNP)
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-semibold">
                <th className="border border-slate-300 py-1.5 px-2 text-center w-10">
                  Kode
                </th>
                <th className="border border-slate-300 py-1.5 px-2 text-left">
                  Standar Nasional Pendidikan
                </th>
                <th className="border border-slate-300 py-1.5 px-2 text-right w-20">
                  Item
                </th>
                <th className="border border-slate-300 py-1.5 px-2 text-right w-36">
                  Jumlah Anggaran (Rp)
                </th>
                <th className="border border-slate-300 py-1.5 px-2 text-right w-20">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody>
              {SNP_DETAILS.map((snp) => {
                const matching = items.filter((i) => i.snp === snp.label);
                const subtotal = matching.reduce(
                  (s, i) => s + i.totalAnggaran,
                  0
                );
                const pct =
                  grandTotal > 0 ? ((subtotal / grandTotal) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={snp.kode}>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono tabular-nums">
                      {snp.kode}
                    </td>
                    <td className="border border-slate-300 py-1 px-2">
                      {snp.label}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-right font-mono tabular-nums">
                      {matching.length}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-right font-mono tabular-nums">
                      {formatRupiah(subtotal)}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-right font-mono tabular-nums">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signature Block */}
        <div className="mt-10 grid grid-cols-2 gap-12 text-xs">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala {school.namaSekolah}</p>
            <div className="h-16" />
            <p className="font-semibold underline underline-offset-4">
              {school.kepalaSekolah || '...........................'}
            </p>
            <p className="mt-0.5 text-slate-600">
              NIP. {school.nipKepalaSekolah || '-'}
            </p>
          </div>
          <div className="text-center">
            <p>
              {school.kecamatanKabKota.split(',').pop()?.trim() || 'Sekolah'},{' '}
              {formatDateIndo(school.tanggalDokumen)}
            </p>
            <p className="font-semibold">Bendahara Sekolah</p>
            <div className="h-16" />
            <p className="font-semibold underline underline-offset-4">
              {school.bendahara || '...........................'}
            </p>
            <p className="mt-0.5 text-slate-600">
              NIP. {school.nipBendahara || '-'}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
