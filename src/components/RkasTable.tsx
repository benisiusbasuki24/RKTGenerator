import React, { useMemo, useState } from 'react';
import { Search, Download, FileSpreadsheet, Copy, Trash2, Pencil, RotateCcw } from 'lucide-react';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { SNP_LIST, SUMBER_DANA_LIST } from '../data/rkasConstants';

interface RkasTableProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onEdit: (item: RkasItem) => void;
  onDuplicate: (item: RkasItem) => void;
  onDelete: (id: string) => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
}

export function RkasTable({
  items,
  school,
  onEdit,
  onDuplicate,
  onDelete,
  onLoadSample,
  onExportXlsx,
  onExportCsv,
}: RkasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSnp, setFilterSnp] = useState('ALL');
  const [filterSumber, setFilterSumber] = useState('ALL');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSnp = filterSnp === 'ALL' || item.snp === filterSnp;
      const matchSumber = filterSumber === 'ALL' || item.sumberDana === filterSumber;
      const matchSearch =
        !searchTerm.trim() ||
        item.uraianKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rincianBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.penanggungJawab && item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSnp && matchSumber && matchSearch;
    });
  }, [items, filterSnp, filterSumber, searchTerm]);

  const totalFiltered = filteredItems.reduce((acc, item) => acc + item.totalAnggaran, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Draf RKAS — {school.namaSekolah}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total Anggaran Terfiltrasi: <strong className="font-mono text-teal-800">{formatRupiah(totalFiltered)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Contoh</span>
          </button>

          <button
            type="button"
            onClick={onExportXlsx}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 disabled:opacity-50 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari uraian, rincian, atau PJ..."
            className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          />
        </div>

        <div>
          <select
            value={filterSnp}
            onChange={(e) => setFilterSnp(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">Semua Standar Nasional Pendidikan (SNP)</option>
            {SNP_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSumber}
            onChange={(e) => setFilterSumber(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">Semua Sumber Dana</option>
            {SUMBER_DANA_LIST.map((sd) => (
              <option key={sd} value={sd}>
                {sd}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table with distinct columns */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Tidak ada rincian RKAS yang cocok dengan kriteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider text-center">
                  <th className="py-3 px-3 border border-slate-700 w-12">No</th>
                  <th className="py-3 px-3 border border-slate-700 w-44">SNP</th>
                  <th className="py-3 px-3 border border-slate-700 w-48">Uraian</th>
                  <th className="py-3 px-3 border border-slate-700 w-52">Rincian Belanja</th>
                  <th className="py-3 px-3 border border-slate-700 w-48">Output (Keluaran)</th>
                  <th className="py-3 px-3 border border-slate-700 w-48">Keterangan</th>
                  <th className="py-3 px-3 border border-slate-700 w-28">Volume</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">Harga Satuan</th>
                  <th className="py-3 px-3 border border-slate-700 w-36">Total Anggaran</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">Sumber Dana</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">Bulan</th>
                  <th className="py-3 px-3 border border-slate-700 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors align-top">
                    <td className="py-3 px-3 border border-slate-200 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 font-semibold text-slate-900">
                      {item.snp}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 font-medium text-slate-900">
                      {item.uraianKegiatan}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-700">
                      {item.rincianBelanja}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-teal-900 bg-teal-50/30">
                      {item.keluaran || '-'}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-600">
                      {item.keterangan || '-'}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-right font-mono tabular-nums text-slate-700">
                      {formatNumber(item.volume)} {item.satuan}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-right font-mono tabular-nums text-slate-700">
                      {formatRupiah(item.hargaSatuan)}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(item.totalAnggaran)}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-800">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-800 rounded">
                        {item.sumberDana}
                      </span>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.bulan && item.bulan.length > 0 ? (
                          item.bulan.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-800 rounded border border-teal-200">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Ubah"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          title="Duplikasi"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title="Hapus"
                          className="p-1.5 text-slate-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t border-slate-200 font-bold text-slate-900">
                  <td colSpan={8} className="py-3 px-3 text-right uppercase text-xs">
                    Total Anggaran RKAS Terfiltrasi:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-teal-900 tabular-nums">
                    {formatRupiah(totalFiltered)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
