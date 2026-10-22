import React, { useState } from 'react';
import { AnggotaFull } from '../../types';
import { verifyMemberLogin, getAllAnggota } from '../../lib/db';
import { 
  LogIn, 
  User, 
  Key, 
  AlertCircle, 
  Loader2, 
  UserPlus, 
  X, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (member: AnggotaFull) => void;
  onLoginAdmin: () => void;
  onSwitchToRegister: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLoginAdmin,
  onSwitchToRegister
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [passwordAkses, setPasswordAkses] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoList, setDemoList] = useState<AnggotaFull[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNama = namaLengkap.trim();
    const cleanPass = passwordAkses.trim();

    if (!cleanNama) {
      setErrorMsg('Harap masukkan Nama Lengkap Anda atau User Admin.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('Harap masukkan Password Akses.');
      return;
    }

    // Check Admin Login: User: Admin, Password: admin123 (silent/hidden)
    if (cleanNama.toLowerCase() === 'admin' && cleanPass.toLowerCase() === 'admin123') {
      onLoginAdmin();
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await verifyMemberLogin(cleanNama, cleanPass);
      if (res.success && res.member) {
        onLoginSuccess(res.member);
        onClose();
      } else {
        setErrorMsg(res.error || 'Nama lengkap atau Password Akses tidak cocok.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal memproses login. Periksa koneksi data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoAccounts = async () => {
    setShowDemoAccounts(true);
    const members = await getAllAnggota();
    setDemoList(members.slice(0, 3));
  };

  const handleSelectDemo = (member: AnggotaFull) => {
    setNamaLengkap(member.nama_lengkap);
    setPasswordAkses(member.password_akses || 'IPNU-195401');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
              <LogIn className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Masuk ke Profil Akun</h3>
              <p className="text-xs text-emerald-200">Gunakan Nama Lengkap & Password Akses Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="CONTOH: AHMAD FAUZI NUGRAHA / NIK"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wide focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password Akses
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  (Dibuat saat pendaftaran)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={passwordAkses}
                  onChange={(e) => setPasswordAkses(e.target.value)}
                  placeholder="CONTOH: IPNU-195401"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo helper for members */}
          <div className="pt-1 border-t border-slate-100">
            {!showDemoAccounts ? (
              <button
                type="button"
                onClick={handleLoadDemoAccounts}
                className="w-full py-1.5 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold text-center hover:underline flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Klik untuk Contoh Akun Demo Anggota</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Pilih Akun Demo Anggota:
                </p>
                <div className="space-y-1.5">
                  {demoList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectDemo(m)}
                      className="w-full text-left p-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{m.nama_lengkap}</span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                          Pass: {m.password_akses || 'IPNU-195401'}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch to Register */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 text-center border border-emerald-100 space-y-2">
            <p className="text-xs text-slate-600">Belum terdaftar sebagai anggota IPNU?</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Daftar Anggota Baru Sekarang</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
