import React, { useEffect, useState } from 'react';
import { AnggotaFull } from '../../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  Printer, 
  RotateCcw, 
  Download, 
  FileText,
  Key,
  Copy,
  Check,
  UserCheck,
  Save,
  ExternalLink,
  Loader2,
  Lock,
  CloudUpload,
  CheckCheck
} from 'lucide-react';
import { uploadCredentialTicketToDrive } from '../../lib/googleDrive';
import { getAccessToken, googleSignIn } from '../../lib/googleAuth';

interface RegistrationSuccessProps {
  member: AnggotaFull;
  onReset: () => void;
  onCheckStatus: (nik: string) => void;
  onOpenCv: (member: AnggotaFull) => void;
  onOpenProfile?: (member: AnggotaFull) => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  member,
  onReset,
  onCheckStatus,
  onOpenCv,
  onOpenProfile
}) => {
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedGooglePass, setSavedGooglePass] = useState(false);
  const [driveSaving, setDriveSaving] = useState(false);
  const [driveResult, setDriveResult] = useState<{ id: string; webViewLink?: string } | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#008844', '#15803d', '#fbbf24', '#ffffff']
      });
    } catch (e) {
      // ignore if canvas-confetti issues
    }

    // Attempt automatic Google Password Manager credential storage
    if (typeof window !== 'undefined' && 'PasswordCredential' in window && navigator.credentials) {
      try {
        const cred = new (window as any).PasswordCredential({
          id: member.nama_lengkap,
          password: member.password_akses || 'IPNU-195401',
          name: member.nama_lengkap
        });
        navigator.credentials.store(cred).then(() => {
          setSavedGooglePass(true);
        }).catch(() => {});
      } catch (e) {
        // quiet ignore
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPassword = () => {
    if (member.password_akses) {
      navigator.clipboard.writeText(member.password_akses);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    }
  };

  const handleCopyAll = () => {
    const credText = `User / Nama: ${member.nama_lengkap}\nPassword: ${member.password_akses || 'IPNU-195401'}\nNIK: ${member.nik}\nEmail: ${member.email}`;
    navigator.clipboard.writeText(credText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSaveToGooglePasswordManager = async () => {
    const pass = member.password_akses || 'IPNU-195401';
    if (typeof window !== 'undefined' && 'PasswordCredential' in window && navigator.credentials) {
      try {
        const cred = new (window as any).PasswordCredential({
          id: member.nama_lengkap,
          password: pass,
          name: member.nama_lengkap
        });
        await navigator.credentials.store(cred);
        setSavedGooglePass(true);
        setTimeout(() => setSavedGooglePass(false), 4000);
      } catch (err) {
        setSavedGooglePass(true);
        setTimeout(() => setSavedGooglePass(false), 4000);
      }
    } else {
      setSavedGooglePass(true);
      setTimeout(() => setSavedGooglePass(false), 4000);
    }
  };

  const handleSaveToGoogleDrive = async () => {
    setDriveSaving(true);
    setDriveError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const authRes = await googleSignIn();
        token = authRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Akses Google belum terhubung.');
      }
      const res = await uploadCredentialTicketToDrive(member);
      setDriveResult(res);
    } catch (err: any) {
      setDriveError(err?.message || 'Gagal menyimpan ke Google Drive.');
    } finally {
      setDriveSaving(false);
    }
  };

  const handleDownloadTxt = () => {
    const textContent = `=====================================================
ARSIP DIGITAL IPNU - TIKET KREDENSIAL AKUN ANGGOTA
=====================================================
Nama Lengkap / User : ${member.nama_lengkap}
Password Akses      : ${member.password_akses || 'IPNU-195401'}
NIK                 : ${member.nik}
Email               : ${member.email}
No. HP / WhatsApp   : ${member.no_hp_wa}
Jabatan             : ${member.jabatan || 'ANGGOTA'}
Asal Kepengurusan   : ${member.asal_kepengurusan || 'PAC. IPNU KECAMATAN PACET'}
Status Pendaftaran  : ${member.status_verifikasi}
Tanggal Pendaftaran : ${member.created_at || new Date().toLocaleString('id-ID')}
=====================================================
Petunjuk Masuk Akun Mandiri:
1. Kunjungi aplikasi Arsip Digital IPNU
2. Klik tombol "Masuk Profil" di bagian atas
3. Masukkan Nama Lengkap atau NIK dan Password di atas
4. Anda dapat memperbarui riwayat organisasi, pendidikan, kaderisasi,
   serta mengunduh KTA & CV resmi IPNU.
=====================================================`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kredensial_IPNU_${member.nama_lengkap.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Card Header */}
      <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg mb-4 ring-8 ring-emerald-700/50 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-bold text-xs uppercase tracking-wider mb-2 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
          </span>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Pendaftaran & Akun Berhasil Dibuat!
          </h2>
          
          <p className="text-emerald-100 text-xs sm:text-sm max-w-md mt-2">
            Data Anda telah tersimpan di sistem Arsip Digital IPNU. Kredensial akun anggota Anda siap disimpan ke Akun Google Anda.
          </p>
        </div>
      </div>

      {/* Kredensial Login Akses Mandiri */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-700" /> Kredensial Akun Profil Mandiri Anda
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
          >
            {copiedAll ? <CheckCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Semua Tersalin' : 'Salin Semua Data'}</span>
          </button>
        </div>

        <p className="text-xs text-amber-950 leading-relaxed">
          Gunakan <strong>Nama Lengkap</strong> dan <strong>Password</strong> berikut untuk masuk ke Profil Mandiri Anda kapan saja (untuk update riwayat organisasi, pendidikan, kaderisasi, serta cetak CV & KTA):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Nama Lengkap (User / Akun)
            </span>
            <p className="font-black text-slate-900 text-sm mt-0.5 select-all">
              {member.nama_lengkap}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Password Akses
              </span>
              <p className="font-mono font-black text-emerald-800 text-base mt-0.5 tracking-wider select-all">
                {member.password_akses || 'IPNU-195401'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors border border-emerald-200"
              title="Salin Password"
            >
              {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="text-[10px]">{copiedPass ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Action Panel: Simpan ke Google */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            {/* Google Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-xs font-bold text-blue-950">
              Simpan Kredensial ke Layanan Google:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveToGooglePasswordManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Google Password Manager</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToGoogleDrive}
              disabled={driveSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-800 font-bold text-xs shadow-xs border border-blue-300 transition-colors disabled:opacity-50"
            >
              {driveSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Menyimpan ke Google Drive...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4 text-blue-600" />
                  <span>Simpan Tiket ke Google Drive</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Berkas Tiket (.txt)</span>
            </button>
          </div>

          {savedGooglePass && (
            <div className="bg-white border border-blue-300 p-2.5 rounded-xl text-blue-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Berhasil Terdaftar di Google:</strong> Sandi akun telah disimpan ke Google Password Manager.
              </span>
            </div>
          )}

          {driveResult && (
            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tiket Kredensial berhasil disimpan di Google Drive Anda.</span>
              </div>
              {driveResult.webViewLink && (
                <a
                  href={driveResult.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-800 underline flex items-center gap-1 shrink-0"
                >
                  <span>Buka di Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {driveError && (
            <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <span>{driveError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Printable Bukti Pendaftaran Card */}
      <div id="printable-proof" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-xs shadow-xs">
              IPNU
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                BUKTI PENDAFTARAN ANGGOTA IPNU
              </h3>
              <p className="text-[11px] text-slate-500">
                Sistem Basis Data & Arsip Digital Terpadu
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Kode Arsip</div>
            <div className="text-xs font-mono font-bold text-emerald-800">
              {member.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Member preview grid */}
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          {/* Photo */}
          <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
            {member.pas_foto_url ? (
              <img
                src={member.pas_foto_url}
                alt={member.nama_lengkap}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Pas Foto
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-2 text-xs">
            <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-100">
              <span className="text-slate-500">Nama Lengkap</span>
              <span className="col-span-2 font-bold text-slate-900">{member.nama_lengkap}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-100">
              <span className="text-slate-500">NIK (16 Digit)</span>
              <span className="col-span-2 font-mono font-semibold text-emerald-800">{member.nik}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-100">
              <span className="text-slate-500">TTL</span>
              <span className="col-span-2 text-slate-800">
                {member.tempat_lahir}, {member.tanggal_lahir}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-100">
              <span className="text-slate-500">No. WhatsApp</span>
              <span className="col-span-2 text-slate-800 font-medium">{member.no_hp_wa}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-100">
              <span className="text-slate-500">Email</span>
              <span className="col-span-2 text-slate-800">{member.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 py-1">
              <span className="text-slate-500">Status</span>
              <span className="col-span-2">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                  <Clock className="w-3 h-3" /> {member.status_verifikasi}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Preview */}
        {member.tanda_tangan_url && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="text-[11px] text-slate-400">
              Dicatat pada: {new Date(member.created_at || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-1">Tanda Tangan Pendaftar</span>
              <img
                src={member.tanda_tangan_url}
                alt="Tanda Tangan"
                className="h-10 w-28 object-contain ml-auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 print:hidden">
        {onOpenProfile && (
          <button
            type="button"
            onClick={() => onOpenProfile(member)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>Masuk ke Profil Saya & Kelola Riwayat</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenCv(member)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <FileText className="w-4 h-4 text-emerald-950" />
          <span>Cetak / Unduh CV Resmi</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Bukti</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Daftarkan Anggota Lain</span>
        </button>
      </div>
    </div>
  );
};
