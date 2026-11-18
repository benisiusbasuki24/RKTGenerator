import React, { useState } from 'react';
import { Calculator, Check, Plus, RotateCcw, X, Sparkles, Loader2, Download, Trash2, Edit2, Copy, FileSpreadsheet } from 'lucide-react';
import {
  KODE_REKENING_PRESETS,
  PRIORITAS_LIST,
  SATUAN_PRESETS,
  SNP_DETAILS,
  SNP_LIST,
  SUMBER_DANA_LIST,
  TRIWULAN_LIST,
} from '../data/rkasConstants';
import {
  JenisBelanja,
  Prioritas,
  RkasItem,
  SchoolIdentity,
  SumberDana,
  Triwulan,
} from '../types/rkas';
import { formatRupiah } from '../utils/formatters';

interface RkasViewProps {
  items: RkasItem[];
  school: SchoolIdentity;
  onAddItem: (itemData: Omit<RkasItem, 'id' | 'createdAt'>, editingId?: string) => void;
  onEditItem: (item: RkasItem) => void;
  onDuplicateItem: (item: RkasItem) => void;
  onDeleteItem: (id: string) => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
}

interface FormState {
  snp: string;
  kodeRekening: string;
  jenisBelanja: JenisBelanja;
  uraianKegiatan: string;
  rincianBelanja: string;
  volume: string;
  satuan: string;
  hargaSatuan: string;
  sumberDana: SumberDana;
  triwulan: Triwulan[];
  penanggungJawab: string;
  prioritas: Prioritas;
  keluaran: string;
  keterangan: string;
}

const INITIAL_FORM: FormState = {
  snp: SNP_LIST[0],
  kodeRekening: KODE_REKENING_PRESETS[0].kode,
  jenisBelanja: KODE_REKENING_PRESETS[0].jenisBelanja,
  uraianKegiatan: '',
  rincianBelanja: '',
  volume: '1',
  satuan: 'Paket',
  hargaSatuan: '',
  sumberDana: 'BOS Reguler',
  triwulan: ['TW I'],
  penanggungJawab: '',
  prioritas: 'Sedang',
  keluaran: '',
  keterangan: '',
};

export function RkasView({
  items,
  school,
  onAddItem,
  onEditItem,
  onDuplicateItem,
  onDeleteItem,
  onLoadSample,
  onClearAll,
  onExportXlsx,
  onExportCsv,
}: RkasViewProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSnp, setFilterSnp] = useState('ALL');
  const [filterSumber, setFilterSumber] = useState('ALL');

  const existingActivities = Array.from(new Set(items.map((i) => i.uraianKegiatan.trim()).filter(Boolean)));

  const parsedVolume = Math.max(0, Number(form.volume) || 0);
  const parsedPrice = Math.max(0, Number(form.hargaSatuan) || 0);
  const computedTotal = Math.round(parsedVolume * parsedPrice);
  const activeSnpDetail = SNP_DETAILS.find((s) => s.label === form.snp) ?? SNP_DETAILS[0];

  const handlePresetKodeChange = (selectedKode: string) => {
    const preset = KODE_REKENING_PRESETS.find((p) => p.kode === selectedKode);
    if (preset) {
      setForm((prev) => ({
        ...prev,
        kodeRekening: preset.kode,
        jenisBelanja: preset.jenisBelanja,
      }));
    } else {
      setForm((prev) => ({ ...prev, kodeRekening: selectedKode }));
    }
  };

  const toggleTriwulan = (tw: Triwulan) => {
    setForm((prev) => {
      const exists = prev.triwulan.includes(tw);
      if (exists) {
        if (prev.triwulan.length === 1) return prev;
        return { ...prev, triwulan: prev.triwulan.filter((t) => t !== tw) };
      }
      const order: Triwulan[] = ['TW I', 'TW II', 'TW III', 'TW IV'];
      const next = [...prev.triwulan, tw].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { ...prev, triwulan: next };
    });
  };

  const handleAiGenerate = async () => {
    if (!form.uraianKegiatan.trim() && !form.rincianBelanja.trim()) {
      setErrorMsg('Mohon isi Uraian Kegiatan atau Rincian Belanja terlebih dahulu untuk AI Generator.');
      return;
    }
    setErrorMsg('');
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uraianKegiatan: form.uraianKegiatan,
          bidang: form.snp,
          rincianBelanja: form.rincianBelanja,
          sumberDana: form.sumberDana,
        }),
      });
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        keluaran: data.keluaran || prev.keluaran,
        keterangan: data.keterangan || prev.keterangan,
      }));
    } catch (error) {
      console.error('AI generation error:', error);
      setErrorMsg('Gagal menghasilkan detail AI. Silakan isi manual.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.uraianKegiatan.trim()) {
      setErrorMsg('Uraian kegiatan wajib diisi.');
      return;
    }
    if (!form.rincianBelanja.trim()) {
      setErrorMsg('Rincian belanja wajib diisi.');
      return;
    }
    if (parsedVolume <= 0) {
      setErrorMsg('Volume harus lebih besar dari 0.');
      return;
    }
    if (parsedPrice <= 0) {
      setErrorMsg('Harga satuan harus lebih besar dari 0.');
      return;
    }

    let finalKeluaran = form.keluaran.trim();
    let finalKeterangan = form.keterangan.trim();

    // Auto-generate via AI if empty
    if (!finalKeluaran || !finalKeterangan) {
      try {
        const res = await fetch('/api/ai/generate-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uraianKegiatan: form.uraianKegiatan,
            bidang: form.snp,
            rincianBelanja: form.rincianBelanja,
            sumberDana: form.sumberDana,
          }),
        });
        const data = await res.json();
        if (!finalKeluaran) finalKeluaran = data.keluaran || 'Terlaksananya kegiatan sekolah sesuai perencanaan.';
        if (!finalKeterangan) finalKeterangan = data.keterangan || 'Proposal, daftar hadir, dokumentasi, dan LPJ.';
      } catch {
        if (!finalKeluaran) finalKeluaran = 'Terlaksananya kegiatan sekolah sesuai perencanaan.';
        if (!finalKeterangan) finalKeterangan = 'Proposal, daftar hadir, dokumentasi, dan LPJ.';
      }
    }

    setErrorMsg('');
    onAddItem(
      {
        snp: form.snp,
        kodeRekening: form.kodeRekening.trim() || '5.1.02.01.01.0024',
        jenisBelanja: form.jenisBelanja,
        uraianKegiatan: form.uraianKegiatan.trim(),
        rincianBelanja: form.rincianBelanja.trim(),
        volume: parsedVolume,
        satuan: form.satuan.trim() || 'Paket',
        hargaSatuan: parsedPrice,
        totalAnggaran: computedTotal,
        sumberDana: form.sumberDana,
        triwulan: form.triwulan,
        penanggungJawab: form.penanggungJawab.trim() || school.kepalaSekolah,
        prioritas: form.prioritas,
        keluaran: finalKeluaran,
        keterangan: finalKeterangan,
      },
      editingId ?? undefined
    );

    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleStartEdit = (item: RkasItem) => {
    setEditingId(item.id);
    setForm({
      snp: item.snp,
      kodeRekening: item.kodeRekening,
      jenisBelanja: item.jenisBelanja,
      uraianKegiatan: item.uraianKegiatan,
      rincianBelanja: item.rincianBelanja,
      volume: String(item.volume),
      satuan: item.satuan,
      hargaSatuan: String(item.hargaSatuan),
      sumberDana: item.sumberDana,
      triwulan: item.triwulan.length > 0 ? item.triwulan : ['TW I'],
      penanggungJawab: item.penanggungJawab,
      prioritas: item.prioritas,
      keluaran: item.keluaran,
      keterangan: item.keterangan,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.uraianKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rincianBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSnp = filterSnp === 'ALL' || item.snp === filterSnp;
    const matchesSumber = filterSumber === 'ALL' || item.sumberDana === filterSumber;
    return matchesSearch && matchesSnp && matchesSumber;
  });

  const totalFiltered = filteredItems.reduce((acc, curr) => acc + curr.totalAnggaran, 0);

  return (
    <div className="space-y-8">
      {/* Entry / Edit Form Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              {editingId ? 'Ubah Rincian Belanja RKAS' : 'Input Rincian Belanja & Kegiatan RKAS'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Kolom &quot;Keluaran&quot; dan &quot;Keterangan&quot; dapat diisi otomatis oleh AI setelah rincian diisi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors shadow-xs"
            >
              {isGeneratingAi ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
              ) : (
                <Sparkles className="w-4 h-4 text-teal-700" />
              )}
              <span>Auto-Fill AI (Keluaran &amp; Keterangan)</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(INITIAL_FORM);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {errorMsg && (
            <div role="alert" className="px-4 py-3 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Row 1: SNP & Kode Rekening */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label htmlFor="form-snp" className="block text-xs font-medium text-slate-700 mb-1.5">
                Standar Nasional Pendidikan (SNP) / Bidang
              </label>
              <select
                id="form-snp"
                value={form.snp}
                onChange={(e) => setForm({ ...form, snp: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                {SNP_LIST.map((snp) => (
                  <option key={snp} value={snp}>
                    {snp}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="form-preset" className="block text-xs font-medium text-slate-700 mb-1.5">
                Referensi Kode Rekening
              </label>
              <select
                id="form-preset"
                value={KODE_REKENING_PRESETS.some((p) => p.kode === form.kodeRekening) ? form.kodeRekening : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') handlePresetKodeChange(e.target.value);
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                {KODE_REKENING_PRESETS.map((preset) => (
                  <option key={preset.kode} value={preset.kode}>
                    {preset.kode} — {preset.uraian}
                  </option>
                ))}
                <option value="custom">Kode Kustom</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="form-kode" className="block text-xs font-medium text-slate-700 mb-1.5">
                Kode Rekening Manual
              </label>
              <input
                id="form-kode"
                type="text"
                value={form.kodeRekening}
                onChange={(e) => setForm({ ...form, kodeRekening: e.target.value })}
                className="w-full h-10 px-3 font-mono text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
          </div>

          {/* Row 2: Uraian Kegiatan & Rincian Belanja */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="form-kegiatan" className="block text-xs font-medium text-slate-700 mb-1.5">
                Uraian Kegiatan (RKT) <span className="text-red-600">*</span>
              </label>
              <input
                id="form-kegiatan"
                type="text"
                list="activities-suggestion"
                value={form.uraianKegiatan}
                onChange={(e) => setForm({ ...form, uraianKegiatan: e.target.value })}
                placeholder="Contoh: Lomba OSN / Pembayaran daya dan jasa"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
              <datalist id="activities-suggestion">
                {Array.from(new Set([...existingActivities, ...activeSnpDetail.contohKegiatan])).map((act) => (
                  <option key={act} value={act} />
                ))}
              </datalist>
            </div>

            <div className="md:col-span-6">
              <label htmlFor="form-rincian" className="block text-xs font-medium text-slate-700 mb-1.5">
                Rincian Belanja <span className="text-red-600">*</span>
              </label>
              <input
                id="form-rincian"
                type="text"
                value={form.rincianBelanja}
                onChange={(e) => setForm({ ...form, rincianBelanja: e.target.value })}
                placeholder="Contoh: Pendanaan seleksi dan pembinaan OSN tingkat kota"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
          </div>

          {/* Row 3: Volume, Satuan, Harga, Total, Sumber Dana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="form-vol" className="block text-xs font-medium text-slate-700 mb-1.5">
                Volume <span className="text-red-600">*</span>
              </label>
              <input
                id="form-vol"
                type="number"
                min="0.01"
                step="any"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                className="w-full h-10 px-3 font-mono text-sm text-right bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="form-sat" className="block text-xs font-medium text-slate-700 mb-1.5">
                Satuan
              </label>
              <input
                id="form-sat"
                type="text"
                list="satuan-list"
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
              <datalist id="satuan-list">
                {SATUAN_PRESETS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="form-harga" className="block text-xs font-medium text-slate-700 mb-1.5">
                Harga Satuan (Rp) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">Rp</span>
                <input
                  id="form-harga"
                  type="number"
                  min="0"
                  step="100"
                  value={form.hargaSatuan}
                  onChange={(e) => setForm({ ...form, hargaSatuan: e.target.value })}
                  placeholder="0"
                  className="w-full h-10 pl-9 pr-3 font-mono text-sm text-right bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">Total Anggaran (Otomatis)</span>
              <div className="h-10 px-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg">
                <Calculator className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-mono text-sm font-semibold text-teal-900 tabular-nums">
                  {formatRupiah(computedTotal)}
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="form-sumber" className="block text-xs font-medium text-slate-700 mb-1.5">
                Sumber Dana
              </label>
              <select
                id="form-sumber"
                value={form.sumberDana}
                onChange={(e) => setForm({ ...form, sumberDana: e.target.value as SumberDana })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                {SUMBER_DANA_LIST.map((sd) => (
                  <option key={sd} value={sd}>
                    {sd}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Triwulan, Penanggung Jawab, Prioritas, Jenis Belanja */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <span className="block text-xs font-medium text-slate-700 mb-1.5">Jadwal Pelaksanaan (Triwulan)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {TRIWULAN_LIST.map((tw) => {
                  const active = form.triwulan.includes(tw.value);
                  return (
                    <button
                      key={tw.value}
                      type="button"
                      onClick={() => toggleTriwulan(tw.value)}
                      className={`h-10 px-2 text-xs font-medium rounded-lg border transition-colors ${
                        active
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tw.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="form-pj" className="block text-xs font-medium text-slate-700 mb-1.5">
                Penanggung Jawab
              </label>
              <input
                id="form-pj"
                type="text"
                value={form.penanggungJawab}
                onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
                placeholder={school.kepalaSekolah}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="form-prioritas" className="block text-xs font-medium text-slate-700 mb-1.5">
                Prioritas
              </label>
              <select
                id="form-prioritas"
                value={form.prioritas}
                onChange={(e) => setForm({ ...form, prioritas: e.target.value as Prioritas })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                {PRIORITAS_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="form-jenis" className="block text-xs font-medium text-slate-700 mb-1.5">
                Jenis Belanja
              </label>
              <select
                id="form-jenis"
                value={form.jenisBelanja}
                onChange={(e) => setForm({ ...form, jenisBelanja: e.target.value as JenisBelanja })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                <option value="Belanja Barang & Jasa">Belanja Barang &amp; Jasa</option>
                <option value="Belanja Modal">Belanja Modal</option>
                <option value="Belanja Pegawai / Honorarium">Belanja Pegawai / Honorarium</option>
              </select>
            </div>
          </div>

          {/* Row 5: Keluaran & Keterangan (AI Generated) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="form-keluaran" className="block text-xs font-medium text-slate-700 mb-1.5">
                Keluaran (Output AI)
              </label>
              <input
                id="form-keluaran"
                type="text"
                value={form.keluaran}
                onChange={(e) => setForm({ ...form, keluaran: e.target.value })}
                placeholder="Terisi otomatis oleh AI atau isi manual..."
                className="w-full h-10 px-3 text-sm bg-teal-50/40 border border-teal-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>

            <div className="md:col-span-6">
              <label htmlFor="form-keterangan" className="block text-xs font-medium text-slate-700 mb-1.5">
                Keterangan &amp; Dokumen Pendukung (AI)
              </label>
              <input
                id="form-keterangan"
                type="text"
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                placeholder="Terisi otomatis oleh AI atau isi manual..."
                className="w-full h-10 px-3 text-sm bg-teal-50/40 border border-teal-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
            >
              {editingId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan RKAS</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan ke Draf RKAS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* RKAS Table Section */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Draf Rencana Kegiatan dan Anggaran Sekolah (RKAS)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Menampilkan {filteredItems.length} dari {items.length} total rincian belanja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onExportXlsx}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Unduh CSV</span>
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Contoh SD Gondolayu</span>
            </button>
            <button
              type="button"
              onClick={onClearAll}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 disabled:bg-slate-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari uraian kegiatan, rincian, atau PJ..."
            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          />
          <select
            value={filterSnp}
            onChange={(e) => setFilterSnp(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">Semua Bidang / SNP</option>
            {SNP_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterSumber}
            onChange={(e) => setFilterSumber(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
          >
            <option value="ALL">Semua Sumber Dana</option>
            {SUMBER_DANA_LIST.map((sd) => (
              <option key={sd} value={sd}>
                {sd}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Tidak ada data rincian belanja yang cocok dengan filter atau draf masih kosong.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-36">Kode Rekening</th>
                  <th className="py-3 px-4 w-52">Bidang / SNP</th>
                  <th className="py-3 px-4">Uraian &amp; Rincian Belanja</th>
                  <th className="py-3 px-4 w-24 text-right">Vol &amp; Sat</th>
                  <th className="py-3 px-4 w-32 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 w-36 text-right">Total Anggaran</th>
                  <th className="py-3 px-4 w-32">Sumber Dana</th>
                  <th className="py-3 px-4 w-24 text-center">Jadwal</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors align-top">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.kodeRekening}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{item.snp}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.uraianKegiatan}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.rincianBelanja}</div>
                      {item.keluaran && (
                        <div className="text-[11px] text-teal-800 bg-teal-50 px-2 py-1 rounded mt-1 border border-teal-100">
                          <strong>Keluaran:</strong> {item.keluaran}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {item.volume} {item.satuan}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                      {formatRupiah(item.hargaSatuan)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(item.totalAnggaran)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-800 rounded">
                        {item.sumberDana}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {item.triwulan.map((tw) => (
                          <span key={tw} className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-800 rounded border border-teal-200">
                            {tw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          title="Ubah"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateItem(item)}
                          title="Duplikasi"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          title="Hapus"
                          className="p-1.5 text-slate-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/90 border-t border-slate-200 font-bold text-slate-900">
                  <td colSpan={6} className="py-3 px-4 text-right uppercase text-xs">
                    Jumlah Total Anggaran RKAS Terfiltrasi:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-teal-900 tabular-nums">
                    {formatRupiah(totalFiltered)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
