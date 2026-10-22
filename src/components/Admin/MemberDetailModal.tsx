import React, { useState } from 'react';
import { AnggotaFull, StatusVerifikasi } from '../../types';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Users, 
  Award, 
  ExternalLink,
  Printer,
  CreditCard,
  MessageCircle,
  FileText
} from 'lucide-react';

interface MemberDetailModalProps {
  member: AnggotaFull;
  onClose: () => void;
  onUpdateStatus: (id: string, status: StatusVerifikasi, catatan?: string) => Promise<void>;
  onOpenKta: (member: AnggotaFull) => void;
  onOpenCv: (member: AnggotaFull) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onUpdateStatus,
  onOpenKta,
  onOpenCv
}) => {
  const [rejectReason, setRejectReason] = useState(member.catatan_verifikasi || '');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    setIsUpdating(true);
    await onUpdateStatus(member.id, 'Terverifikasi', 'Berkas telah diverifikasi dan disetujui oleh pengurus.');
    setIsUpdating(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Harap masukkan alasan penolakan berkas.');
      return;
    }
    setIsUpdating(true);
    await onUpdateStatus(member.id, 'Ditolak', rejectReason.trim());
    setIsUpdating(false);
    setShowRejectInput(false);
  };

  const handleResetToPending = async () => {
    setIsUpdating(true);
    await onUpdateStatus(member.id, 'Menunggu Verifikasi', '');
    setIsUpdating(false);
  };

  // WhatsApp text helper
  const cleanPhone = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('08')) {
      clean = '628' + clean.slice(2);
    }
    return clean;
  };

  const waText = encodeURIComponent(
    `Assalamu'alaikum Wr. Wb. Rekan ${member.nama_lengkap},\n\nMengenai pendaftaran Anda pada Arsip Digital Anggota IPNU dengan NIK ${member.nik}:\nStatus berkas saat ini: ${member.status_verifikasi}.\n${
      member.catatan_verifikasi ? `Catatan Pengurus: ${member.catatan_verifikasi}\n` : ''
    }\nSalam hangat,\nPengurus IPNU.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-emerald-900 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 font-black text-sm border border-white/10">
              IPNU
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Detail Arsip Anggota</h3>
              <p className="text-xs text-emerald-200">
                NIK: <span className="font-mono font-semibold">{member.nik}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                member.status_verifikasi === 'Terverifikasi'
                  ? 'bg-emerald-500 text-white'
                  : member.status_verifikasi === 'Ditolak'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-400 text-amber-950'
              }`}
            >
              {member.status_verifikasi}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Top: Photo + Key Info + TTD */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* 3x4 Photo */}
            <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-200 shrink-0">
              {member.pas_foto_url ? (
                <img
                  src={member.pas_foto_url}
                  alt={member.nama_lengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Tanpa Foto
                </div>
              )}
            </div>

            {/* Biodata info */}
            <div className="flex-1 space-y-2.5 w-full text-xs sm:text-sm">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Nama Lengkap</span>
                <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">{member.nama_lengkap}</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>NIK: <strong className="font-mono">{member.nik}</strong></span>
                  {member.password_akses && (
                    <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded ml-1" title="Password Akses Anggota">
                      Pass: {member.password_akses}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>TTL: {member.tempat_lahir}, {member.tanggal_lahir}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                  <a
                    href={`https://wa.me/${cleanPhone(member.no_hp_wa)}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{member.no_hp_wa}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700 pt-1">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{member.alamat_lengkap}</span>
              </div>
            </div>

            {/* KTP & Signature Boxes */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-36">
              {member.foto_ktp_url && (
                <div className="border border-slate-200 bg-white rounded-xl p-2 text-center flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Foto KTP</span>
                  <a href={member.foto_ktp_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={member.foto_ktp_url}
                      alt="Foto KTP"
                      className="h-12 w-full object-cover rounded border border-slate-200 hover:opacity-90"
                      title="Klik untuk melihat foto KTP"
                    />
                  </a>
                </div>
              )}

              {/* Signature Box */}
              <div className="border border-slate-200 bg-white rounded-xl p-2 text-center flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanda Tangan</span>
                {member.tanda_tangan_url ? (
                  <div className="h-12 flex items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                    <img
                      src={member.tanda_tangan_url}
                      alt="Tanda Tangan"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada</span>
                )}
              </div>
            </div>
          </div>

          {/* Verification Notes if any */}
          {member.catatan_verifikasi && (
            <div className={`p-4 rounded-xl border text-xs ${
              member.status_verifikasi === 'Ditolak'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="font-bold block mb-1">Catatan Pengurus:</span>
              <p>{member.catatan_verifikasi}</p>
            </div>
          )}

          {/* Tabular Sections: Kaderisasi, Pendidikan, Organisasi */}
          <div className="space-y-5">
            {/* 1. Riwayat Kaderisasi */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
              <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Riwayat Kaderisasi IPNU ({member.riwayat_kaderisasi?.length || 0})</span>
              </h5>

              {member.riwayat_kaderisasi && member.riwayat_kaderisasi.length > 0 ? (
                <div className="space-y-3">
                  {member.riwayat_kaderisasi.map((kad, idx) => (
                    <div
                      key={kad.id || idx}
                      className="border border-slate-100 bg-slate-50/60 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              kad.kategori === 'Formal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {kad.kategori}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {kad.kategori === 'Formal' ? kad.jenjang_formal : kad.nama_kaderisasi_nonformal}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Penyelenggara: <strong>{kad.penyelenggara}</strong> • Lokasi: {kad.lokasi} • Tahun: {kad.tahun}
                        </div>
                      </div>

                      {kad.sertifikat_url ? (
                        <a
                          href={kad.sertifikat_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Sertifikat</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Tanpa Sertifikat</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat kaderisasi yang dicatat.</p>
              )}
            </div>

            {/* 2. Riwayat Pendidikan */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
              <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Riwayat Pendidikan ({member.riwayat_pendidikan?.length || 0})</span>
              </h5>

              {member.riwayat_pendidikan && member.riwayat_pendidikan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2 pr-3">Jenjang</th>
                        <th className="py-2 px-3">Nama Sekolah / Kampus</th>
                        <th className="py-2 px-3 text-center">Tahun Masuk</th>
                        <th className="py-2 pl-3 text-center">Tahun Lulus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.riwayat_pendidikan.map((pen, idx) => (
                        <tr key={pen.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 pr-3 font-bold text-emerald-800">{pen.jenjang}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{pen.nama_sekolah}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{pen.tahun_masuk || '-'}</td>
                          <td className="py-2 pl-3 text-center text-slate-600">{pen.tahun_lulus || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat pendidikan yang dicatat.</p>
              )}
            </div>

            {/* 3. Riwayat Organisasi */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
              <h5 className="font-bold text-sm text-slate-800 flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Riwayat Organisasi ({member.riwayat_organisasi?.length || 0})</span>
              </h5>

              {member.riwayat_organisasi && member.riwayat_organisasi.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2 pr-3">Nama Organisasi</th>
                        <th className="py-2 px-3">Jabatan</th>
                        <th className="py-2 px-3 text-center">Tahun Mulai</th>
                        <th className="py-2 pl-3 text-center">Tahun Selesai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.riwayat_organisasi.map((org, idx) => (
                        <tr key={org.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 pr-3 font-semibold text-slate-800">{org.nama_organisasi}</td>
                          <td className="py-2 px-3 text-emerald-800 font-medium">{org.jabatan}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{org.tahun_mulai || '-'}</td>
                          <td className="py-2 pl-3 text-center text-slate-600">{org.tahun_selesai || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat organisasi yang dicatat.</p>
              )}
            </div>
          </div>

          {/* Rejection input area if toggled */}
          {showRejectInput && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-rose-900">
                Alasan Penolakan Berkas:
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Pas foto buram, NIK tidak sesuai KTP, atau sertifikat MAKESTA belum dilampirkan..."
                className="w-full p-2.5 rounded-xl border border-rose-300 text-xs bg-white focus:outline-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${cleanPhone(member.no_hp_wa)}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi WA</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenCv(member)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak CV Resmi</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenKta(member)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak KTA</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {member.status_verifikasi !== 'Terverifikasi' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verifikasi (Setujui)</span>
              </button>
            )}

            {member.status_verifikasi !== 'Ditolak' && !showRejectInput && (
              <button
                type="button"
                onClick={() => setShowRejectInput(true)}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Berkas</span>
              </button>
            )}

            {member.status_verifikasi !== 'Menunggu Verifikasi' && (
              <button
                type="button"
                onClick={handleResetToPending}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Reset ke Menunggu</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
