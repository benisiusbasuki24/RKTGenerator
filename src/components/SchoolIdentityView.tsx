import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { DEFAULT_SCHOOL_IDENTITY } from '../data/rkasConstants';
import { SchoolIdentity } from '../types/rkas';

interface SchoolIdentityViewProps {
  school: SchoolIdentity;
  onSave: (updated: SchoolIdentity) => void;
}

export function SchoolIdentityView({ school, onSave }: SchoolIdentityViewProps) {
  const [form, setForm] = useState<SchoolIdentity>(school);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefault = () => {
    setForm(DEFAULT_SCHOOL_IDENTITY);
    onSave(DEFAULT_SCHOOL_IDENTITY);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 max-w-4xl">
      <div className="pb-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Identitas Satuan Pendidikan & Pagu Anggaran
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Data ini ditampilkan pada header dokumen RKAS, blok pengesahan cetak, dan lembar ekspor spreadsheet.
          </p>
        </div>

        {savedNotice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Identitas sekolah tersimpan</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label
              htmlFor="school-name"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Nama Satuan Pendidikan
            </label>
            <input
              id="school-name"
              type="text"
              required
              value={form.namaSekolah}
              onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="school-npsn"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              NPSN
            </label>
            <input
              id="school-npsn"
              type="text"
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value })}
              className="w-full h-10 px-3 font-mono text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="school-jenjang"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Jenjang
            </label>
            <select
              id="school-jenjang"
              value={form.jenjang}
              onChange={(e) =>
                setForm({
                  ...form,
                  jenjang: e.target.value as SchoolIdentity['jenjang'],
                })
              }
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            >
              <option value="PAUD/TK">PAUD / TK</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
              <option value="SLB">SLB</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label
              htmlFor="school-address"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Alamat Sekolah
            </label>
            <input
              id="school-address"
              type="text"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="school-region"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Kecamatan / Kabupaten-Kota
            </label>
            <input
              id="school-region"
              type="text"
              value={form.kecamatanKabKota}
              onChange={(e) =>
                setForm({ ...form, kecamatanKabKota: e.target.value })
              }
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-3">
            <label
              htmlFor="school-year"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Tahun Anggaran
            </label>
            <input
              id="school-year"
              type="text"
              value={form.tahunAnggaran}
              onChange={(e) =>
                setForm({ ...form, tahunAnggaran: e.target.value })
              }
              className="w-full h-10 px-3 font-mono text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="school-pagu"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Pagu Total Anggaran Sekolah (Rp)
            </label>
            <input
              id="school-pagu"
              type="number"
              min="0"
              step="1000"
              value={form.paguAnggaran}
              onChange={(e) =>
                setForm({
                  ...form,
                  paguAnggaran: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full h-10 px-3 font-mono text-sm text-right bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="school-date"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Tanggal Dokumen RKAS
            </label>
            <input
              id="school-date"
              type="date"
              value={form.tanggalDokumen}
              onChange={(e) =>
                setForm({ ...form, tanggalDokumen: e.target.value })
              }
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="school-kepsek"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Nama Kepala Sekolah
              </label>
              <input
                id="school-kepsek"
                type="text"
                value={form.kepalaSekolah}
                onChange={(e) =>
                  setForm({ ...form, kepalaSekolah: e.target.value })
                }
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
            <div>
              <label
                htmlFor="school-nip-kepsek"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                NIP Kepala Sekolah
              </label>
              <input
                id="school-nip-kepsek"
                type="text"
                value={form.nipKepalaSekolah}
                onChange={(e) =>
                  setForm({ ...form, nipKepalaSekolah: e.target.value })
                }
                className="w-full h-10 px-3 font-mono text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="school-bendahara"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Nama Bendahara Sekolah
              </label>
              <input
                id="school-bendahara"
                type="text"
                value={form.bendahara}
                onChange={(e) =>
                  setForm({ ...form, bendahara: e.target.value })
                }
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
            <div>
              <label
                htmlFor="school-nip-bendahara"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                NIP Bendahara
              </label>
              <input
                id="school-nip-bendahara"
                type="text"
                value={form.nipBendahara}
                onChange={(e) =>
                  setForm({ ...form, nipBendahara: e.target.value })
                }
                className="w-full h-10 px-3 font-mono text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Default</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 h-10 px-5 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Simpan Identitas Sekolah</span>
          </button>
        </div>
      </form>
    </section>
  );
}
