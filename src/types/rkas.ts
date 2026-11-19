export type SumberDana =
  | 'BOS Reguler'
  | 'BOS Kinerja'
  | 'BOSP Daerah / BOP'
  | 'Dana Komite / Swadaya'
  | 'Lainnya';

export type Bulan =
  | 'Januari'
  | 'Februari'
  | 'Maret'
  | 'April'
  | 'Mei'
  | 'Juni'
  | 'Juli'
  | 'Agustus'
  | 'September'
  | 'Oktober'
  | 'November'
  | 'Desember';

export type Prioritas = 'Tinggi' | 'Sedang' | 'Rendah';

export type JenisBelanja =
  | 'Belanja Barang & Jasa'
  | 'Belanja Modal'
  | 'Belanja Pegawai / Honorarium';

export interface RkasItem {
  id: string;
  snp: string;
  jenisBelanja: JenisBelanja;
  uraianKegiatan: string;
  rincianBelanja: string;
  volume: number;
  satuan: string;
  hargaSatuan: number;
  totalAnggaran: number;
  sumberDana: SumberDana;
  bulan: Bulan[];
  penanggungJawab: string;
  prioritas: Prioritas;
  keluaran: string;
  keterangan: string;
  createdAt: string;
}

export interface SchoolIdentity {
  namaSekolah: string;
  npsn: string;
  jenjang: 'PAUD/TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'SLB';
  tahunAnggaran: string;
  alamat: string;
  kecamatanKabKota: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  bendahara: string;
  nipBendahara: string;
  paguAnggaran: number;
  tanggalDokumen: string;
  registeredEmails?: string[];
  superadminEmails?: string[];
}

export interface RenstraData {
  visi: string;
  misi: string[];
  tujuanStrategis: string[];
  sasaranMutu: string[];
  periode: string;
}
