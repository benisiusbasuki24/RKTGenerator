import React, { useState } from 'react';
import { Calculator, Check, Plus, RotateCcw, X, Sparkles, Loader2, Download, Trash2, Edit2, Copy, FileSpreadsheet } from 'lucide-react';
import {
  BULAN_LIST,
  PRIORITAS_LIST,
  SATUAN_PRESETS,
  SNP_DETAILS,
  SNP_LIST,
  SUMBER_DANA_LIST,
} from '../data/rkasConstants';
import {
  Bulan,
  JenisBelanja,
  Prioritas,
  RkasItem,
  SchoolIdentity,
  SumberDana,
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
  jenisBelanja: JenisBelanja;
  uraianKegiatan: string;
  rincianBelanja: string;
  volume: string;
  satuan: string;
  hargaSatuan: string;
  sumberDana: SumberDana;
  bulan: Bulan[];
  penanggungJawab: string;
  prioritas: Prioritas;
  keluaran: string;
  keterangan: string;
}

const INITIAL_FORM: FormState = {
  snp: SNP_LIST[0],
  jenisBelanja: 'Belanja Barang & Jasa',
  uraianKegiatan: '',
  rincianBelanja: '',
  volume: '1',
  satuan: 'Paket',
  hargaSatuan: '',
  sumberDana: 'BOS Reguler',
  bulan: ['Januari'],
  penanggungJawab: '',
  prioritas: 'Sedang',
  keluaran: '',
  keterangan: '',
};

export function RkasView({
  items,
  school,
  onAddItem,
  onDuplicateItem,
  onDeleteItem,
  onLoadSample,
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
  const [filterTahun, setFilterTahun] = useState('ALL');

  const existingActivities = Array.from(new Set(items.map((i) => i.uraianKegiatan.trim()).filter(Boolean)));
  const availableYears = Array.from(new Set(items.map((i) => i.tahunAnggaran || school.tahunAnggaran))).sort();
  if (!availableYears.includes(school.tahunAnggaran)) {
    availableYears.push(school.tahunAnggaran);
  }

  const parsedVolume = Math.max(0, Number(form.volume) || 0);
  const parsedPrice = Math.max(0, Number(form.hargaSatuan) || 0);
  const computedTotal = Math.round(parsedVolume * parsedPrice);
  const activeSnpDetail = SNP_DETAILS.find((s) => s.label === form.snp) ?? SNP_DETAILS[0];

  const toggleBulan = (m: Bulan) => {
    setForm((prev) => {
      const exists = prev.bulan.includes(m);
      if (exists) {
        if (prev.bulan.length === 1) return prev;
        return { ...prev, bulan: prev.bulan.filter((item) => item !== m) };
      }
      const order: Bulan[] = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      const next = [...prev.bulan, m].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { ...prev, bulan: next };
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
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          keluaran: `Terlaksananya kegiatan "${form.uraianKegiatan}" secara optimal dengan hasil pencapaian mutu pendidikan yang terukur.`,
          keterangan: 'Proposal, daftar hadir peserta, dokumentasi kegiatan, dan LPJ.',
        };
      }
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
        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            keluaran: 'Terlaksananya kegiatan sekolah secara terencana dan bermutu.',
            keterangan: 'Proposal, daftar hadir, dokumentasi kegiatan, dan LPJ.',
          };
        }
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
        jenisBelanja: form.jenisBelanja,
        uraianKegiatan: form.uraianKegiatan.trim(),
        rincianBelanja: form.rincianBelanja.trim(),
        volume: parsedVolume,
        satuan: form.satuan.trim() || 'Paket',
        hargaSatuan: parsedPrice,
        totalAnggaran: computedTotal,
        sumberDana: form.sumberDana,
        bulan: form.bulan,
        penanggungJawab: form.penanggungJawab.trim() || school.kepalaSekolah,
        prioritas: form.prioritas,
        keluaran: finalKeluaran,
        keterangan: finalKeterangan,
        tahunAnggaran: school.tahunAnggaran,
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
      jenisBelanja: item.jenisBelanja,
      uraianKegiatan: item.uraianKegiatan,
      rincianBelanja: item.rincianBelanja,
      volume: String(item.volume),
      satuan: item.satuan,
      hargaSatuan: String(item.hargaSatuan),
      sumberDana: item.sumberDana,
      bulan: item.bulan && item.bulan.length > 0 ? item.bulan : ['Januari'],
      penanggungJawab: item.penanggungJawab,
      prioritas: item.prioritas,
      keluaran: item.keluaran,
      keterangan: item.keterangan,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const filteredItems = items.filter((item) => {
    const itemYear = item.tahunAnggaran || school.tahunAnggaran;
    const matchTahun = filterTahun === 'ALL' || itemYear === filterTahun;
    const matchSnp = filterSnp === 'ALL' || item.snp === filterSnp;
    const matchSumber = filterSumber === 'ALL' || item.sumberDana === filterSumber;
    const matchSearch =
      !searchTerm.trim() ||
      item.uraianKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rincianBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.penanggungJawab && item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTahun && matchSnp && matchSumber && matchSearch;
  });

  const totalFiltered = filteredItems.reduce((acc, item) => acc + item.totalAnggaran, 0);

  return (
    <div className="space-y-8">
      {/* Form Input / Edit Card */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold">
              {editingId ? 'Edit Rincian Belanja RKAS' : `Tambah Rincian Belanja & Kegiatan RKAS (${school.tahunAnggaran})`}
            </h2>
            <p className="text-xs text-slate-300">
              Data akan otomatis terikat pada Tahun Anggaran aktif: <strong className="text-teal-300">{school.tahunAnggaran}</strong>.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div role="alert" className="p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Row 1: SNP / Program */}
          <div>
            <label htmlFor="form-snp" className="block text-xs font-medium text-slate-700 mb-1.5">
              Standar Nasional Pendidikan (SNP) / Program
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
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              <strong>Fokus RKT:</strong> {activeSnpDetail.fokusRkt}
            </p>
          </div>

          {/* Row 2: Uraian Kegiatan & Rincian Belanja */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="form-uraian" className="block text-xs font-medium text-slate-700 mb-1.5">
                Uraian Kegiatan
              </label>
              <input
                id="form-uraian"
                type="text"
                list="existing-activities"
                value={form.uraianKegiatan}
                onChange={(e) => setForm({ ...form, uraianKegiatan: e.target.value })}
                placeholder="Contoh: Lomba OSN / Pembayaran daya dan jasa"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
              <datalist id="existing-activities">
                {existingActivities.map((act) => (
                  <option key={act} value={act} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="form-rincian" className="block text-xs font-medium text-slate-700 mb-1.5">
                Rincian Belanja
              </label>
              <input
                id="form-rincian"
                type="text"
                value={form.rincianBelanja}
                onChange={(e) => setForm({ ...form, rincianBelanja: e.target.value })}
                placeholder="Contoh: Pengadaan 8 set ATK & bahan cetak seleksi siswa"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Row 3: Volume, Satuan, Harga Satuan, Sumber Dana */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="form-volume" className="block text-xs font-medium text-slate-700 mb-1.5">
                Volume
              </label>
              <input
                id="form-volume"
                type="number"
                min="1"
                step="any"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label htmlFor="form-satuan" className="block text-xs font-medium text-slate-700 mb-1.5">
                Satuan
              </label>
              <input
                id="form-satuan"
                type="text"
                list="satuan-presets"
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                placeholder="Paket / Unit / Bulan"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
              <datalist id="satuan-presets">
                {SATUAN_PRESETS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="col-span-2 sm:col-span-4">
              <label htmlFor="form-harga" className="block text-xs font-medium text-slate-700 mb-1.5">
                Harga Satuan (Rp)
              </label>
              <input
                id="form-harga"
                type="number"
                min="0"
                step="any"
                value={form.hargaSatuan}
                onChange={(e) => setForm({ ...form, hargaSatuan: e.target.value })}
                placeholder="0"
                className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div className="col-span-2 sm:col-span-3">
              <label htmlFor="form-sumber" className="block text-xs font-medium text-slate-700 mb-1.5">
                Sumber Dana
              </label>
              <select
                id="form-sumber"
                value={form.sumberDana}
                onChange={(e) => setForm({ ...form, sumberDana: e.target.value as SumberDana })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              >
                {SUMBER_DANA_LIST.map((sd) => (
                  <option key={sd} value={sd}>
                    {sd}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Computed Total Anggaran Preview */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-900">
              <Calculator className="w-5 h-5 text-teal-700" />
              <span className="text-xs sm:text-sm font-medium">Total Anggaran Dihitung Otomatis (Volume × Harga Satuan):</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-teal-900 tabular-nums">
              {formatRupiah(computedTotal)}
            </div>
          </div>

          {/* Row 4: Bulan Pelaksanaan (12 Months selector) */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-700">
              Jadwal Pelaksanaan (Pilih Bulan-bulan Kegiatan)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {BULAN_LIST.map((m) => {
                const active = form.bulan.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleBulan(m)}
                    className={`h-10 px-1 text-xs font-medium rounded-lg border transition-colors truncate ${
                      active
                        ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Penanggung Jawab & Prioritas & Jenis Belanja */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="form-pj" className="block text-xs font-medium text-slate-700 mb-1.5">
                Penanggung Jawab
              </label>
              <input
                id="form-pj"
                type="text"
                value={form.penanggungJawab}
                onChange={(e) => setForm({ ...form, penanggungJawab: e.target.value })}
                placeholder={school.kepalaSekolah}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label htmlFor="form-prioritas" className="block text-xs font-medium text-slate-700 mb-1.5">
                Skala Prioritas
              </label>
              <select
                id="form-prioritas"
                value={form.prioritas}
                onChange={(e) => setForm({ ...form, prioritas: e.target.value as Prioritas })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              >
                {PRIORITAS_LIST.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="form-jenis-belanja" className="block text-xs font-medium text-slate-700 mb-1.5">
                Jenis Belanja
              </label>
              <select
                id="form-jenis-belanja"
                value={form.jenisBelanja}
                onChange={(e) => setForm({ ...form, jenisBelanja: e.target.value as JenisBelanja })}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
              >
                <option value="Belanja Barang & Jasa">Belanja Barang &amp; Jasa</option>
                <option value="Belanja Modal">Belanja Modal</option>
                <option value="Belanja Pegawai / Honorarium">Belanja Pegawai / Honorarium</option>
              </select>
            </div>
          </div>

          {/* Row 6: AI-Assisted Keluaran & Keterangan */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xs font-semibold text-slate-900 uppercase">
                  Keluaran (Output) &amp; Keterangan (Otomatis AI atau Manual)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dibiarkan kosong akan digenerate otomatis oleh Gemini AI saat disimpan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                )}
                <span>Generate Detail AI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-keluaran" className="block text-xs font-medium text-slate-700 mb-1">
                  Keluaran (Output) Kegiatan
                </label>
                <textarea
                  id="form-keluaran"
                  rows={2}
                  value={form.keluaran}
                  onChange={(e) => setForm({ ...form, keluaran: e.target.value })}
                  placeholder="Misal: Terwujudnya peningkatan kompetensi siswa..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label htmlFor="form-keterangan" className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan / Dokumen Pendukung (LPJ, TOR, dll)
                </label>
                <textarea
                  id="form-keterangan"
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Misal: Proposal, daftar hadir, dokumentasi, dan LPJ."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            {editingId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setForm(INITIAL_FORM)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Form
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Simpan Perubahan' : 'Tambah ke Draf RKAS'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* RKAS Data Table Section with Budget Year Filter */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Draf Rencana Kegiatan &amp; Anggaran Sekolah (RKAS) ({filteredItems.length} Item)
            </h2>
            <p className="text-xs text-slate-500">
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
              <span>Muat Contoh Data</span>
            </button>

            <button
              type="button"
              onClick={onExportXlsx}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Excel (.xlsx)</span>
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

        {/* Filters Toolbar with Budget Year Filter */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari uraian, rincian, atau PJ..."
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
            >
              <option value="ALL">Semua Tahun Anggaran</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun Anggaran {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterSnp}
              onChange={(e) => setFilterSnp(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
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
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700"
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

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Tidak ada rincian belanja yang cocok dengan filter tahun anggaran atau draf masih kosong.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider text-center">
                  <th className="py-3 px-3 border border-slate-700 w-12">No</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">Thn Anggaran</th>
                  <th className="py-3 px-3 border border-slate-700 w-40">SNP</th>
                  <th className="py-3 px-3 border border-slate-700 w-44">Uraian</th>
                  <th className="py-3 px-3 border border-slate-700 w-48">Rincian Belanja</th>
                  <th className="py-3 px-3 border border-slate-700 w-44">Output (Keluaran)</th>
                  <th className="py-3 px-3 border border-slate-700 w-44">Keterangan</th>
                  <th className="py-3 px-3 border border-slate-700 w-24">Volume</th>
                  <th className="py-3 px-3 border border-slate-700 w-28">Harga Satuan</th>
                  <th className="py-3 px-3 border border-slate-700 w-32">Total Anggaran</th>
                  <th className="py-3 px-3 border border-slate-700 w-28">Sumber Dana</th>
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
                    <td className="py-3 px-3 border border-slate-200 text-center font-mono font-bold text-teal-800">
                      {item.tahunAnggaran || school.tahunAnggaran}
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
                    <td className="py-3 px-3 border border-slate-200 text-teal-900 bg-teal-50/40">
                      {item.keluaran || '-'}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-slate-600">
                      {item.keterangan || '-'}
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-right font-mono tabular-nums text-slate-700">
                      {item.volume} {item.satuan}
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
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 border border-slate-200 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          title="Ubah"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateItem(item)}
                          title="Duplikasi"
                          className="p-1.5 text-slate-500 hover:text-teal-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
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
                  <td colSpan={9} className="py-3 px-3 text-right uppercase text-xs">
                    Jumlah Total Anggaran RKAS Terfiltrasi:
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
      </section>
    </div>
  );
}
