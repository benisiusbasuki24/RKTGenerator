import React, { useState } from 'react';
import { Check, Edit3, Save, Target, Compass, BookOpen, Award } from 'lucide-react';
import { RenstraData, SchoolIdentity } from '../types/rkas';
import { DEFAULT_RENSTRA } from '../data/rkasConstants';

interface RenstraViewProps {
  school: SchoolIdentity;
}

export function RenstraView({ school }: RenstraViewProps) {
  const [renstra, setRenstra] = useState<RenstraData>(() => {
    try {
      const saved = localStorage.getItem('rkt_rkas_generator_renstra_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_RENSTRA;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('rkt_rkas_generator_renstra_v1', JSON.stringify(renstra));
    } catch {
      // ignore
    }
    setIsEditing(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleMisiChange = (index: number, val: string) => {
    const nextMisi = [...renstra.misi];
    nextMisi[index] = val;
    setRenstra({ ...renstra, misi: nextMisi });
  };

  const handleAddMisi = () => {
    setRenstra({ ...renstra, misi: [...renstra.misi, ''] });
  };

  const handleRemoveMisi = (index: number) => {
    setRenstra({
      ...renstra,
      misi: renstra.misi.filter((_, i) => i !== index),
    });
  };

  const handleTujuanChange = (index: number, val: string) => {
    const nextTujuan = [...renstra.tujuanStrategis];
    nextTujuan[index] = val;
    setRenstra({ ...renstra, tujuanStrategis: nextTujuan });
  };

  const handleAddTujuan = () => {
    setRenstra({ ...renstra, tujuanStrategis: [...renstra.tujuanStrategis, ''] });
  };

  const handleRemoveTujuan = (index: number) => {
    setRenstra({
      ...renstra,
      tujuanStrategis: renstra.tujuanStrategis.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full border border-teal-200 mb-2">
            <span>Periode Renstra: {renstra.periode}</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Rencana Strategis (RENSTRA) — {school.namaSekolah}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Visi, Misi, Tujuan Strategis, dan Sasaran Mutu Satuan Pendidikan jangka menengah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4" />
              <span>Renstra tersimpan</span>
            </span>
          )}

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Renstra</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Batal Edit</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="font-display text-base font-semibold text-slate-900 pb-3 border-b border-slate-200">
            Form Edit Rencana Strategis (RENSTRA)
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Periode Renstra
            </label>
            <input
              type="text"
              value={renstra.periode}
              onChange={(e) => setRenstra({ ...renstra, periode: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Visi Sekolah
            </label>
            <textarea
              rows={3}
              value={renstra.visi}
              onChange={(e) => setRenstra({ ...renstra, visi: e.target.value })}
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700">Misi Sekolah</label>
              <button
                type="button"
                onClick={handleAddMisi}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
              >
                + Tambah Poin Misi
              </button>
            </div>
            {renstra.misi.map((m, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleMisiChange(idx, e.target.value)}
                  className="flex-1 h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMisi(idx)}
                  className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700">Tujuan Strategis</label>
              <button
                type="button"
                onClick={handleAddTujuan}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
              >
                + Tambah Tujuan
              </button>
            </div>
            {renstra.tujuanStrategis.map((t, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={t}
                  onChange={(e) => handleTujuanChange(idx, e.target.value)}
                  className="flex-1 h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTujuan(idx)}
                  className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Renstra</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visi */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <Compass className="w-5 h-5" />
              <h2 className="font-display text-base font-semibold">Visi Sekolah</h2>
            </div>
            <p className="text-slate-700 font-medium italic text-base leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100">
              "{renstra.visi}"
            </p>
          </section>

          {/* Misi */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <Target className="w-5 h-5" />
              <h2 className="font-display text-base font-semibold">Misi Sekolah</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {renstra.misi.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-teal-700 shrink-0">{idx + 1}.</span>
                  <span className="leading-snug">{m}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Tujuan Strategis */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-teal-800">
              <BookOpen className="w-5 h-5" />
              <h2 className="font-display text-base font-semibold">Tujuan Strategis &amp; Sasaran Mutu</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renstra.tujuanStrategis.map((t, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                  <strong className="text-slate-900 block mb-1">Target Strategis #{idx + 1}</strong>
                  {t}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
