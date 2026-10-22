import { AnggotaFull } from '../types';

export const INITIAL_MOCK_MEMBERS: AnggotaFull[] = [
  {
    id: 'a1b2c3d4-e5f6-47a8-b901-112233445566',
    nama_lengkap: 'AHMAD FAUZI NUGRAHA',
    alamat_lengkap: 'Jl. Pesantren No. 45 RT 03/RW 04, Kelurahan Kauman, Kec. Klojen, Kota Malang, Jawa Timur',
    tempat_lahir: 'Malang',
    tanggal_lahir: '2004-06-15',
    nik: '3573011506040002',
    no_hp_wa: '081234567890',
    email: 'ahmad.fauzi@ipnu.id',
    pas_foto_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 30 70 Q 70 20 110 60 T 170 65 Q 210 20 250 80" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195401',
    jabatan: 'KETUA',
    asal_kepengurusan: 'PAC. IPNU KECAMATAN PACET',
    status_verifikasi: 'Terverifikasi',
    catatan_verifikasi: 'Dokumen lengkap dan telah diverifikasi oleh PAC IPNU.',
    created_at: '2026-10-15T08:30:00Z',
    updated_at: '2026-10-16T10:15:00Z',
    riwayat_pendidikan: [
      {
        id: 'p1',
        jenjang: 'SMA',
        nama_sekolah: 'SMA Nahdlatul Ulama 1 Malang',
        tahun_masuk: '2019',
        tahun_lulus: '2022'
      },
      {
        id: 'p2',
        jenjang: 'S1',
        nama_sekolah: 'Universitas Islam Malang (UNISMA)',
        tahun_masuk: '2022',
        tahun_lulus: '2026'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o1',
        nama_organisasi: 'Pimpinan Ranting IPNU Kauman',
        jabatan: 'Ketua',
        tahun_mulai: '2021',
        tahun_selesai: '2023'
      },
      {
        id: 'o2',
        nama_organisasi: 'PAC IPNU Kecamatan Klojen',
        jabatan: 'Wakil Ketua Bidang Kaderisasi',
        tahun_mulai: '2023',
        tahun_selesai: '2025'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k1',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PAC IPNU Klojen',
        lokasi: 'Gedung MWC NU Klojen',
        tahun: '2020',
        sertifikat_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'k2',
        kategori: 'Formal',
        jenjang_formal: 'LAKMUD',
        penyelenggara: 'PC IPNU Kota Malang',
        lokasi: 'PP. Sabilurrosyad Gasek Malang',
        tahun: '2022',
        sertifikat_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'k3',
        kategori: 'Non-Formal',
        nama_kaderisasi_nonformal: 'DIKLATAMA CBP (Corps Brigade Pembangunan)',
        penyelenggara: 'Dewan Koordinasi Cabang CBP Kota Malang',
        lokasi: 'Bumi Perkemahan Bedengan',
        tahun: '2023'
      }
    ]
  },
  {
    id: 'b2c3d4e5-f6a7-48b9-c012-223344556677',
    nama_lengkap: 'MUHAMMAD WILDAN HAKIM',
    alamat_lengkap: 'Dusun Krajan RT 02/RW 01, Desa Sukorejo, Kec. Bangil, Kab. Pasuruan, Jawa Timur',
    tempat_lahir: 'Pasuruan',
    tanggal_lahir: '2006-11-20',
    nik: '3514052011060001',
    no_hp_wa: '085712345678',
    email: 'wildan.hakim@gmail.com',
    pas_foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 40 80 Q 90 10 130 50 T 200 40 Q 240 70 270 50" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195402',
    jabatan: 'SEKRETARIS',
    asal_kepengurusan: 'PAC. IPNU KECAMATAN PACET',
    status_verifikasi: 'Menunggu Verifikasi',
    catatan_verifikasi: '',
    created_at: '2026-10-18T14:20:00Z',
    updated_at: '2026-10-18T14:20:00Z',
    riwayat_pendidikan: [
      {
        id: 'p3',
        jenjang: 'SMP',
        nama_sekolah: 'MTs Negeri 1 Pasuruan',
        tahun_masuk: '2018',
        tahun_lulus: '2021'
      },
      {
        id: 'p4',
        jenjang: 'SMK',
        nama_sekolah: "SMK Ma'arif Bangil",
        tahun_masuk: '2021',
        tahun_lulus: '2024'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o3',
        nama_organisasi: "PK IPNU SMK Ma'arif Bangil",
        jabatan: 'Sekretaris',
        tahun_mulai: '2022',
        tahun_selesai: '2023'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k4',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PAC IPNU Bangil',
        lokasi: 'Aula MWC NU Bangil',
        tahun: '2022',
        sertifikat_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'c3d4e5f6-a7b8-49c0-d123-334455667788',
    nama_lengkap: 'RIZKI RAMADHAN SAPUTRA',
    alamat_lengkap: 'Jl. Ahmad Yani No. 12, Kel. Wonokromo, Kec. Wonokromo, Kota Surabaya',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '2003-09-08',
    nik: '3578020809030005',
    no_hp_wa: '081398765432',
    email: 'rizki.ramadhan@ipnu.id',
    pas_foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 25 60 C 60 10, 80 90, 140 40 S 210 90, 260 40" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195403',
    jabatan: 'WAKIL KETUA',
    asal_kepengurusan: 'PAC. IPNU KECAMATAN PACET',
    status_verifikasi: 'Terverifikasi',
    catatan_verifikasi: 'Instruktur aktif di PC IPNU Surabaya.',
    created_at: '2026-10-10T09:12:00Z',
    updated_at: '2026-10-12T11:00:00Z',
    riwayat_pendidikan: [
      {
        id: 'p5',
        jenjang: 'SMA',
        nama_sekolah: 'SMA Khadijah Surabaya',
        tahun_masuk: '2018',
        tahun_lulus: '2021'
      },
      {
        id: 'p6',
        jenjang: 'S1',
        nama_sekolah: 'UIN Sunan Ampel Surabaya',
        tahun_masuk: '2021',
        tahun_lulus: '2025'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o4',
        nama_organisasi: 'PKPT IPNU UIN Sunan Ampel',
        jabatan: 'Ketua Departemen Kaderisasi',
        tahun_mulai: '2023',
        tahun_selesai: '2024'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k5',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PAC Wonokromo',
        lokasi: 'Surabaya',
        tahun: '2019'
      },
      {
        id: 'k6',
        kategori: 'Formal',
        jenjang_formal: 'LAKMUD',
        penyelenggara: 'PC IPNU Surabaya',
        lokasi: 'Asrama Haji Sukolilo',
        tahun: '2021'
      },
      {
        id: 'k7',
        kategori: 'Formal',
        jenjang_formal: 'LATIN I',
        penyelenggara: 'PW IPNU Jawa Timur',
        lokasi: "Pusdiklat LP Ma'arif Jatim",
        tahun: '2023'
      },
      {
        id: 'k8',
        kategori: 'Non-Formal',
        nama_kaderisasi_nonformal: 'Sekolah Jurnalistik & Media Pelajar NU',
        penyelenggara: 'Lembaga Pers & Penerbitan PW IPNU Jatim',
        lokasi: 'Gedung PWNU Jatim',
        tahun: '2022'
      }
    ]
  },
  {
    id: 'd4e5f6a7-b8c9-40d1-e234-445566778899',
    nama_lengkap: 'BAGAS ARDIANSYAH',
    alamat_lengkap: 'Perumahan Graha Indah Blok C3, Kel. Sidoarjo, Kab. Sidoarjo',
    tempat_lahir: 'Sidoarjo',
    tanggal_lahir: '2005-03-25',
    nik: '3515082503050003',
    no_hp_wa: '082155667788',
    email: 'bagas.ardi@gmail.com',
    pas_foto_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 50 60 Q 90 20 130 70 T 210 50" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195404',
    jabatan: 'ANGGOTA',
    asal_kepengurusan: 'PAC. IPNU KECAMATAN PACET',
    status_verifikasi: 'Ditolak',
    catatan_verifikasi: 'Pas foto tidak sesuai ketentuan (bukan formal 3x4) dan sertifikat MAKESTA belum dilampirkan.',
    created_at: '2026-10-17T11:45:00Z',
    updated_at: '2026-10-18T16:30:00Z',
    riwayat_pendidikan: [
      {
        id: 'p7',
        jenjang: 'SMK',
        nama_sekolah: 'SMK Negeri 1 Sidoarjo',
        tahun_masuk: '2020',
        tahun_lulus: '2023'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o5',
        nama_organisasi: 'Remaja Masjid Baitul Mukminin',
        jabatan: 'Koordinator Acara',
        tahun_mulai: '2021',
        tahun_selesai: '2023'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k9',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PAC IPNU Sidoarjo',
        lokasi: 'SMK Antartika Sidoarjo',
        tahun: '2022'
      }
    ]
  }
];
