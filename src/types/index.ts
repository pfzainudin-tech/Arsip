export type StatusVerifikasi = 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak';

export type JenjangPendidikan = 
  | 'SD' 
  | 'SMP' 
  | 'SMA' 
  | 'SMK' 
  | 'D1' 
  | 'D2' 
  | 'D3' 
  | 'S1' 
  | 'S2';

export type KategoriKaderisasi = 'Formal' | 'Non-Formal';

export type JenjangFormal = 
  | 'MAKESTA' 
  | 'LAKMUD' 
  | 'LAKUT' 
  | 'LATIN I' 
  | 'LATIN II' 
  | 'LAKNAS' 
  | 'LATINNAS';

export interface Anggota {
  id: string;
  nama_lengkap: string;
  alamat_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string; // YYYY-MM-DD
  nik: string; // 16 digits
  no_hp_wa: string;
  email: string;
  jabatan?: string; // e.g. KETUA, SEKRETARIS, WAKIL KETUA, ANGGOTA
  asal_kepengurusan?: string; // e.g. PAC. IPNU KECAMATAN PACET
  pas_foto_url: string;
  foto_ktp_url?: string;
  tanda_tangan_url: string;
  password_akses?: string; // Auto-generated password for member login
  status_verifikasi: StatusVerifikasi;
  catatan_verifikasi?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RiwayatPendidikan {
  id?: string;
  anggota_id?: string;
  jenjang: JenjangPendidikan;
  nama_sekolah: string;
  tahun_masuk: string;
  tahun_lulus: string;
}

export interface RiwayatOrganisasi {
  id?: string;
  anggota_id?: string;
  nama_organisasi: string;
  jabatan: string;
  tahun_mulai: string;
  tahun_selesai: string;
}

export interface RiwayatKaderisasi {
  id?: string;
  anggota_id?: string;
  kategori: KategoriKaderisasi;
  jenjang_formal?: JenjangFormal;
  nama_kaderisasi_nonformal?: string;
  penyelenggara: string;
  lokasi: string;
  tahun: string;
  sertifikat_url?: string;
}

export interface AnggotaFull extends Anggota {
  riwayat_pendidikan: RiwayatPendidikan[];
  riwayat_organisasi: RiwayatOrganisasi[];
  riwayat_kaderisasi: RiwayatKaderisasi[];
}

export interface RegistrationFormData {
  // Step 1: Data Diri & Kepengurusan
  nama_lengkap: string;
  alamat_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nik: string;
  no_hp_wa: string;
  email: string;
  jabatan?: string;
  asal_kepengurusan?: string;

  // Step 2: Riwayat Pendidikan
  pendidikan_list: RiwayatPendidikan[];

  // Step 3: Riwayat Organisasi
  organisasi_list: RiwayatOrganisasi[];

  // Step 4: Riwayat Kaderisasi
  kaderisasi_list: RiwayatKaderisasi[];

  // Step 5: Berkas & Pendaftaran Akun
  pas_foto_file: File | null;
  pas_foto_preview: string;
  foto_ktp_file?: File | null;
  foto_ktp_preview?: string;
  tanda_tangan_data_url: string; // PNG base64 transparent
  password_akses?: string;
  konfirmasi_password?: string;
  simpan_ke_google?: boolean;
}
