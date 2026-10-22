import React, { useState, useEffect } from 'react';
import { AnggotaFull, StatusVerifikasi } from '../../types';
import { 
  getAllAnggota, 
  updateStatusVerifikasi, 
  resetToDemoData, 
  deleteAnggota 
} from '../../lib/db';
import { MemberDetailModal } from './MemberDetailModal';
import { KtaPrintModal } from './KtaPrintModal';
import { ExportModal } from './ExportModal';
import { CvPrintModal } from '../CvPrintModal';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Printer, 
  RefreshCw, 
  RotateCcw, 
  Users, 
  Award, 
  Calendar, 
  Phone, 
  FileText,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenCv?: (member: AnggotaFull) => void;
  onOpenGoogleWorkspace?: (tab?: 'sheets' | 'drive') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenCv, onOpenGoogleWorkspace }) => {
  const [members, setMembers] = useState<AnggotaFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedKaderisasi, setSelectedKaderisasi] = useState<string>('Semua');
  
  // Modals state
  const [selectedMember, setSelectedMember] = useState<AnggotaFull | null>(null);
  const [ktaMember, setKtaMember] = useState<AnggotaFull | null>(null);
  const [cvMember, setCvMember] = useState<AnggotaFull | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllAnggota();
      setMembers(data);
    } catch (e) {
      console.error('Failed to fetch members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleStatusUpdate = async (id: string, status: StatusVerifikasi, catatan?: string) => {
    await updateStatusVerifikasi(id, status, catatan);
    // Update local state
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status_verifikasi: status, catatan_verifikasi: catatan } : m
      )
    );
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember({
        ...selectedMember,
        status_verifikasi: status,
        catatan_verifikasi: catatan
      });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Muat ulang data simulasi awal (demo)?')) {
      resetToDemoData();
      fetchMembers();
    }
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    // Search query matches Nama, NIK, or WA
    const matchQuery =
      m.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nik.includes(searchQuery.trim()) ||
      m.no_hp_wa.includes(searchQuery.trim()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchStatus =
      selectedStatus === 'Semua' || m.status_verifikasi === selectedStatus;

    // Kaderisasi filter
    const matchKaderisasi =
      selectedKaderisasi === 'Semua' ||
      m.riwayat_kaderisasi?.some(
        (k) =>
          k.jenjang_formal === selectedKaderisasi ||
          (selectedKaderisasi === 'Non-Formal' && k.kategori === 'Non-Formal')
      );

    return matchQuery && matchStatus && matchKaderisasi;
  });

  // Calculate statistics
  const totalCount = members.length;
  const pendingCount = members.filter((m) => m.status_verifikasi === 'Menunggu Verifikasi').length;
  const approvedCount = members.filter((m) => m.status_verifikasi === 'Terverifikasi').length;
  const rejectedCount = members.filter((m) => m.status_verifikasi === 'Ditolak').length;
  const formalCount = members.filter((m) =>
    m.riwayat_kaderisasi?.some((k) => k.kategori === 'Formal')
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Anggota</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tercatat di sistem</div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-semibold">Menunggu</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Perlu verifikasi</div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-semibold">Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{approvedCount}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">Anggota aktif sah</div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-xs font-semibold">Ditolak</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{rejectedCount}</div>
          <div className="text-[11px] text-rose-700/80 mt-0.5">Berkas tidak lengkap</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Kader Formal</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Lulus Makesta/Lakmud</div>
        </div>
      </div>

      {/* Control Bar: Search + Filters + Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan NIK 16 digit, Nama Lengkap, atau No WA..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: Export & Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenGoogleWorkspace && (
              <button
                onClick={() => onOpenGoogleWorkspace('sheets')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                title="Integrasi Google Drive & Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Drive & Sheets</span>
              </button>
            )}

            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel / PDF</span>
            </button>

            <button
              onClick={fetchMembers}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleResetData}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Reset ke Data Simulasi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Badges & Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Status:</span>
            {['Semua', 'Menunggu Verifikasi', 'Terverifikasi', 'Ditolak'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Kaderisasi dropdown filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Kaderisasi:</span>
            <select
              value={selectedKaderisasi}
              onChange={(e) => setSelectedKaderisasi(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-emerald-500"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="MAKESTA">MAKESTA</option>
              <option value="LAKMUD">LAKMUD</option>
              <option value="LAKUT">LAKUT</option>
              <option value="LATIN I">LATIN I</option>
              <option value="LATIN II">LATIN II</option>
              <option value="LAKNAS">LAKNAS</option>
              <option value="Non-Formal">Non-Formal (CBP/dll)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">Memuat database arsip anggota...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak Ditemukan Data Anggota</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'Semua' || selectedKaderisasi !== 'Semua'
                ? 'Tidak ada data yang cocok dengan kriteria pencarian dan filter.'
                : 'Belum ada pendaftaran anggota yang tersimpan.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Anggota & Foto</th>
                    <th className="py-3.5 px-4">NIK (16 Digit)</th>
                    <th className="py-3.5 px-4">Kontak (WA / Email)</th>
                    <th className="py-3.5 px-4">Kaderisasi Terakhir</th>
                    <th className="py-3.5 px-4">Status Verifikasi</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const formalKad = m.riwayat_kaderisasi
                      ?.filter((k) => k.kategori === 'Formal')
                      ?.pop();

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Member & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              {m.pas_foto_url ? (
                                <img
                                  src={m.pas_foto_url}
                                  alt={m.nama_lengkap}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                  3x4
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm uppercase">
                                {m.nama_lengkap}
                              </div>
                              <div className="text-slate-400 text-[11px]">
                                {m.tempat_lahir}, {m.tanggal_lahir}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* NIK */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                            {m.nik}
                          </span>
                        </td>

                        {/* Kontak */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-700" />
                              <span>{m.no_hp_wa}</span>
                            </div>
                            <div className="text-slate-400 text-[11px] truncate max-w-[160px]">
                              {m.email}
                            </div>
                          </div>
                        </td>

                        {/* Kaderisasi */}
                        <td className="py-3 px-4">
                          {formalKad ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                              <Award className="w-3 h-3 text-emerald-700" />
                              {formalKad.jenjang_formal} ({formalKad.tahun})
                            </span>
                          ) : m.riwayat_kaderisasi && m.riwayat_kaderisasi.length > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                              {m.riwayat_kaderisasi[0].kategori}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              m.status_verifikasi === 'Terverifikasi'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : m.status_verifikasi === 'Ditolak'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {m.status_verifikasi === 'Terverifikasi' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : m.status_verifikasi === 'Ditolak' ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {m.status_verifikasi}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                if (onOpenCv) onOpenCv(m);
                                else setCvMember(m);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                              title="Cetak CV Resmi"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>CV</span>
                            </button>

                            <button
                              onClick={() => setSelectedMember(m)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                              title="Lihat Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>

                            <button
                              onClick={() => setKtaMember(m)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Cetak KTA"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <div key={m.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-18 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      {m.pas_foto_url ? (
                        <img
                          src={m.pas_foto_url}
                          alt={m.nama_lengkap}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          3x4
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status_verifikasi === 'Terverifikasi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status_verifikasi === 'Ditolak'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status_verifikasi}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase mt-0.5 truncate">
                        {m.nama_lengkap}
                      </h4>
                      <div className="font-mono text-xs font-semibold text-emerald-800 mt-0.5">
                        {m.nik}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {m.tempat_lahir}, {m.tanggal_lahir}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      WA: <strong>{m.no_hp_wa}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (onOpenCv) onOpenCv(m);
                          else setCvMember(m);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-amber-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" /> CV
                      </button>

                      <button
                        onClick={() => setKtaMember(m)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> KTA
                      </button>

                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <strong>{filteredMembers.length}</strong> dari {members.length} anggota</span>
          <span className="hidden sm:inline">Basis Data Terpadu IPNU</span>
        </div>

      </div>

      {/* Modals */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdateStatus={handleStatusUpdate}
          onOpenKta={(m) => {
            setSelectedMember(null);
            setKtaMember(m);
          }}
          onOpenCv={(m) => {
            setSelectedMember(null);
            if (onOpenCv) onOpenCv(m);
            else setCvMember(m);
          }}
        />
      )}

      {ktaMember && (
        <KtaPrintModal
          member={ktaMember}
          onClose={() => setKtaMember(null)}
        />
      )}

      {cvMember && (
        <CvPrintModal
          member={cvMember}
          onClose={() => setCvMember(null)}
        />
      )}

      {showExportModal && (
        <ExportModal
          members={filteredMembers}
          onClose={() => setShowExportModal(false)}
          onOpenGoogleWorkspace={onOpenGoogleWorkspace}
        />
      )}

    </div>
  );
};
