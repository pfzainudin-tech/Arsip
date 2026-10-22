import React, { useState } from 'react';
import { AnggotaFull } from '../types';
import { getAnggotaByNik } from '../lib/db';
import { 
  X, 
  Search, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Loader2,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface CheckStatusModalProps {
  initialNik?: string;
  onClose: () => void;
  onOpenKta: (member: AnggotaFull) => void;
  onOpenCv: (member: AnggotaFull) => void;
  onOpenProfile?: (member: AnggotaFull) => void;
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({
  initialNik = '',
  onClose,
  onOpenKta,
  onOpenCv,
  onOpenProfile
}) => {
  const [nikInput, setNikInput] = useState(initialNik);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [member, setMember] = useState<AnggotaFull | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = nikInput.trim();
    if (!clean) return;

    if (clean.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const result = await getAnggotaByNik(clean);
      setMember(result);
    } catch (err) {
      setErrorMsg('Gagal mencari NIK. Periksa koneksi data.');
    } finally {
      setLoading(false);
    }
  };

  // If initialNik is provided, search immediately
  React.useEffect(() => {
    if (initialNik && initialNik.length === 16) {
      handleSearch();
    }
  }, [initialNik]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-400 font-black text-xs flex items-center justify-center border border-white/10">
              IPNU
            </div>
            <div>
              <h3 className="font-bold text-base">Cek Status Pendaftaran</h3>
              <p className="text-xs text-emerald-200">Lacak hasil verifikasi berkas anggota</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Masukkan NIK (16 Digit Angka)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="35xxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading || nikInput.length < 16}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Periksa</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </p>
            )}
          </form>

          {/* Search Result */}
          {searched && !loading && (
            <div>
              {member ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                        {member.pas_foto_url ? (
                          <img
                            src={member.pas_foto_url}
                            alt={member.nama_lengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            3x4
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm uppercase">
                          {member.nama_lengkap}
                        </h4>
                        <div className="font-mono text-xs text-emerald-800 font-semibold">
                          NIK: {member.nik}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {member.tempat_lahir}, {member.tanggal_lahir}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        member.status_verifikasi === 'Terverifikasi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : member.status_verifikasi === 'Ditolak'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {member.status_verifikasi}
                    </span>
                  </div>

                  {/* Status description */}
                  <div className="text-xs space-y-2">
                    {member.status_verifikasi === 'Terverifikasi' ? (
                      <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Selamat! Berkas Anda Telah Terverifikasi</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Data Anda telah disahkan sebagai anggota resmi IPNU. Anda dapat mencetak KTA digital Anda di bawah ini.
                          </p>
                        </div>
                      </div>
                    ) : member.status_verifikasi === 'Ditolak' ? (
                      <div className="bg-rose-50 text-rose-900 p-3 rounded-xl border border-rose-200 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Pendaftaran Ditolak</p>
                          <p className="text-[11px] text-rose-800 mt-0.5">
                            {member.catatan_verifikasi || 'Silakan hubungi pengurus PAC/PC IPNU setempat untuk perbaikan berkas.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Berkas Sedang Ditinjau</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Pengurus IPNU sedang memverifikasi identitas, riwayat kaderisasi, dan dokumen Anda. Silakan cek berkala.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      {onOpenProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProfile(member);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Buka Profil & Update Riwayat</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCv(member);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-950" />
                        <span>Cetak CV Resmi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenKta(member);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Bukti / KTA</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">NIK Tidak Ditemukan</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Pastikan NIK 16 digit yang Anda masukkan sudah benar dan telah melakukan pendaftaran mandiri.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
