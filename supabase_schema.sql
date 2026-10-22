-- ==============================================================================
-- SKEMA DATABASE ARSIP DIGITAL ANGGOTA IPNU (IKATAN PELAJAR NAHDLATUL ULAMA)
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda
-- ==============================================================================

-- 1. Enable Extension UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: anggota
CREATE TABLE IF NOT EXISTS public.anggota (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_lengkap VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    no_hp_wa VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    jabatan VARCHAR(100) DEFAULT 'ANGGOTA',
    asal_kepengurusan VARCHAR(255) DEFAULT 'PAC. IPNU KECAMATAN PACET',
    pas_foto_url TEXT,
    tanda_tangan_url TEXT,
    status_verifikasi VARCHAR(30) DEFAULT 'Menunggu Verifikasi',
    catatan_verifikasi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL: riwayat_pendidikan
CREATE TABLE IF NOT EXISTS public.riwayat_pendidikan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    jenjang VARCHAR(20) NOT NULL, -- SD, SMP, SMA, SMK, D1, D2, D3, S1, S2
    nama_sekolah VARCHAR(255) NOT NULL,
    tahun_masuk VARCHAR(4) NOT NULL,
    tahun_lulus VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL: riwayat_organisasi
CREATE TABLE IF NOT EXISTS public.riwayat_organisasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    nama_organisasi VARCHAR(255) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    tahun_mulai VARCHAR(4) NOT NULL,
    tahun_selesai VARCHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL: riwayat_kaderisasi
CREATE TABLE IF NOT EXISTS public.riwayat_kaderisasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    kategori VARCHAR(20) NOT NULL, -- 'Formal' atau 'Non-Formal'
    jenjang_formal VARCHAR(50),    -- MAKESTA, LAKMUD, LAKUT, LATIN I, LATIN II, LAKNAS, LATINNAS
    nama_kaderisasi_nonformal TEXT, -- Jika non-formal: DIKLATAMA CBP, Sekolah Jurnalistik, dll
    penyelenggara VARCHAR(255) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    tahun VARCHAR(4) NOT NULL,
    sertifikat_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEX UNTUK PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_anggota_nik ON public.anggota(nik);
CREATE INDEX IF NOT EXISTS idx_anggota_email ON public.anggota(email);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON public.anggota(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_pendidikan_anggota ON public.riwayat_pendidikan(anggota_id);
CREATE INDEX IF NOT EXISTS idx_organisasi_anggota ON public.riwayat_organisasi(anggota_id);
CREATE INDEX IF NOT EXISTS idx_kaderisasi_anggota ON public.riwayat_kaderisasi(anggota_id);

-- SETUP ROW LEVEL SECURITY (RLS)
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_pendidikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_organisasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_kaderisasi ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS (Public Read & Insert untuk form pendaftaran mandiri)
-- Catatan: Dapat disesuaikan dengan Autentikasi Admin di Supabase Auth
DROP POLICY IF EXISTS "Public can view members" ON public.anggota;
CREATE POLICY "Public can view members" ON public.anggota FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert members" ON public.anggota;
CREATE POLICY "Public can insert members" ON public.anggota FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update members" ON public.anggota;
CREATE POLICY "Public can update members" ON public.anggota FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can view pendidikan" ON public.riwayat_pendidikan;
CREATE POLICY "Public can view pendidikan" ON public.riwayat_pendidikan FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert pendidikan" ON public.riwayat_pendidikan;
CREATE POLICY "Public can insert pendidikan" ON public.riwayat_pendidikan FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view organisasi" ON public.riwayat_organisasi;
CREATE POLICY "Public can view organisasi" ON public.riwayat_organisasi FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert organisasi" ON public.riwayat_organisasi;
CREATE POLICY "Public can insert organisasi" ON public.riwayat_organisasi FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view kaderisasi" ON public.riwayat_kaderisasi;
CREATE POLICY "Public can view kaderisasi" ON public.riwayat_kaderisasi FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert kaderisasi" ON public.riwayat_kaderisasi;
CREATE POLICY "Public can insert kaderisasi" ON public.riwayat_kaderisasi FOR INSERT WITH CHECK (true);

-- STORAGE BUCKETS SETUP
-- Buat bucket di Supabase Dashboard -> Storage:
-- 1. 'pas-foto' (Public: ON)
-- 2. 'tanda-tangan' (Public: ON)
-- 3. 'sertifikat' (Public: ON)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('pas-foto', 'pas-foto', true),
    ('tanda-tangan', 'tanda-tangan', true),
    ('sertifikat', 'sertifikat', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy agar user publik bisa upload foto, ttd, dan sertifikat
DROP POLICY IF EXISTS "Allow public upload to pas-foto" ON storage.objects;
CREATE POLICY "Allow public upload to pas-foto" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pas-foto');

DROP POLICY IF EXISTS "Allow public read from pas-foto" ON storage.objects;
CREATE POLICY "Allow public read from pas-foto" ON storage.objects
FOR SELECT USING (bucket_id = 'pas-foto');

DROP POLICY IF EXISTS "Allow public upload to tanda-tangan" ON storage.objects;
CREATE POLICY "Allow public upload to tanda-tangan" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tanda-tangan');

DROP POLICY IF EXISTS "Allow public read from tanda-tangan" ON storage.objects;
CREATE POLICY "Allow public read from tanda-tangan" ON storage.objects
FOR SELECT USING (bucket_id = 'tanda-tangan');

DROP POLICY IF EXISTS "Allow public upload to sertifikat" ON storage.objects;
CREATE POLICY "Allow public upload to sertifikat" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'sertifikat');

DROP POLICY IF EXISTS "Allow public read from sertifikat" ON storage.objects;
CREATE POLICY "Allow public read from sertifikat" ON storage.objects
FOR SELECT USING (bucket_id = 'sertifikat');
