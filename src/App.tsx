/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  QueryDocumentSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { AppTab, HeaderBar } from './components/HeaderBar';
import { PrintPreviewView } from './components/PrintPreviewView';
import { RecapView } from './components/RecapView';
import { RkasView } from './components/RkasView';
import { RktView } from './components/RktView';
import { RenstraView } from './components/RenstraView';
import { SchoolIdentityView } from './components/SchoolIdentityView';
import { SummaryMetrics } from './components/SummaryMetrics';
import {
  DEFAULT_SCHOOL_IDENTITY,
  SAMPLE_RKAS_ITEMS,
} from './data/rkasConstants';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from './firebase';
import { RkasItem, SchoolIdentity } from './types/rkas';
import { exportRkasToCsv, exportRkasToXlsx } from './utils/exportSpreadsheet';

const STORAGE_ITEMS_KEY = 'rkt_rkas_generator_items_v4';
const STORAGE_SCHOOL_KEY = 'rkt_rkas_generator_school_v3';

function loadSavedItems(): RkasItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (!raw) return SAMPLE_RKAS_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_RKAS_ITEMS;
  } catch {
    return SAMPLE_RKAS_ITEMS;
  }
}

function loadSavedSchool(): SchoolIdentity {
  try {
    const raw = localStorage.getItem(STORAGE_SCHOOL_KEY);
    if (!raw) return DEFAULT_SCHOOL_IDENTITY;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? { ...DEFAULT_SCHOOL_IDENTITY, ...parsed }
      : DEFAULT_SCHOOL_IDENTITY;
  } catch {
    return DEFAULT_SCHOOL_IDENTITY;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState<RkasItem[]>(loadSavedItems);
  const [school, setSchool] = useState<SchoolIdentity>(loadSavedSchool);
  const [activeTab, setActiveTab] = useState<AppTab>('rkas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth listener & Firestore sync with email whitelist verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const whitelist = school.registeredEmails || [
          'benisiusbasuki24@guru.sd.belajar.id',
          '@guru.sd.belajar.id',
          '@bopkri.sch.id',
          '@gmail.com',
        ];

        const isAllowed =
          whitelist.length === 0 ||
          whitelist.some((entry) => {
            if (entry.startsWith('@')) {
              return email.toLowerCase().endsWith(entry.toLowerCase());
            }
            return email.toLowerCase() === entry.toLowerCase();
          });

        if (!isAllowed) {
          await signOut(auth);
          setUser(null);
          setAuthLoading(false);
          setToastMessage(`Akses Ditolak: Email (${email}) belum terdaftar.`);
          return;
        }

        setUser(firebaseUser);
        setAuthLoading(false);

        try {
          const rkasQuery = query(
            collection(db, 'rkasItems'),
            where('userId', '==', firebaseUser.uid)
          );
          const rkasSnap = await getDocs(rkasQuery).catch((err: unknown) => {
            handleFirestoreError(err, OperationType.LIST, 'rkasItems');
          });

          if (rkasSnap && !rkasSnap.empty) {
            const cloudItems: RkasItem[] = [];
            rkasSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
              cloudItems.push(d.data() as RkasItem);
            });
            setItems(cloudItems);
          }

          const schoolSnap = await getDocs(
            query(collection(db, 'schools'), where('userId', '==', firebaseUser.uid))
          ).catch(() => null);

          if (schoolSnap && !schoolSnap.empty) {
            setSchool(schoolSnap.docs[0].data() as SchoolIdentity);
          }
        } catch (error) {
          console.error('Error loading cloud data:', error);
        }
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [school.registeredEmails]);

  // Save to localStorage and Firestore
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
    if (user) {
      items.forEach(async (item) => {
        try {
          const payload = { ...item, userId: user.uid };
          await setDoc(doc(db, 'rkasItems', item.id), payload);
        } catch (error) {
          console.error('Failed to sync item to Firestore:', error);
        }
      });
    }
  }, [items, user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCHOOL_KEY, JSON.stringify(school));
    } catch {
      // ignore
    }
    if (user) {
      const saveSchool = async () => {
        try {
          const payload = { ...school, userId: user.uid, updatedAt: new Date().toISOString() };
          await setDoc(doc(db, 'schools', user.uid), payload);
        } catch (error) {
          console.error('Failed to sync school to Firestore:', error);
        }
      };
      saveSchool();
    }
  }, [school, user]);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const email = cred.user.email || '';
      const whitelist = school.registeredEmails || [
        'benisiusbasuki24@guru.sd.belajar.id',
        '@guru.sd.belajar.id',
        '@bopkri.sch.id',
        '@gmail.com',
      ];

      const isAllowed =
        whitelist.length === 0 ||
        whitelist.some((entry) => {
          if (entry.startsWith('@')) {
            return email.toLowerCase().endsWith(entry.toLowerCase());
          }
          return email.toLowerCase() === entry.toLowerCase();
        });

      if (!isAllowed) {
        await signOut(auth);
        setUser(null);
        showNotice(`Akses Ditolak: Email (${email}) belum terdaftar dalam whitelist aplikasi.`);
        return;
      }

      showNotice('Berhasil masuk dengan akun Google. Data disinkronkan ke cloud.');
    } catch (error) {
      console.error('Sign in error:', error);
      showNotice('Gagal masuk. Silakan coba lagi.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotice('Keluar akun berhasil.');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAddItem = (
    itemData: Omit<RkasItem, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      setItems((prev) =>
        prev.map((row) => (row.id === editingId ? { ...row, ...itemData } : row))
      );
      showNotice(`Perubahan pada "${itemData.rincianBelanja}" berhasil disimpan.`);
    } else {
      const newItem: RkasItem = {
        ...itemData,
        id: `rkas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
      showNotice(`"${itemData.rincianBelanja}" berhasil ditambahkan.`);
    }
  };

  const handleDuplicateItem = (item: RkasItem) => {
    const copy: RkasItem = {
      ...item,
      id: `rkas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rincianBelanja: `${item.rincianBelanja} (Salinan)`,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [...prev, copy]);
    showNotice('Rincian belanja berhasil diduplikasi.');
  };

  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((row) => row.id !== id));
    if (user) {
      try {
        await deleteDoc(doc(db, 'rkasItems', id));
      } catch (error) {
        console.error('Failed to delete from Firestore:', error);
      }
    }
    showNotice('Rincian belanja berhasil dihapus.');
  };

  const handleLoadSample = () => {
    setItems(SAMPLE_RKAS_ITEMS);
    showNotice('Contoh data SD BOPKRI Gondolayu berhasil dimuat.');
  };

  const handleClearAll = async () => {
    const idsToDelete = items.map((i) => i.id);
    setItems([]);
    if (user) {
      idsToDelete.forEach(async (id) => {
        try {
          await deleteDoc(doc(db, 'rkasItems', id));
        } catch {
          // ignore
        }
      });
    }
    showNotice('Seluruh draf RKAS telah dikosongkan.');
  };

  const handleExportXlsx = () => {
    if (items.length === 0) return;
    exportRkasToXlsx(items, school);
    showNotice('Laporan spreadsheet Excel (.xlsx) berhasil diunduh.');
  };

  const handleExportCsv = () => {
    if (items.length === 0) return;
    exportRkasToCsv(items, school);
    showNotice('Laporan spreadsheet CSV (.csv) berhasil diunduh.');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <HeaderBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportXlsx={handleExportXlsx}
        itemCount={items.length}
        user={user}
        authLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* School Context Bar & Toast */}
        <div className="no-print flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-balance">
              RKT-RKAS Generator — {school.namaSekolah}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-500">
              <span className="font-medium text-slate-700">NPSN {school.npsn}</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Anggaran {school.tahunAnggaran}</span>
              <span aria-hidden="true">·</span>
              <span>Kepala Sekolah: {school.kepalaSekolah}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className="text-teal-700 hover:text-teal-800 font-medium underline underline-offset-4"
              >
                Ubah Identitas &amp; Akses
              </button>
            </div>
          </div>

          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-2 text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-lg shadow-xs"
            >
              {toastMessage}
            </div>
          )}
        </div>

        {/* Summary Metrics Strip */}
        <div className="no-print">
          <SummaryMetrics items={items} school={school} />
        </div>

        {/* Tab Views */}
        {activeTab === 'rkt' && (
          <RktView
            items={items}
            school={school}
            onNavigateToRkas={() => setActiveTab('rkas')}
          />
        )}

        {activeTab === 'rkas' && (
          <RkasView
            items={items}
            school={school}
            onAddItem={handleAddItem}
            onEditItem={() => {}}
            onDuplicateItem={handleDuplicateItem}
            onDeleteItem={handleDeleteItem}
            onLoadSample={handleLoadSample}
            onClearAll={handleClearAll}
            onExportXlsx={handleExportXlsx}
            onExportCsv={handleExportCsv}
          />
        )}



        {activeTab === 'renstra' && <RenstraView school={school} />}

        {activeTab === 'print' && (
          <PrintPreviewView
            items={items}
            school={school}
            onExportXlsx={handleExportXlsx}
          />
        )}

        {activeTab === 'identity' && (
          <SchoolIdentityView
            school={school}
            onSave={(updated) => {
              setSchool(updated);
              showNotice('Identitas satuan pendidikan dan daftar akses berhasil diperbarui.');
            }}
          />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>RKT-RKAS Generator &bull; SD BOPKRI Gondolayu</span>
          <span>
            {user
              ? `Terotentikasi (${user.email}) · Tersinkronisasi ke Cloud Firestore`
              : 'Tersimpan di peramban lokal · Masuk Google (Email terdaftar) untuk sinkronisasi cloud'}
          </span>
        </div>
      </footer>
    </div>
  );
}
