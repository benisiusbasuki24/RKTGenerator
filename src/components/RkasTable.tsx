import { useMemo, useState } from 'react';
import {
  Copy,
  FileSpreadsheet,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { SNP_DETAILS, SNP_LIST, SUMBER_DANA_LIST } from '../data/rkasConstants';
import { RkasItem } from '../types/rkas';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface RkasTableProps {
  items: RkasItem[];
  editingId: string | null;
  onEdit: (item: RkasItem) => void;
  onDuplicate: (item: RkasItem) => void;
  onDelete: (id: string) => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
}

type GroupMode = 'flat' | 'grouped' | 'snp';

export function RkasTable({
  items,
  editingId,
  onEdit,
  onDuplicate,
  onDelete,
  onLoadSample,
  onClearAll,
  onExportCsv,
  onExportXlsx,
}: RkasTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSumber, setFilterSumber] = useState<string>('ALL');
  const [filterSnp, setFilterSnp] = useState<string>('ALL');
  const [groupMode, setGroupMode] = useState<GroupMode>('flat');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (filterSumber !== 'ALL' && item.sumberDana !== filterSumber) {
        return false;
      }
      if (filterSnp !== 'ALL' && item.snp !== filterSnp) {
        return false;
      }
      if (q) {
        const hay = [
          item.uraianKegiatan,
          item.rincianBelanja,
          item.kodeRekening,
          item.snp,
          item.sumberDana,
          item.penanggungJawab,
          item.keterangan,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, searchQuery, filterSumber, filterSnp]);

  const groupedActivities = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        uraianKegiatan: string;
        snp: string;
        subtotal: number;
        rows: RkasItem[];
      }
    >();

    filteredItems.forEach((item) => {
      const key = `${item.snp}::${item.uraianKegiatan}`;
      const existing = map.get(key);
      if (existing) {
        existing.rows.push(item);
        existing.subtotal += item.totalAnggaran;
      } else {
        map.set(key, {
          key,
          uraianKegiatan: item.uraianKegiatan,
          snp: item.snp,
          subtotal: item.totalAnggaran,
          rows: [item],
        });
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  const groupedBySnp = useMemo(() => {
    const activeSnps =
      filterSnp === 'ALL'
        ? SNP_DETAILS
        : SNP_DETAILS.filter((s) => s.label === filterSnp);

    return activeSnps.map((snpDetail) => {
      const rows = filteredItems.filter((item) => item.snp === snpDetail.label);
      const subtotal = rows.reduce((sum, item) => sum + item.totalAnggaran, 0);
      return {
        snpDetail,
        subtotal,
        rows,
      };
    });
  }, [filteredItems, filterSnp]);

  const filteredTotal = useMemo(
    () => filteredItems.reduce((sum, item) => sum + item.totalAnggaran, 0),
    [filteredItems]
  );

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAnggaran, 0),
    [items]
  );

  const isFiltered =
    searchQuery.trim() !== '' || filterSumber !== 'ALL' || filterSnp !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterSumber('ALL');
    setFilterSnp('ALL');
  };

  return (
    <section
      aria-labelledby="table-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Header & Controls Toolbar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="table-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Draf Tabel RKAS
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
              Menampilkan {filteredItems.length} dari {items.length} rincian belanja
              {isFiltered && ` · Subtotal tersaring ${formatRupiah(filteredTotal)}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Mode Control */}
            <div
              role="group"
              aria-label="Mode tampilan tabel"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setGroupMode('flat')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  groupMode === 'flat'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabel Lengkap
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('grouped')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  groupMode === 'grouped'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Kegiatan
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('snp')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  groupMode === 'snp'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per 8 SNP
              </button>
            </div>

            <button
              type="button"
              onClick={onExportCsv}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span>Unduh CSV</span>
            </button>

            <button
              type="button"
              onClick={onExportXlsx}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kegiatan, rincian belanja, kode rekening, atau keterangan..."
              aria-label="Cari rincian RKAS"
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter Sumber Dana"
              value={filterSumber}
              onChange={(e) => setFilterSumber(e.target.value)}
              className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            >
              <option value="ALL">Semua Sumber Dana</option>
              {SUMBER_DANA_LIST.map((sd) => (
                <option key={sd} value={sd}>
                  {sd}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <select
              aria-label="Filter Standar Nasional Pendidikan"
              value={filterSnp}
              onChange={(e) => setFilterSnp(e.target.value)}
              className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            >
              <option value="ALL">Semua Standar (SNP)</option>
              {SNP_LIST.map((snp) => (
                <option key={snp} value={snp}>
                  {snp}
                </option>
              ))}
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filter"
                className="h-9 px-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg whitespace-nowrap shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty States */}
      {items.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-display text-sm font-semibold text-slate-900">
            Belum ada rincian belanja di draf RKAS
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Gunakan formulir di atas untuk menambahkan kegiatan dan rincian belanja pertama Anda, atau muat data contoh untuk melihat struktur RKAS lengkap.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Muat Data Contoh RKAS</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-800">
            Tidak ada data yang cocok dengan pencarian atau filter.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 px-4 py-2 text-xs font-medium text-teal-700 hover:text-teal-800 underline underline-offset-4"
          >
            Tampilkan semua baris
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 pl-5 pr-3 w-12 text-center">No</th>
                <th className="py-3 px-3 min-w-[165px]">Kode Rek. & SNP</th>
                <th className="py-3 px-3 min-w-[210px]">Uraian Kegiatan (RKT)</th>
                <th className="py-3 px-3 min-w-[220px]">Rincian Belanja</th>
                <th className="py-3 px-3 text-right min-w-[100px]">Volume</th>
                <th className="py-3 px-3 text-right min-w-[130px]">Harga Satuan</th>
                <th className="py-3 px-3 text-right min-w-[145px]">Total Anggaran</th>
                <th className="py-3 px-3 min-w-[140px]">Sumber Dana</th>
                <th className="py-3 px-3 min-w-[220px]">Keterangan & Detail</th>
                <th className="py-3 pl-3 pr-5 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {groupMode === 'flat'
                ? filteredItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      item={item}
                      rowNumber={index + 1}
                      isEditing={editingId === item.id}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  ))
                : groupMode === 'grouped'
                ? groupedActivities.map((group, gIdx) => (
                    <GroupSection
                      key={group.key}
                      groupIndex={gIdx + 1}
                      group={group}
                      editingId={editingId}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  ))
                : groupedBySnp.map((snpGroup) => (
                    <SnpGroupSection
                      key={snpGroup.snpDetail.kode}
                      snpGroup={snpGroup}
                      editingId={editingId}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    />
                  ))}
            </tbody>
            <tfoot>
              {isFiltered && (
                <tr className="bg-slate-50/70 border-t border-slate-200 text-xs font-medium text-slate-700">
                  <td colSpan={6} className="py-2.5 px-5 text-right">
                    Subtotal Data Tersaring ({filteredItems.length} rincian)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatRupiah(filteredTotal)}
                  </td>
                  <td colSpan={3} />
                </tr>
              )}
              <tr className="bg-slate-50 border-t border-slate-200">
                <td
                  colSpan={6}
                  className="py-3.5 px-5 text-right font-display text-xs sm:text-sm font-semibold text-slate-900"
                >
                  JUMLAH TOTAL ANGGARAN RKAS ({items.length} rincian)
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-sm sm:text-base font-bold text-teal-800 tabular-nums whitespace-nowrap">
                  {formatRupiah(grandTotal)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Quiet Table Footer Utility Actions */}
      {items.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Tip: Klik ikon duplikat pada baris untuk menyalin kegiatan dan menambahkan item belanja berikutnya.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLoadSample}
              className="text-slate-600 hover:text-slate-900 font-medium underline underline-offset-4"
            >
              Reset ke Data Contoh
            </button>
            <span aria-hidden="true">·</span>
            {confirmClear ? (
              <span className="inline-flex items-center gap-2">
                <span className="text-red-700 font-medium">Hapus semua baris?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="text-red-700 font-semibold hover:underline"
                >
                  Ya, Kosongkan
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-red-700 hover:text-red-800 font-medium"
              >
                Kosongkan Tabel
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

interface TableRowProps {
  item: RkasItem;
  rowNumber: number | string;
  isEditing: boolean;
  hideActivity?: boolean;
  onEdit: (item: RkasItem) => void;
  onDuplicate: (item: RkasItem) => void;
  onDelete: (id: string) => void;
}

function TableRow({
  item,
  rowNumber,
  isEditing,
  hideActivity = false,
  onEdit,
  onDuplicate,
  onDelete,
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors align-top ${
        isEditing ? 'bg-teal-50/70' : 'hover:bg-slate-50/80'
      }`}
    >
      <td className="py-3 pl-5 pr-3 text-center font-mono text-xs text-slate-500 tabular-nums">
        {rowNumber}
      </td>
      <td className="py-3 px-3">
        <div className="font-mono text-xs font-medium text-slate-900 tabular-nums">
          {item.kodeRekening}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 leading-snug">
          {item.snp}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-400">
          {item.jenisBelanja}
        </div>
      </td>
      <td className="py-3 px-3">
        {hideActivity ? (
          <span className="text-xs text-slate-400">— sama seperti judul kelompok —</span>
        ) : (
          <div className="font-medium text-slate-900 leading-snug">
            {item.uraianKegiatan}
          </div>
        )}
      </td>
      <td className="py-3 px-3">
        <div className="text-slate-800 leading-snug">{item.rincianBelanja}</div>
      </td>
      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
        <span className="font-medium text-slate-900">
          {formatNumber(item.volume)}
        </span>{' '}
        <span className="text-xs text-slate-500 font-sans">{item.satuan}</span>
      </td>
      <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
        {formatRupiah(item.hargaSatuan)}
      </td>
      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
        {formatRupiah(item.totalAnggaran)}
      </td>
      <td className="py-3 px-3">
        <div className="font-medium text-slate-800">{item.sumberDana}</div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          {item.triwulan.join(' · ')}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="text-xs text-slate-600 leading-snug">
          {item.keterangan || '—'}
        </div>
        <div className="mt-1 text-[11px] text-slate-500">
          PJ: {item.penanggungJawab || '-'} · Prioritas: {item.prioritas}
        </div>
      </td>
      <td className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Ubah rincian"
            aria-label={`Ubah ${item.rincianBelanja}`}
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(item)}
            title="Duplikat baris"
            aria-label={`Duplikat ${item.rincianBelanja}`}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Hapus rincian"
            aria-label={`Hapus ${item.rincianBelanja}`}
            className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface GroupSectionProps {
  groupIndex: number;
  group: {
    key: string;
    uraianKegiatan: string;
    snp: string;
    subtotal: number;
    rows: RkasItem[];
  };
  editingId: string | null;
  onEdit: (item: RkasItem) => void;
  onDuplicate: (item: RkasItem) => void;
  onDelete: (id: string) => void;
}

function GroupSection({
  groupIndex,
  group,
  editingId,
  onEdit,
  onDuplicate,
  onDelete,
}: GroupSectionProps) {
  return (
    <>
      <tr className="bg-slate-50/90 border-t border-slate-200">
        <td className="py-2.5 pl-5 pr-3 text-center font-mono text-xs font-semibold text-teal-800">
          {groupIndex}
        </td>
        <td colSpan={5} className="py-2.5 px-3">
          <span className="font-display font-semibold text-slate-900">
            {group.uraianKegiatan}
          </span>
          <span className="mx-2 text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500">{group.snp}</span>
          <span className="mx-2 text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            {group.rows.length} rincian
          </span>
        </td>
        <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm font-bold text-teal-800 tabular-nums whitespace-nowrap">
          {formatRupiah(group.subtotal)}
        </td>
        <td colSpan={3} />
      </tr>
      {group.rows.map((item, idx) => (
        <TableRow
          key={item.id}
          item={item}
          rowNumber={`${groupIndex}.${idx + 1}`}
          isEditing={editingId === item.id}
          hideActivity
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

interface SnpGroupSectionProps {
  snpGroup: {
    snpDetail: { kode: string; label: string; fokusRkt: string };
    subtotal: number;
    rows: RkasItem[];
  };
  editingId: string | null;
  onEdit: (item: RkasItem) => void;
  onDuplicate: (item: RkasItem) => void;
  onDelete: (id: string) => void;
}

function SnpGroupSection({
  snpGroup,
  editingId,
  onEdit,
  onDuplicate,
  onDelete,
}: SnpGroupSectionProps) {
  return (
    <>
      <tr className="bg-slate-50/90 border-t border-slate-200">
        <td className="py-2.5 pl-5 pr-3 text-center font-mono text-xs font-semibold text-teal-800">
          {snpGroup.snpDetail.kode}
        </td>
        <td colSpan={5} className="py-2.5 px-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display font-semibold text-slate-900">
              {snpGroup.snpDetail.label}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              · {snpGroup.rows.length} rincian belanja
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {snpGroup.snpDetail.fokusRkt}
          </p>
        </td>
        <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm font-bold text-teal-800 tabular-nums whitespace-nowrap align-middle">
          {formatRupiah(snpGroup.subtotal)}
        </td>
        <td colSpan={3} />
      </tr>
      {snpGroup.rows.length === 0 ? (
        <tr>
          <td
            colSpan={10}
            className="py-2.5 px-5 text-xs text-slate-400 italic"
          >
            Belum ada rincian belanja pada standar ini.
          </td>
        </tr>
      ) : (
        snpGroup.rows.map((item, idx) => (
          <TableRow
            key={item.id}
            item={item}
            rowNumber={`${snpGroup.snpDetail.kode}.${idx + 1}`}
            isEditing={editingId === item.id}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))
      )}
    </>
  );
}
