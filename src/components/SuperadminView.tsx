import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Mail, Plus, Trash2, Check, Lock } from 'lucide-react';
import { SchoolIdentity } from '../types/rkas';
import { User } from '../firebase';

interface SuperadminViewProps {
  school: SchoolIdentity;
  user: User | null;
  onUpdateSchool: (updated: SchoolIdentity) => void;
}

export function SuperadminView({ school, user, onUpdateSchool }: SuperadminViewProps) {
  const [newEmail, setNewEmail] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const superadminList = school.superadminEmails || ['benisiusbasuki24@guru.sd.belajar.id'];
  const isSuperadmin = user && user.email ? superadminList.includes(user.email.toLowerCase()) : false;

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    const currentList = school.registeredEmails || [];
    if (currentList.includes(email)) return;

    const updated: SchoolIdentity = {
      ...school,
      registeredEmails: [...currentList, email],
    };
    onUpdateSchool(updated);
    setNewEmail('');
    setNotice(`Email "${email}" berhasil ditambahkan ke whitelist.`);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const currentList = school.registeredEmails || [];
    const updated: SchoolIdentity = {
      ...school,
      registeredEmails: currentList.filter((e) => e !== emailToRemove),
    };
    onUpdateSchool(updated);
    setNotice(`Email "${emailToRemove}" berhasil dihapus dari whitelist.`);
    window.setTimeout(() => setNotice(null), 3000);
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">Autentikasi Diperlukan</h2>
        <p className="text-sm text-slate-500">
          Silakan masuk terlebih dahulu menggunakan akun Google Superadmin untuk mengakses Panel Superadmin.
        </p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">Akses Ditolak (Khusus Superadmin)</h2>
        <p className="text-sm text-slate-600">
          Akun Anda (<strong className="font-mono">{user.email}</strong>) tidak memiliki hak akses Superadmin untuk mengelola Whitelist Akses Akun.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xs text-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Superadmin Verified ({user.email})</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Panel Superadmin: Manajemen Whitelist Akses Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Hanya Superadmin yang berwenang menambahkan atau menghapus email yang dapat masuk ke aplikasi ini. Tersinkronisasi ke database cloud.
          </p>
        </div>

        {notice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>{notice}</span>
          </span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="font-display text-base font-semibold text-slate-900">
          Tambah Email / Domain ke Whitelist
        </h2>

        <form onSubmit={handleAddEmail} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Contoh: guru.baru@guru.sd.belajar.id atau @bopkri.sch.id"
              className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal-700"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Email</span>
          </button>
        </form>

        <div className="pt-6 border-t border-slate-200 space-y-3">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Daftar Email &amp; Domain Terdaftar ({school.registeredEmails?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {(!school.registeredEmails || school.registeredEmails.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada email yang terdaftar.
              </div>
            ) : (
              school.registeredEmails.map((email) => (
                <div key={email} className="px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-slate-800">
                    <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Akses</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
