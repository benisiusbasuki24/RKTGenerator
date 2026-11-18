import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { BULAN_LIST, SNP_DETAILS, SUMBER_DANA_LIST } from '../data/rkasConstants';
import { Bulan, RkasItem, SchoolIdentity } from '../types/rkas';
import {
  calculateMonthlyAllocation,
  formatRupiah,
} from '../utils/formatters';

interface RecapViewProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onExportXlsx: () => void;
}

export function RecapView({ items, school, onExportXlsx }: RecapViewProps) {
  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAnggaran, 0),
    [items]
  );

  const bySumberDana = useMemo(() => {
    return SUMBER_DANA_LIST.map((sd) => {
      const matching = items.filter((item) => item.sumberDana === sd);
      const total = matching.reduce((sum, item) => sum + item.totalAnggaran, 0);
      const pct = totalBudget > 0 ? (total / totalBudget) * 100 : 0;
      return {
        sumberDana: sd,
        count: matching.length,
        total,
        pct,
      };
    });
  }, [items, totalBudget]);

  const byBulan = useMemo(() => {
    const totals: Record<Bulan, number> = {
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
        totals[m] += alloc[m];
      });
    });
    return BULAN_LIST.map((m) => {
      const total = totals[m];
      const pct = totalBudget > 0 ? (total / totalBudget) * 100 : 0;
      return {
        bulan: m,
        total,
        pct,
      };
    });
  }, [items, totalBudget]);

  const bySnp = useMemo(() => {
    return SNP_DETAILS.map((detail) => {
      const matching = items.filter((item) => item.snp === detail.label);
      const total = matching.reduce((sum, item) => sum + item.totalAnggaran, 0);
      const pct = totalBudget > 0 ? (total / totalBudget) * 100 : 0;
      const activities = Array.from(
        new Set(matching.map((m) => m.uraianKegiatan.trim()).filter(Boolean))
      );
      return {
        kode: detail.kode,
        snp: detail.label,
        fokusRkt: detail.fokusRkt,
        activities,
        count: matching.length,
        total,
        pct,
      };
    });
  }, [items, totalBudget]);

  const rktMatrix = useMemo(() => {
    const map = new Map<
      string,
      {
        snp: string;
        uraianKegiatan: string;
        itemCount: number;
        total: number;
        sumberDana: Set<string>;
        penanggungJawab: Set<string>;
        keterangan: string[];
      }
    >();

    items.forEach((item) => {
      const key = `${item.snp}::${item.uraianKegiatan}`;
      const existing = map.get(key);
      if (existing) {
        existing.itemCount += 1;
        existing.total += item.totalAnggaran;
        existing.sumberDana.add(item.sumberDana);
        if (item.penanggungJawab) existing.penanggungJawab.add(item.penanggungJawab);
        if (item.keterangan) existing.keterangan.push(item.keterangan);
      } else {
        map.set(key, {
          snp: item.snp,
          uraianKegiatan: item.uraianKegiatan,
          itemCount: 1,
          total: item.totalAnggaran,
          sumberDana: new Set([item.sumberDana]),
          penanggungJawab: new Set(
            item.penanggungJawab ? [item.penanggungJawab] : []
          ),
          keterangan: item.keterangan ? [item.keterangan] : [],
        });
      }
    });

    return Array.from(map.values());
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Top 2-Column Ledger Recap: Sumber Dana + Bulan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Rekapitulasi Sumber Dana
              </h2>
              <p className="text-xs text-slate-500">
                Distribusi pembiayaan Tahun Anggaran {school.tahunAnggaran}
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {bySumberDana.map((row) => (
              <div key={row.sumberDana} className="px-6 py-3.5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-900">
                      {row.sumberDana}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 tabular-nums">
                      ({row.count} item)
                    </span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(row.total)}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {row.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Proyeksi Pencairan per Bulan
            </h2>
            <p className="text-xs text-slate-500">
              Pembagian alokasi anggaran berdasarkan jadwal bulan pelaksanaan
            </p>
          </div>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {byBulan.map((row) => (
              <div key={row.bulan} className="px-6 py-3">
                <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-slate-900">
                      {row.bulan}
                    </span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(row.total)}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {row.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, row.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* SNP Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Rekapitulasi 8 Standar Nasional Pendidikan (SNP)
            </h2>
            <p className="text-xs text-slate-500">
              Kesesuaian alokasi anggaran pada setiap standar pendidikan
            </p>
          </div>
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ekspor Rekap ke Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 pl-6 pr-3 min-w-[260px]">
                  Standar Nasional Pendidikan (SNP) &amp; Fokus RKT
                </th>
                <th className="py-3 px-4 min-w-[240px]">
                  Kegiatan RKT Terhubung
                </th>
                <th className="py-3 px-4 text-right">Rincian</th>
                <th className="py-3 px-4 text-right">Total Anggaran RKAS</th>
                <th className="py-3 pl-4 pr-6 text-right">Proporsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bySnp.map((row) => (
                <tr key={row.snp} className="hover:bg-slate-50/70 align-top">
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="font-semibold text-slate-900">{row.snp}</div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-snug max-w-md">
                      {row.fokusRkt}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">
                    {row.activities.length > 0 ? (
                      <ul className="space-y-1">
                        {row.activities.map((act) => (
                          <li key={act} className="leading-snug">
                            • {act}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        Belum ada kegiatan teranggarkan
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {row.count}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatRupiah(row.total)}
                  </td>
                  <td className="py-3.5 pl-4 pr-6 text-right font-mono text-slate-600 tabular-nums">
                    {row.pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-sm">
                <td colSpan={2} className="py-3 px-6 text-slate-900">
                  Total Keseluruhan (8 Standar Nasional Pendidikan)
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 tabular-nums">
                  {items.length}
                </td>
                <td className="py-3 px-4 text-right font-mono text-teal-800 tabular-nums">
                  {formatRupiah(totalBudget)}
                </td>
                <td className="py-3 pl-4 pr-6 text-right font-mono text-slate-900 tabular-nums">
                  {totalBudget > 0 ? '100.0%' : '0.0%'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* RKT Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Matriks Program &amp; Kegiatan RKT ({rktMatrix.length} Kegiatan)
          </h2>
          <p className="text-xs text-slate-500">
            Ringkasan rencana kerja tahunan yang terhubung dengan pagu belanja RKAS
          </p>
        </div>

        {rktMatrix.length === 0 ? (
          <div className="px-6 py-10 text-center text-xs text-slate-500">
            Belum ada program/kegiatan RKT yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 pl-6 pr-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Uraian Kegiatan RKT &amp; SNP</th>
                  <th className="py-3 px-3 text-right">Item Belanja</th>
                  <th className="py-3 px-3">Sumber Dana</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                  <th className="py-3 px-3">Indikator / Keterangan</th>
                  <th className="py-3 pl-3 pr-6 text-right">Total Kegiatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
                {rktMatrix.map((act, idx) => (
                  <tr key={`${act.snp}-${act.uraianKegiatan}`} className="align-top hover:bg-slate-50/70">
                    <td className="py-3 pl-6 pr-3 text-center font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {act.uraianKegiatan}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {act.snp}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {act.itemCount}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {Array.from(act.sumberDana).join(', ')}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {Array.from(act.penanggungJawab).join(', ') || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      {act.keterangan[0] || '—'}
                    </td>
                    <td className="py-3 pl-3 pr-6 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatRupiah(act.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
