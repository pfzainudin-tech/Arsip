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
    tingkat_kepengurusan: 'PAC',
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
    tingkat_kepengurusan: 'PR',
    asal_kepengurusan: 'PR. IPNU DESA SUKOREJO',
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
    tingkat_kepengurusan: 'PKPT',
    asal_kepengurusan: 'PKPT IPNU UIN SUNAN AMPEL',
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
    tingkat_kepengurusan: 'PK',
    asal_kepengurusan: 'PK IPNU SMK NEGERI 1 SIDOARJO',
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
  },
  {
    id: 'e5f6a7b8-c9d0-41e2-f345-556677889900',
    nama_lengkap: 'M. SYAFIQ AL-FATIH',
    alamat_lengkap: 'Jl. Majapahit No. 88, Kec. Kranggan, Kota Mojokerto, Jawa Timur',
    tempat_lahir: 'Mojokerto',
    tanggal_lahir: '2004-02-14',
    nik: '3576011402040001',
    no_hp_wa: '081299887766',
    email: 'syafiq.alfatih@ipnu.id',
    pas_foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 40 70 Q 80 15 120 60 T 190 40 Q 230 65 260 45" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195405',
    jabatan: 'WAKIL SEKRETARIS',
    tingkat_kepengurusan: 'PC',
    asal_kepengurusan: 'PC. IPNU KABUPATEN MOJOKERTO',
    status_verifikasi: 'Terverifikasi',
    catatan_verifikasi: 'Berkas lengkap dan rekomendasi PC IPNU sah.',
    created_at: '2026-10-14T10:00:00Z',
    updated_at: '2026-10-15T12:00:00Z',
    riwayat_pendidikan: [
      {
        id: 'p8',
        jenjang: 'SMA',
        nama_sekolah: 'MAN 1 Mojokerto',
        tahun_masuk: '2019',
        tahun_lulus: '2022'
      },
      {
        id: 'p9',
        jenjang: 'S1',
        nama_sekolah: 'Universitas Islam Majapahit',
        tahun_masuk: '2022',
        tahun_lulus: '2026'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o6',
        nama_organisasi: 'PC IPNU Kabupaten Mojokerto',
        jabatan: 'Wakil Sekretaris',
        tahun_mulai: '2024',
        tahun_selesai: '2026'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k10',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PAC IPNU Mojosari',
        lokasi: 'Mojokerto',
        tahun: '2020'
      },
      {
        id: 'k11',
        kategori: 'Formal',
        jenjang_formal: 'LAKMUD',
        penyelenggara: 'PC IPNU Kab Mojokerto',
        lokasi: 'Pacet Mojokerto',
        tahun: '2022'
      }
    ]
  },
  {
    id: 'f6a7b8c9-d0e1-42f3-a456-667788990011',
    nama_lengkap: 'AHMAD ZAINUDDIN',
    alamat_lengkap: 'Dusun Pacet Selatan RT 01/RW 02, Desa Pacet, Kec. Pacet, Kab. Mojokerto',
    tempat_lahir: 'Mojokerto',
    tanggal_lahir: '2005-08-17',
    nik: '3516081708050004',
    no_hp_wa: '085877889900',
    email: 'zainuddin.pacet@gmail.com',
    pas_foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    foto_ktp_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    tanda_tangan_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M 35 65 Q 75 25 115 55 T 180 50 Q 220 70 255 45" stroke="%23166534" stroke-width="3" fill="none"/></svg>',
    password_akses: 'IPNU-195406',
    jabatan: 'BENDAHARA',
    tingkat_kepengurusan: 'PR',
    asal_kepengurusan: 'PR. IPNU DESA PACET',
    status_verifikasi: 'Terverifikasi',
    catatan_verifikasi: 'Pengurus Ranting aktif.',
    created_at: '2026-10-19T09:15:00Z',
    updated_at: '2026-10-19T14:20:00Z',
    riwayat_pendidikan: [
      {
        id: 'p10',
        jenjang: 'SMA',
        nama_sekolah: 'SMK Negeri 1 Dlanggu',
        tahun_masuk: '2020',
        tahun_lulus: '2023'
      }
    ],
    riwayat_organisasi: [
      {
        id: 'o7',
        nama_organisasi: 'PR IPNU Desa Pacet',
        jabatan: 'Bendahara',
        tahun_mulai: '2023',
        tahun_selesai: '2025'
      }
    ],
    riwayat_kaderisasi: [
      {
        id: 'k12',
        kategori: 'Formal',
        jenjang_formal: 'MAKESTA',
        penyelenggara: 'PR IPNU Desa Pacet',
        lokasi: 'Balai Desa Pacet',
        tahun: '2021'
      }
    ]
  }
];
