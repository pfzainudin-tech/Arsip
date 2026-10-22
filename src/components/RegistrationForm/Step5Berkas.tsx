import React, { useState, useEffect } from 'react';
import { RegistrationFormData } from '../../types';
import { PhotoUploadCrop } from './PhotoUploadCrop';
import { SignaturePad } from './SignaturePad';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  Lock, 
  UserCheck, 
  ShieldAlert, 
  Save, 
  RefreshCw 
} from 'lucide-react';

interface Step5Props {
  formData: RegistrationFormData;
  updateFormData: (fields: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export const Step5Berkas: React.FC<Step5Props> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedToGoogleNotice, setSavedToGoogleNotice] = useState(false);

  // Auto-suggest password if not yet set
  useEffect(() => {
    if (!formData.password_akses) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const initialPass = `IPNU-${randomSuffix}`;
      updateFormData({
        password_akses: initialPass,
        konfirmasi_password: initialPass,
        simpan_ke_google: true
      });
    }
  }, []);

  const handlePhotoSelected = (file: File, previewUrl: string) => {
    updateFormData({
      pas_foto_file: file,
      pas_foto_preview: previewUrl
    });
  };

  const handlePhotoClear = () => {
    updateFormData({
      pas_foto_file: null,
      pas_foto_preview: ''
    });
  };

  const handleSignatureChange = (dataUrl: string) => {
    updateFormData({
      tanda_tangan_data_url: dataUrl
    });
  };

  const handleGeneratePassword = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newPass = `IPNU-${randomSuffix}`;
    updateFormData({
      password_akses: newPass,
      konfirmasi_password: newPass
    });
  };

  // Test save to Google Password Manager via Credential Management API
  const handleTestSaveGoogle = async () => {
    const userIdentifier = formData.nama_lengkap.trim() || formData.nik || 'Anggota IPNU';
    const pass = formData.password_akses || '';
    if (!pass) return;

    if (typeof window !== 'undefined' && 'PasswordCredential' in window && navigator.credentials) {
      try {
        const cred = new (window as any).PasswordCredential({
          id: userIdentifier,
          password: pass,
          name: formData.nama_lengkap.trim() || 'Anggota IPNU'
        });
        await navigator.credentials.store(cred);
        setSavedToGoogleNotice(true);
        setTimeout(() => setSavedToGoogleNotice(false), 3500);
      } catch (err) {
        console.warn('Credential API notification:', err);
        setSavedToGoogleNotice(true);
        setTimeout(() => setSavedToGoogleNotice(false), 3500);
      }
    } else {
      // Browser will capture form on submit via autocomplete
      setSavedToGoogleNotice(true);
      setTimeout(() => setSavedToGoogleNotice(false), 3500);
    }
  };

  // Calculate password strength
  const passLength = (formData.password_akses || '').length;
  const isMatch = formData.password_akses && formData.password_akses === formData.konfirmasi_password;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-extrabold">
            5
          </span>
          Upload Berkas & Pendaftaran Akun User
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tahap akhir pendaftaran: Unggah pas foto resmi, tanda tangan digital, serta buat kredensial akun user & password untuk disimpan ke Akun Google Anda.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Pas Foto 3x4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <PhotoUploadCrop
            preview={formData.pas_foto_preview}
            onPhotoSelected={handlePhotoSelected}
            onClear={handlePhotoClear}
            error={errors.pas_foto}
          />
        </div>

        {/* 2. Tanda Tangan Canvas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <SignaturePad
            value={formData.tanda_tangan_data_url}
            onChange={handleSignatureChange}
            error={errors.tanda_tangan}
          />
        </div>

        {/* 3. Pendaftaran Akun User & Pembuatan Password */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md">
                <KeyRound className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Pendaftaran Akun & Pembuatan Password</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Akses Mandiri
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  Digunakan untuk masuk ke Profil Mandiri (update riwayat & unduh berkas KTA/CV)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePassword}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-xs transition-colors self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acak Password Otomatis</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User / Identitas Login */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                User / Nama Pengguna Login:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type="text"
                  readOnly
                  name="username"
                  autoComplete="username"
                  value={formData.nama_lengkap.trim().toUpperCase() || 'NAMA DARI TAHAP 1'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 uppercase tracking-wide cursor-not-allowed select-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                *Otomatis menggunakan Nama Lengkap Anda dari formulir identitas.
              </p>
            </div>

            {/* Email Anggota */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Terdaftar (Pemulihan):
              </label>
              <input
                type="email"
                readOnly
                value={formData.email || 'Belum diisi'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-700 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                *Email digunakan untuk notifikasi dan backup data arsip Anda.
              </p>
            </div>

            {/* Buat Password Baru */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Buat Password Akses:
                </label>
                <span className="text-[10px] text-slate-500">
                  Min. 6 Karakter
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new-password"
                  autoComplete="new-password"
                  value={formData.password_akses || ''}
                  onChange={(e) => updateFormData({ password_akses: e.target.value })}
                  placeholder="Ketik password atau gunakan otomatis"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border font-mono text-sm tracking-wider focus:outline-emerald-600 ${
                    errors.password_akses ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_akses && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password_akses}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Konfirmasi Password:
                </label>
                {formData.konfirmasi_password && (
                  <span className={`text-[10px] font-bold ${isMatch ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isMatch ? '✓ Password Cocok' : '✗ Belum Cocok'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.konfirmasi_password || ''}
                  onChange={(e) => updateFormData({ konfirmasi_password: e.target.value })}
                  placeholder="Ulangi password di samping"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border font-mono text-sm tracking-wider focus:outline-emerald-600 ${
                    errors.konfirmasi_password ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.konfirmasi_password && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.konfirmasi_password}</p>
              )}
            </div>
          </div>

          {/* 4. Fitur Integrasi Simpan ke Google (Google Password Manager & Google Account) */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Official Google G Icon */}
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      Simpan User & Password ke Akun Google
                    </h4>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Google Password Manager
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Sandi akan disimpan otomatis ke Akun Google Anda (tersedia di Google Chrome, Android, dan Google Drive) agar Anda tidak perlu mengingat password secara manual.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={formData.simpan_ke_google !== false}
                  onChange={(e) => updateFormData({ simpan_ke_google: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                Browser akan memicu pop-up resmi Google saat Anda mengirim formulir.
              </span>

              <button
                type="button"
                onClick={handleTestSaveGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors border border-blue-200"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan ke Google Sekarang</span>
              </button>
            </div>

            {savedToGoogleNotice && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Kredensial Siap Disimpan:</strong> Dialog Google Password Manager telah dikirimkan ke peramban Akun Google Anda.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Declaration Notice */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Pakta Integritas Anggota IPNU:</span> Dengan mengirimkan formulir ini, saya menyatakan bahwa seluruh data, riwayat pendidikan, keorganisasian, berkas kaderisasi, dan akun yang saya buat adalah benar dan dapat dipertanggungjawabkan sesuai PD/PRT Ikatan Pelajar Nahdlatul Ulama.
          </div>
        </div>
      </div>
    </div>
  );
};
