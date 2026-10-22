import React, { useState } from 'react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw,
  Code2
} from 'lucide-react';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onConfigChanged
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl.startsWith('https://')) {
      setTestResult({
        success: false,
        message: 'Supabase URL harus diawali dengan https://'
      });
      setTesting(false);
      return;
    }

    try {
      saveSupabaseConfig(cleanUrl, cleanKey);
      const client = getSupabaseClient();
      
      if (!client) {
        throw new Error('Gagal menginisialisasi client Supabase');
      }

      // Test a light ping to Supabase
      const { data, error } = await client.from('anggota').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Connected to Supabase, but maybe table not created yet
        if (error.message.includes('relation "public.anggota" does not exist')) {
          setTestResult({
            success: true,
            message: 'Tersambung ke Supabase! Namun tabel "anggota" belum dibuat. Harap jalankan Skrip SQL di bawah.'
          });
        } else {
          setTestResult({
            success: false,
            message: `Koneksi ditolak: ${error.message}`
          });
        }
      } else {
        setTestResult({
          success: true,
          message: 'Berhasil terhubung ke database Supabase dan tabel anggota siap digunakan!'
        });
      }

      onConfigChanged();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi server Supabase.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult({
      success: true,
      message: 'Konfigurasi dibersihkan. Aplikasi beralih ke Database Penyimpanan Lokal (Demo Mode).'
    });
    onConfigChanged();
  };

  const sqlCode = `-- TABEL 1: anggota
CREATE TABLE IF NOT EXISTS public.anggota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    no_hp_wa VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pas_foto_url TEXT,
    tanda_tangan_url TEXT,
    status_verifikasi VARCHAR(30) DEFAULT 'Menunggu Verifikasi',
    catatan_verifikasi TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- TABEL 2: riwayat_pendidikan
CREATE TABLE IF NOT EXISTS public.riwayat_pendidikan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    jenjang VARCHAR(20) NOT NULL,
    nama_sekolah VARCHAR(255) NOT NULL,
    tahun_masuk VARCHAR(4) NOT NULL,
    tahun_lulus VARCHAR(4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- TABEL 3: riwayat_organisasi
CREATE TABLE IF NOT EXISTS public.riwayat_organisasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    nama_organisasi VARCHAR(255) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    tahun_mulai VARCHAR(4) NOT NULL,
    tahun_selesai VARCHAR(4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- TABEL 4: riwayat_kaderisasi
CREATE TABLE IF NOT EXISTS public.riwayat_kaderisasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anggota_id UUID NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
    kategori VARCHAR(20) NOT NULL, -- 'Formal' / 'Non-Formal'
    jenjang_formal VARCHAR(50),
    nama_kaderisasi_nonformal TEXT,
    penyelenggara VARCHAR(255) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    tahun VARCHAR(4) NOT NULL,
    sertifikat_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- STORAGE BUCKETS (Buat di Storage): 'pas-foto', 'tanda-tangan', 'sertifikat'`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Koneksi Supabase & Skema Database</h3>
              <p className="text-xs text-emerald-200">Konfigurasi Cloud Storage & Database PostgreSQL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Connection status banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            currentConfig.isConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {currentConfig.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {currentConfig.isConfigured
                  ? 'Kredensial Supabase Dikonfigurasi'
                  : 'Mode Database Lokal Aktif (Offline Ready)'}
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                {currentConfig.isConfigured
                  ? 'Aplikasi terhubung ke Supabase Cloud. Seluruh pendaftaran dan berkas foto/ttd dikirim langsung ke project Supabase Anda.'
                  : 'Aplikasi saat ini berjalan menggunakan penyimpanan lokal (Indexed/LocalStorage) dengan data simulasi IPNU. Masukkan URL dan Key Supabase Anda di bawah untuk mengaktifkan sinkronisasi cloud real-time.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium"
              >
                Gunakan Mode Demo Lokal
              </button>

              <button
                type="submit"
                disabled={testing || !url.trim() || !key.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Simpan & Tes Koneksi</span>
              </button>
            </div>
          </form>

          {/* SQL Schema helper toggle */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
              >
                <Code2 className="w-4 h-4" />
                <span>{showSql ? 'Sembunyikan Skrip SQL Supabase' : 'Lihat Skrip SQL Supabase (4 Tabel & Storage)'}</span>
              </button>

              <button
                type="button"
                onClick={copySql}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            {showSql && (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                <pre>{sqlCode}</pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
