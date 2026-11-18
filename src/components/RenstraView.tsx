import { Award, BookOpen, CheckCircle, ShieldCheck, Target } from 'lucide-react';
import { SchoolIdentity } from '../types/rkas';

interface RenstraViewProps {
  school: SchoolIdentity;
}

export function RenstraView({ school }: RenstraViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-800/80 text-teal-100 border border-teal-700 mb-3">
            <Target className="w-3.5 h-3.5" />
            Rencana Strategis (RENSTRA) Sekolah
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Tujuan &amp; Sasaran Strategis {school.namaSekolah}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Kerangka acuan strategis 4 tahunan satuan pendidikan dalam mewujudkan lulusan yang cerdas berkarakter serta penguatan tata kelola sekolah berbasis Manajemen Berbasis Sekolah (MBS) Kontekstual.
          </p>
        </div>
      </div>

      {/* Strategic Goals Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal I */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-display font-bold text-lg">
                I
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Menghasilkan Lulusan yang Cerdas Berkarakter
                </h3>
                <span className="text-xs text-teal-700 font-medium">Standar Kompetensi &amp; Karakter</span>
              </div>
            </div>

            <ul className="space-y-3 mt-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Indikator 1.1:</strong> 100% lulusan memiliki karakter kebopkrian dan menunjukkan perkembangan pada potensi kecerdasan yang dimiliki.
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Indikator 1.2:</strong> 90% guru mampu mengimplementasikan pembelajaran yang mengintegrasikan nilai-nilai kebopkrian dan mengakomodasi keberagaman potensi kecerdasan pada peserta didik.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fokus: P5, Literasi, Numerasi &amp; Prestasi Lomba</span>
            <span className="font-medium text-slate-700">Periode 4 Tahun</span>
          </div>
        </div>

        {/* Goal II */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-display font-bold text-lg">
                II
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Menguatkan Sistem Tata Kelola Sekolah dengan MBS Kontekstual
                </h3>
                <span className="text-xs text-teal-700 font-medium">Manajemen Berbasis Sekolah</span>
              </div>
            </div>

            <ul className="space-y-3 mt-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <CheckCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Indikator 2.1:</strong> 100% program kerja dan anggaran disusun dan dijalankan berdasarkan evaluasi serta kebutuhan sekolah secara partisipatif dan akuntabel.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fokus: RKT-RKAS, Akuntabilitas &amp; Supervisi</span>
            <span className="font-medium text-slate-700">Periode 4 Tahun</span>
          </div>
        </div>
      </div>

      {/* Core Values / Nilai Kebopkrian */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="font-display text-base font-bold text-slate-900 mb-4">
          Nilai Dasar &amp; Budaya Mutu SD BOPKRI Gondolayu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm mb-3">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-900 mb-1">Kasih &amp; Pelayanan Tulus</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Memberikan layanan pendidikan prima yang berlandaskan kasih, ketulusan, serta perhatian bagi setiap anak didik.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-900 mb-1">Integritas &amp; Profesionalisme</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menjunjung tinggi kejujuran, transparansi pengelolaan anggaran, serta kompetensi tenaga pendidik dan kependidikan.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-display text-sm font-bold text-slate-900 mb-1">Keunggulan Kontekstual</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengembangkan potensi kecerdasan majemuk peserta didik selaras dengan tantangan zaman dan kebudayaan lokal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
