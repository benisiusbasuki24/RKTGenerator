import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatRupiah } from '../utils/formatters';

interface SummaryMetricsProps {
  items: RkasItem[];
  school: SchoolIdentity;
}

export function SummaryMetrics({ items, school }: SummaryMetricsProps) {
  const totalBudget = items.reduce((sum, item) => sum + item.totalAnggaran, 0);
  const bosRegulerTotal = items
    .filter((item) => item.sumberDana === 'BOS Reguler')
    .reduce((sum, item) => sum + item.totalAnggaran, 0);
  const otherFundsTotal = totalBudget - bosRegulerTotal;

  const uniqueActivities = new Set(
    items.map((item) => item.uraianKegiatan.trim().toLowerCase())
  ).size;

  const bosPct =
    totalBudget > 0 ? ((bosRegulerTotal / totalBudget) * 100).toFixed(1) : '0.0';
  const otherPct =
    totalBudget > 0 ? ((otherFundsTotal / totalBudget) * 100).toFixed(1) : '0.0';

  const pagu = school.paguAnggaran || 0;
  const selisihPagu = pagu - totalBudget;

  let paguStatusLabel = 'Pagu belum diatur';
  let paguStatusClass = 'text-slate-600';

  if (pagu > 0) {
    if (selisihPagu === 0) {
      paguStatusLabel = 'Seimbang (Sesuai Pagu)';
      paguStatusClass = 'text-emerald-700 font-medium';
    } else if (selisihPagu > 0) {
      paguStatusLabel = 'Sisa Pagu Tersedia';
      paguStatusClass = 'text-teal-700 font-medium';
    } else {
      paguStatusLabel = 'Melebihi Batas Pagu';
      paguStatusClass = 'text-red-700 font-medium';
    }
  }

  return (
    <section
      aria-label="Ringkasan Anggaran RKAS"
      className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
    >
      <div className="p-5">
        <p className="text-xs font-medium text-slate-500">Total Anggaran RKAS</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatRupiah(totalBudget)}
        </p>
        <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
          {items.length} rincian belanja · {uniqueActivities} kegiatan
        </p>
      </div>

      <div className="p-5">
        <p className="text-xs font-medium text-slate-500">Alokasi BOS Reguler</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatRupiah(bosRegulerTotal)}
        </p>
        <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
          {bosPct}% dari total draf anggaran
        </p>
      </div>

      <div className="p-5">
        <p className="text-xs font-medium text-slate-500">Sumber Dana Lainnya</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {formatRupiah(otherFundsTotal)}
        </p>
        <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
          {otherPct}% · Kinerja, BOPD, Komite
        </p>
      </div>

      <div className="p-5">
        <p className="text-xs font-medium text-slate-500">
          Selisih Terhadap Pagu ({formatRupiah(pagu)})
        </p>
        <p
          className={`mt-1.5 font-mono text-2xl font-semibold tracking-tight tabular-nums ${
            pagu > 0 && selisihPagu < 0 ? 'text-red-700' : 'text-slate-900'
          }`}
        >
          {pagu > 0
            ? `${selisihPagu < 0 ? '-' : ''}${formatRupiah(Math.abs(selisihPagu))}`
            : '—'}
        </p>
        <p className={`mt-1.5 text-xs ${paguStatusClass}`}>{paguStatusLabel}</p>
      </div>
    </section>
  );
}
