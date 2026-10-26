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
  FileSpreadsheet, 
  BarChart3, 
  AlertTriangle, 
  HardDrive, 
  X, 
  Layers, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  ORG_LEVELS_DEFINITION, 
  resolveMemberOrgLevel, 
  getOrgLevelMeta 
} from '../../lib/orgLevels';
import { 
  getLastSheetsBackup, 
  getBackupStatus, 
  SheetSyncResult 
} from '../../lib/googleSheets';

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
  const [selectedOrgLevel, setSelectedOrgLevel] = useState<string>('Semua');

  // Google Sheets backup tracking state (7 days warning)
  const [lastSheetsBackup, setLastSheetsBackup] = useState<SheetSyncResult | null>(() => getLastSheetsBackup());
  const [isBackupBannerDismissed, setIsBackupBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ipnu_backup_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

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

    // Listen for realtime backup events (from GoogleWorkspaceModal or other tabs)
    const handleBackupUpdate = (e: any) => {
      if (e.detail) {
        setLastSheetsBackup(e.detail);
      } else {
        setLastSheetsBackup(getLastSheetsBackup());
      }
    };

    window.addEventListener('ipnu_sheets_backup_updated', handleBackupUpdate);
    window.addEventListener('storage', handleBackupUpdate);
    return () => {
      window.removeEventListener('ipnu_sheets_backup_updated', handleBackupUpdate);
      window.removeEventListener('storage', handleBackupUpdate);
    };
  }, []);

  const handleDismissBackupBanner = () => {
    try {
      sessionStorage.setItem('ipnu_backup_banner_dismissed', 'true');
    } catch {}
    setIsBackupBannerDismissed(true);
  };

  const handleStatusUpdate = async (id: string, status: StatusVerifikasi, catatan?: string) => {
    await updateStatusVerifikasi(id, status, catatan);
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

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data anggota ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteAnggota(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (selectedMember && selectedMember.id === id) {
        setSelectedMember(null);
      }
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

    // Tingkat Kepengurusan filter
    const matchOrgLevel =
      selectedOrgLevel === 'Semua' ||
      resolveMemberOrgLevel(m) === selectedOrgLevel;

    return matchQuery && matchStatus && matchKaderisasi && matchOrgLevel;
  });

  // Calculate statistics
  const totalCount = members.length;
  const pendingCount = members.filter((m) => m.status_verifikasi === 'Menunggu Verifikasi').length;
  const approvedCount = members.filter((m) => m.status_verifikasi === 'Terverifikasi').length;
  const rejectedCount = members.filter((m) => m.status_verifikasi === 'Ditolak').length;
  const formalCount = members.filter((m) =>
    m.riwayat_kaderisasi?.some((k) => k.kategori === 'Formal')
  ).length;

  // Calculate statistics per level of organizational management
  const orgLevelStats = ORG_LEVELS_DEFINITION.map((tier) => {
    const count = members.filter((m) => resolveMemberOrgLevel(m) === tier.code).length;
    const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
    const approvedTierCount = members.filter(
      (m) => resolveMemberOrgLevel(m) === tier.code && m.status_verifikasi === 'Terverifikasi'
    ).length;
    return {
      ...tier,
      count,
      percentage,
      approvedTierCount
    };
  });

  // Calculate backup status (warn if > 7 days or never)
  const backupStatus = getBackupStatus(lastSheetsBackup);

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* 1. NOTIFICATION BANNER: GOOGLE SHEETS BACKUP > 7 DAYS */}
      {/* ======================================================== */}
      {backupStatus.isOverdue && !isBackupBannerDismissed && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 p-4 sm:p-5 shadow-sm transition-all animate-fadeIn">
          {/* Subtle background decoration */}
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-amber-900">
            <FileSpreadsheet className="w-48 h-48" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            {/* Warning Message & Details */}
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center border border-amber-300">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-[10px] font-black uppercase tracking-wider font-trajan">
                    Peringatan Cadangan Data
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {backupStatus.daysAgo === null
                      ? 'Belum Pernah Dicadangkan ke Google Sheets'
                      : `Cadangan Terakhir ${backupStatus.daysAgo} Hari yang Lalu (> 7 Hari)`}
                  </span>
                </div>

                <p className="text-xs text-amber-950/80 max-w-3xl leading-relaxed">
                  Pencadangan database anggota ke <strong>Google Sheets resmi</strong>{' '}
                  {backupStatus.daysAgo === null ? (
                    <span>belum pernah dilakukan sejak sistem dijalankan.</span>
                  ) : (
                    <span>
                      terakhir dilakukan pada <strong>{backupStatus.formattedDate}</strong> ({backupStatus.relativeText}).
                    </span>
                  )}{' '}
                  Lakukan ekspor berkala minimal setiap 7 hari sekali untuk menjaga keamanan data arsip dan sinkronisasi laporan pengurus.
                </p>
              </div>
            </div>

            {/* Quick Actions & Dismiss Button */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {onOpenGoogleWorkspace && (
                <button
                  type="button"
                  onClick={() => onOpenGoogleWorkspace('sheets')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold shadow-sm hover:shadow transition-all group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                  <span>Cadangkan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}

              {onOpenGoogleWorkspace && (
                <button
                  type="button"
                  onClick={() => onOpenGoogleWorkspace('drive')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 text-xs font-semibold shadow-xs transition-colors"
                  title="Lihat Folder Google Drive"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                  <span>Folder Drive</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismissBackupBanner}
                className="p-2 rounded-xl text-amber-700 hover:text-amber-900 hover:bg-amber-200/60 transition-colors"
                title="Tutup sementara pemberitahuan ini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION: RINGKASAN STATISTIK & TINGKAT KEPENGURUSAN */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Section Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider uppercase font-trajan">
                <BarChart3 className="w-3.5 h-3.5" /> Ringkasan Statistik
              </span>
              <span className="text-emerald-300 text-xs font-medium">• Portal Pengurus IPNU</span>
            </div>
            <h2 className="text-base sm:text-lg font-black font-trajan tracking-wide text-white">
              TOTAL ANGGOTA & SEBARAN TINGKAT KEPENGURUSAN
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Ringkasan komprehensif data kader IPNU terdaftar serta sebaran anggota di setiap tingkatan organisasi (Ranting, Komisariat, Anak Cabang, hingga Cabang dan Pusat).
            </p>
          </div>

          {/* Quick Active Filter Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {selectedOrgLevel !== 'Semua' && (
              <button
                type="button"
                onClick={() => setSelectedOrgLevel('Semua')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all shadow-sm"
              >
                <span>Filter: {selectedOrgLevel}</span>
                <span className="px-1.5 py-0.2 bg-amber-950/20 rounded text-[10px]">&times; Hapus</span>
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-medium text-emerald-200">
              Total Database: <strong className="text-white font-mono text-sm ml-1">{totalCount}</strong> Anggota
            </div>
          </div>
        </div>

        {/* Primary Metrics Row (Total, Menunggu, Terverifikasi, Ditolak, Kader Formal) */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {/* Grand Total Card */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-4 text-white shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold mb-1">
                <span>Total Anggota</span>
                <Users className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-3xl font-black tracking-tight font-mono">{totalCount}</div>
              <div className="flex items-center justify-between text-[11px] text-emerald-100/90 mt-2 pt-2 border-t border-emerald-700/60">
                <span>Terdaftar Sistem</span>
                <span className="font-mono font-bold text-amber-300">
                  {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}% Sah
                </span>
              </div>
            </div>

            {/* Menunggu Verifikasi */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Menunggu Verifikasi' ? 'Semua' : 'Menunggu Verifikasi')}
              className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedStatus === 'Menunggu Verifikasi'
                  ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                  : 'bg-white border-amber-200/80 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
                <span>Menunggu</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono">{pendingCount}</div>
              <div className="text-[11px] text-amber-700/80 mt-1 flex items-center justify-between">
                <span>Perlu verifikasi</span>
                <span className="font-mono font-semibold">
                  {totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Terverifikasi */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Terverifikasi' ? 'Semua' : 'Terverifikasi')}
              className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedStatus === 'Terverifikasi'
                  ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300 shadow-sm'
                  : 'bg-white border-emerald-200/80 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
                <span>Terverifikasi</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">{approvedCount}</div>
              <div className="text-[11px] text-emerald-700/80 mt-1 flex items-center justify-between">
                <span>KTA & CV Siap</span>
                <span className="font-mono font-semibold">
                  {totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Ditolak */}
            <div 
              onClick={() => setSelectedStatus(selectedStatus === 'Ditolak' ? 'Semua' : 'Ditolak')}
              className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedStatus === 'Ditolak'
                  ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300 shadow-sm'
                  : 'bg-white border-rose-200/80 hover:bg-rose-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
                <span>Ditolak</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 font-mono">{rejectedCount}</div>
              <div className="text-[11px] text-rose-700/80 mt-1 flex items-center justify-between">
                <span>Perlu perbaikan</span>
                <span className="font-mono font-semibold">
                  {totalCount > 0 ? Math.round((rejectedCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Kader Formal */}
            <div 
              onClick={() => setSelectedKaderisasi(selectedKaderisasi === 'MAKESTA' ? 'Semua' : 'MAKESTA')}
              className={`col-span-2 sm:col-span-1 rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedKaderisasi !== 'Semua'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-slate-600 text-xs font-semibold mb-1">
                <span>Kader Formal</span>
                <Award className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{formalCount}</div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Makesta/Lakmud</span>
                <span className="font-mono font-semibold text-emerald-800">
                  {totalCount > 0 ? Math.round((formalCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Management Level Breakdown Section */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Jumlah Anggota per Tingkat Kepengurusan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur organisasi IPNU dari basis Ranting desa, Komisariat sekolah/kampus, hingga Anak Cabang, Cabang, Wilayah, dan Pusat. Klik kartu tingkat kepengurusan untuk memfilter data anggota.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {selectedOrgLevel !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => setSelectedOrgLevel('Semua')}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                >
                  Tampilkan Semua ({totalCount})
                </button>
              )}
            </div>
          </div>

          {/* Grid of Organizational Level Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {orgLevelStats.map((tier) => {
              const isSelected = selectedOrgLevel === tier.code;
              return (
                <div
                  key={tier.code}
                  onClick={() => setSelectedOrgLevel(isSelected ? 'Semua' : tier.code)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-md ${
                    isSelected
                      ? `${tier.activeClass} shadow-xs`
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60'
                  }`}
                >
                  {/* Tier Code Badge & Territory Scope */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`px-2 py-0.5 rounded-lg border text-xs font-black tracking-wide ${tier.badgeClass}`}>
                      {tier.shortLabel}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[110px]" title={tier.scope}>
                      {tier.scope}
                    </span>
                  </div>

                  {/* Level Name */}
                  <h4 
                    className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition-colors" 
                    title={tier.name}
                  >
                    {tier.name}
                  </h4>

                  {/* Count & Percentage */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      {tier.count}
                      <span className="text-xs font-normal text-slate-500 ml-1">Kader</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-800">
                      {tier.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(tier.count > 0 ? Number(tier.percentage) : 0, tier.count > 0 ? 6 : 0)}%`,
                        backgroundColor: tier.accentColor
                      }}
                    />
                  </div>

                  {/* Footer details */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span>Sah: {tier.approvedTierCount}</span>
                    <span className={`font-semibold flex items-center gap-0.5 ${isSelected ? 'text-emerald-800 font-bold' : 'text-slate-400 group-hover:text-emerald-700'}`}>
                      {isSelected ? '✓ Aktif' : 'Pilih →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONTROL BAR: SEARCH, FILTERS, GOOGLE BACKUP & EXPORT */}
      {/* ======================================================== */}
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
              placeholder="Cari berdasarkan NIK 16 digit, Nama Lengkap, WA, atau Kepengurusan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: Google Workspace, Export, Refresh, Reset */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onOpenGoogleWorkspace && (
              <button
                type="button"
                onClick={() => onOpenGoogleWorkspace('sheets')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${
                  backupStatus.isOverdue
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
                title="Integrasi Google Drive & Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Sheets</span>
                {backupStatus.isOverdue ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" title="Perlu cadangan (> 7 hari)" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Cadangan mutakhir" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel / PDF</span>
            </button>

            <button
              type="button"
              onClick={fetchMembers}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Reset ke Data Simulasi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Status:</span>
            {['Semua', 'Menunggu Verifikasi', 'Terverifikasi', 'Ditolak'].map((status) => (
              <button
                key={status}
                type="button"
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Tingkat Kepengurusan Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Tingkat:</span>
              <select
                value={selectedOrgLevel}
                onChange={(e) => setSelectedOrgLevel(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-emerald-500"
              >
                <option value="Semua">Semua Tingkat</option>
                {ORG_LEVELS_DEFINITION.map((tier) => (
                  <option key={tier.code} value={tier.code}>
                    {tier.shortLabel} - {tier.scope}
                  </option>
                ))}
              </select>
            </div>

            {/* Kaderisasi Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Kaderisasi:</span>
              <select
                value={selectedKaderisasi}
                onChange={(e) => setSelectedKaderisasi(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-emerald-500"
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
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT: MEMBERS TABLE & DIRECTORY */}
      {/* ======================================================== */}
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
              {searchQuery || selectedStatus !== 'Semua' || selectedKaderisasi !== 'Semua' || selectedOrgLevel !== 'Semua'
                ? 'Tidak ada data yang cocok dengan kriteria pencarian dan filter yang dipilih.'
                : 'Belum ada pendaftaran anggota yang tersimpan.'}
            </p>
            {(selectedStatus !== 'Semua' || selectedKaderisasi !== 'Semua' || selectedOrgLevel !== 'Semua' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('Semua');
                  setSelectedKaderisasi('Semua');
                  setSelectedOrgLevel('Semua');
                  setSearchQuery('');
                }}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Anggota, Jabatan & Tingkat</th>
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
                    const memberOrgLevel = resolveMemberOrgLevel(m);
                    const orgMeta = getOrgLevelMeta(memberOrgLevel);

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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm uppercase">
                                  {m.nama_lengkap}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${orgMeta.badgeClass}`}>
                                  {memberOrgLevel}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                                {m.jabatan ? `${m.jabatan} • ` : ''}{m.asal_kepengurusan || 'PAC IPNU'}
                              </div>
                              <div className="text-slate-400 text-[10px]">
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
                              type="button"
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
                              type="button"
                              onClick={() => setSelectedMember(m)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                              title="Lihat Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>

                            <button
                              type="button"
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
              {filteredMembers.map((m) => {
                const memberOrgLevel = resolveMemberOrgLevel(m);
                const orgMeta = getOrgLevelMeta(memberOrgLevel);

                return (
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
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${orgMeta.badgeClass}`}>
                            {memberOrgLevel}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm uppercase mt-0.5 truncate">
                          {m.nama_lengkap}
                        </h4>
                        <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                          {m.jabatan ? `${m.jabatan} • ` : ''}{m.asal_kepengurusan || 'PAC IPNU'}
                        </div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">
                          NIK: {m.nik}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        WA: <strong>{m.no_hp_wa}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCv) onOpenCv(m);
                            else setCvMember(m);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-amber-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> CV
                        </button>

                        <button
                          type="button"
                          onClick={() => setKtaMember(m)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> KTA
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedMember(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdateStatus={handleStatusUpdate}
          onOpenKta={(m) => setKtaMember(m)}
          onOpenCv={(m) => {
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
          members={members}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
};
