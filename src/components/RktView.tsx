import { useMemo, useState } from 'react';
import { Search, User, Presentation, Sparkles, Download, X, Loader2, CheckCircle2 } from 'lucide-react';
import { RkasItem, SchoolIdentity } from '../types/rkas';
import { formatRupiah } from '../utils/formatters';
import { generateAndDownloadPowerPoint } from '../utils/exportPresentation';

interface RktViewProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onNavigateToRkas: () => void;
}

export function RktView({ items, school, onNavigateToRkas }: RktViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [presentationReady, setPresentationReady] = useState(false);

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

  const handleStartPresentationGeneration = () => {
    setIsModalOpen(true);
    setIsGenerating(true);
    setGenerationStep(1);
    setPresentationReady(false);

    // Step 1: Analyzing RKT & SNP data
    setTimeout(() => {
      setGenerationStep(2);
    }, 1200);

    // Step 2: Applying Canva-style elegant design templates
    setTimeout(() => {
      setGenerationStep(3);
    }, 2600);

    // Step 3: Finalizing PowerPoint deck
    setTimeout(() => {
      setIsGenerating(false);
      setPresentationReady(true);
    }, 4000);
  };

  const handleDownloadPptx = () => {
    generateAndDownloadPowerPoint(items, school);
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStartPresentationGeneration}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Presentation className="w-4 h-4" />
              <span>Buatkan Presentasi AI (Canva Style)</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToRkas}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <span>Kelola RKAS</span>
            </button>
          </div>
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

      {/* AI Presentation Generation Modal (Canva Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="font-display text-base font-bold">
                  Generator Presentasi AI (Canva Template Engine)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-center">
              {isGenerating ? (
                <div className="py-8 space-y-6">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-teal-50 rounded-full border-2 border-teal-200">
                    <Loader2 className="w-10 h-10 text-teal-700 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-base font-semibold text-slate-900">
                      Sedang memproses presentasi elegan...
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      AI sedang merangkum {items.length} kegiatan RKT &amp; RKAS {school.namaSekolah} ke dalam slide presentasi profesional.
                    </p>
                  </div>

                  <div className="space-y-2 max-w-xs mx-auto text-left text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      {generationStep >= 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span>Menganalisis 8 Standar Nasional Pendidikan (SNP)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {generationStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span>Menerapkan Template Desain Profesional (Canva Style)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {generationStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span>Merender File PowerPoint (.pptx)</span>
                    </div>
                  </div>
                </div>
              ) : presentationReady ? (
                <div className="py-6 space-y-6">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center bg-emerald-50 rounded-full text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold text-slate-900">
                      Presentasi Siap Diunduh!
                    </h4>
                    <p className="text-xs text-slate-500">
                      File presentasi PowerPoint telah berhasil disusun dengan tata letak profesional siap presentasi.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadPptx}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File PowerPoint (.pptx)</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
