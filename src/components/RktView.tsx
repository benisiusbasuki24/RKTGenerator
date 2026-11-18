import { useMemo, useState } from 'react';
import { Search, User } from 'lucide-react';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatRupiah } from '../utils/formatters';

interface RktViewProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onNavigateToRkas: () => void;
}

export function RktView({ items, school, onNavigateToRkas }: RktViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.uraianKegiatan.toLowerCase().includes(term) ||
        item.snp.toLowerCase().includes(term) ||
        item.penanggungJawab.toLowerCase().includes(term) ||
        item.rincianBelanja.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Official Header matching SD BOPKRI Gondolayu document */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 shadow-xs text-slate-900">
        <div className="text-center space-y-1.5 pb-6 border-b border-slate-200">
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase">
            RENCANA KERJA TAHUNAN (RKT)
          </h1>
          <p className="font-display text-base font-semibold uppercase text-slate-700">
            UNIT SEKOLAH : {school.namaSekolah}
          </p>
          <p className="font-mono text-sm font-bold text-teal-800">
            TAHUN {school.tahunAnggaran}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kegiatan, program, atau penanggung jawab..."
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
            />
          </div>

          <button
            type="button"
            onClick={onNavigateToRkas}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
          >
            <span>Tambah &amp; Kelola Kegiatan RKAS</span>
          </button>
        </div>
      </div>

      {/* Official RKT Table matching exact uploaded PDF column structure */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Belum ada kegiatan RKT terdaftar. Tambahkan data kegiatan melalui menu RKAS.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider text-center">
                  <th className="py-3 px-3 border border-slate-700 w-12">NO</th>
                  <th className="py-3 px-3 border border-slate-700 w-44">PROGRAM</th>
                  <th className="py-3 px-3 border border-slate-700 w-48">KEGIATAN</th>
                  <th className="py-3 px-3 border border-slate-700 w-56">INDIKATOR KEBERHASILAN</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">SASARAN</th>
                  <th className="py-3 px-3 border border-slate-700 w-40">PENANGGUNG JAWAB</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">ANGGARAN</th>
                  <th className="py-3 px-3 border border-slate-700 w-40">WAKTU PELAKSANAAN (BULAN)</th>
                  <th className="py-3 px-3 border border-slate-700 w-56">KELUARAN (OUTPUT)</th>
                  <th className="py-3 px-3 border border-slate-700 w-52">KETERANGAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors align-top">
                    <td className="py-3 px-3 border border-slate-200 text-center font-mono text-slate-600 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 font-semibold text-slate-900">
                      {item.snp}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 font-medium text-slate-900">
                      <div>{item.uraianKegiatan}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        {item.rincianBelanja}
                      </div>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-700 leading-relaxed">
                      Terwujudnya peningkatan mutu pada standar kegiatan {item.uraianKegiatan} sesuai standar operasional sekolah.
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-700 text-center">
                      {item.volume} {item.satuan}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.penanggungJawab || school.kepalaSekolah}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatRupiah(item.totalAnggaran)}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {item.bulan && item.bulan.length > 0 ? (
                          item.bulan.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-medium rounded border border-teal-200">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Belum diset</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-700 leading-relaxed">
                      {item.keluaran || 'Terlaksananya kegiatan sekolah secara tertib, lancar, dan mencapai target mutu.'}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-600 leading-relaxed">
                      {item.keterangan || 'Proposal, daftar hadir, dokumentasi kegiatan, dan LPJ.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
