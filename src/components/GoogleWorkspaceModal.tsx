import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  googleSignOut, 
  getAccessToken, 
  getCurrentUser, 
  initAuth 
} from '../lib/googleAuth';
import { syncMembersToGoogleSheet, SheetSyncResult } from '../lib/googleSheets';
import { 
  getOrCreateIpnuFolder, 
  listIpnuDriveFiles, 
  backupDatabaseToDrive, 
  deleteDriveFile,
  DriveItem 
} from '../lib/googleDrive';
import { AnggotaFull } from '../types';
import { 
  X, 
  FileSpreadsheet, 
  HardDrive, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  Download, 
  FolderOpen, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleWorkspaceModalProps {
  members: AnggotaFull[];
  onClose: () => void;
  defaultTab?: 'sheets' | 'drive';
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  members,
  onClose,
  defaultTab = 'sheets'
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive'>(defaultTab);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Sheets state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SheetSyncResult | null>(() => {
    try {
      const saved = localStorage.getItem('ipnu_last_sheets_sync');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation dialog state (mandatory for mutating/destructive operations)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Lanjutkan',
    isDestructive: false,
    onConfirm: () => {}
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(Boolean(token));
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    // Check token immediately
    getAccessToken().then(tok => {
      setHasToken(Boolean(tok));
      if (tok) {
        loadDriveFiles();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setHasToken(true);
        loadDriveFiles();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err?.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setHasToken(false);
    setDriveFiles([]);
  };

  const executeSyncToSheets = async () => {
    setIsSyncingSheets(true);
    setErrorMsg(null);
    try {
      const res = await syncMembersToGoogleSheet(members);
      setLastSyncResult(res);
      localStorage.setItem('ipnu_last_sheets_sync', JSON.stringify(res));
      loadDriveFiles();
    } catch (err: any) {
      console.error('Sync Sheets Error:', err);
      setErrorMsg(err?.message || 'Gagal menyinkronkan data ke Google Sheets.');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!hasToken) {
      await handleLogin();
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Sinkronisasi ke Google Sheets',
      description: `Apakah Anda ingin membuat / memperbarui spreadsheet Google berjudul "Database Anggota IPNU - ${new Date().getFullYear()}" berisi ${members.length} data anggota lengkap di Google Drive Anda?`,
      confirmLabel: 'Ya, Sinkronkan ke Sheets',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await executeSyncToSheets();
      }
    });
  };

  const loadDriveFiles = async () => {
    setIsLoadingDrive(true);
    try {
      const fId = await getOrCreateIpnuFolder();
      setFolderId(fId);
      const files = await listIpnuDriveFiles();
      setDriveFiles(files);
    } catch (e) {
      console.warn('Load Drive files failed:', e);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const executeBackupToDrive = async () => {
    setIsBackingUp(true);
    setErrorMsg(null);
    setBackupSuccess(null);
    try {
      const res = await backupDatabaseToDrive(members);
      setBackupSuccess(`Pencadangan berhasil disimpan di folder Google Drive "Arsip Digital IPNU" (ID: ${res.id.slice(0, 8)}...)`);
      loadDriveFiles();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mencadangkan ke Google Drive.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!hasToken) {
      await handleLogin();
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    setConfirmDialog({
      isOpen: true,
      title: 'Cadangkan Database ke Google Drive',
      description: `Aplikasi akan membuat berkas arsip "Backup_Database_IPNU_${timestamp}.json" berisi seluruh rekaman ${members.length} anggota dan menyimpannya di Google Drive Anda pada folder "Arsip Digital IPNU". Lanjutkan?`,
      confirmLabel: 'Ya, Simpan Cadangan',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await executeBackupToDrive();
      }
    });
  };

  const handleDeleteFile = (file: DriveItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Berkas dari Google Drive',
      description: `Apakah Anda yakin ingin menghapus berkas "${file.name}" secara permanen dari Google Drive Anda? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Berkas',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await deleteDriveFile(file.id);
          await loadDriveFiles();
        } catch (err: any) {
          setErrorMsg(err?.message || 'Gagal menghapus berkas dari Google Drive.');
        }
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
          
          {/* Header Modal */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white px-6 py-4.5 flex items-center justify-between shrink-0 border-b border-emerald-700/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Integrasi Google Drive & Google Sheets</h3>
                <p className="text-xs text-emerald-200">
                  Penyimpanan cloud resmi & sinkronisasi spreadsheet anggota IPNU
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auth Banner */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {currentUser && hasToken ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{currentUser.displayName || 'Akun Google'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        Terhubung
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                <div className="text-center sm:text-left">
                  <span className="font-bold text-slate-800 block">Hubungkan Akun Google Anda</span>
                  <span className="text-[11px] text-slate-500">
                    Masuk dengan izin resmi Google Workspace untuk membuat spreadsheet dan mengunggah berkas ke Google Drive.
                  </span>
                </div>

                {/* Official Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Controls */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('sheets')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'sheets'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets (Spreadsheet Anggota)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('drive');
                if (hasToken) loadDriveFiles();
              }}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'drive'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <HardDrive className="w-4 h-4 text-amber-500" />
              <span>Google Drive (Folder Arsip & Cadangan)</span>
            </button>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            
            {/* TAB 1: GOOGLE SHEETS */}
            {activeTab === 'sheets' && (
              <div className="space-y-5">
                
                {/* Feature Intro */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-sm flex items-center gap-1.5 text-emerald-900">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Sinkronisasi Database Anggota ke Google Sheets</span>
                    </div>
                    <p className="text-slate-600 max-w-lg">
                      Membuat atau memperbarui dokumen spreadsheet Google resmi berisi <strong>{members.length} anggota</strong> dengan kop tabel warna hijau IPNU, NIK 16 digit terproteksi, riwayat pendidikan, dan kaderisasi formal.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSyncToSheets}
                    disabled={isSyncingSheets}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {isSyncingSheets ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sedang Menyinkronkan...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                        <span>{lastSyncResult ? 'Sinkronkan Ulang ke Sheets' : 'Ekspor ke Google Sheets'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Last Sync Result Card */}
                {lastSyncResult && (
                  <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Spreadsheet Berhasil Disinkronkan
                      </span>

                      <a
                        href={lastSyncResult.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <span>Buka di Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        File Spreadsheet: <strong className="text-slate-800">Database Anggota IPNU - {new Date().getFullYear()}</strong>
                      </p>
                      <p>
                        Total Baris Disinkronkan: <strong>{lastSyncResult.rowCount} Anggota</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        Tersimpan di Google Drive: Folder "Arsip Digital IPNU"
                      </p>
                    </div>
                  </div>
                )}

                {/* Data Preview Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Pratinjau Kolom Google Sheets ({members.length} Anggota)</span>
                    <span className="text-[11px] text-slate-400">15 Kolom Lengkap</span>
                  </div>

                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-emerald-800 text-white font-bold sticky top-0">
                        <tr>
                          <th className="p-2 border-r border-emerald-700">No</th>
                          <th className="p-2 border-r border-emerald-700">NIK (16 Digit)</th>
                          <th className="p-2 border-r border-emerald-700">Nama Lengkap</th>
                          <th className="p-2 border-r border-emerald-700">Jabatan</th>
                          <th className="p-2 border-r border-emerald-700">Kontak WA</th>
                          <th className="p-2 border-r border-emerald-700">Kaderisasi</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.slice(0, 5).map((m, idx) => (
                          <tr key={m.id || idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-mono font-semibold text-emerald-800">{m.nik}</td>
                            <td className="p-2 font-bold uppercase">{m.nama_lengkap}</td>
                            <td className="p-2 font-medium">{m.jabatan || 'ANGGOTA'}</td>
                            <td className="p-2">{m.no_hp_wa}</td>
                            <td className="p-2 text-slate-600">
                              {m.riwayat_kaderisasi?.[0]?.jenjang_formal || '-'}
                            </td>
                            <td className="p-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {m.status_verifikasi}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {members.length > 5 && (
                    <div className="bg-slate-50 p-2 text-center text-[11px] text-slate-400 border-t border-slate-200">
                      ...dan {members.length - 5} anggota lainnya siap disinkronkan ke Google Sheets.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: GOOGLE DRIVE */}
            {activeTab === 'drive' && (
              <div className="space-y-5">
                
                {/* Drive Action Card */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-sm flex items-center gap-1.5 text-amber-900">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      <span>Penyimpanan Google Drive: Folder "Arsip Digital IPNU"</span>
                    </div>
                    <p className="text-slate-600 max-w-lg">
                      Seluruh dokumen CV resmi anggota, spreadsheet database, dan cadangan data JSON tersimpan rapi dan terorganisir dalam satu folder khusus di Google Drive Anda.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleBackupToDrive}
                      disabled={isBackingUp}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isBackingUp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mencadangkan...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Cadangkan Database (.JSON)</span>
                        </>
                      )}
                    </button>

                    {folderId && (
                      <a
                        href={`https://drive.google.com/drive/folders/${folderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>Buka Folder Drive</span>
                      </a>
                    )}
                  </div>
                </div>

                {backupSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{backupSuccess}</span>
                  </div>
                )}

                {/* Files list in Drive */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Berkas di Folder "Arsip Digital IPNU"</span>
                    <button
                      onClick={loadDriveFiles}
                      disabled={isLoadingDrive}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                      <span>Segarkan</span>
                    </button>
                  </div>

                  {isLoadingDrive ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      <span>Memuat daftar berkas dari Google Drive...</span>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">Belum ada berkas di folder Arsip Digital IPNU</p>
                      <p className="text-[11px]">
                        Klik "Ekspor ke Google Sheets" atau "Cadangkan Database" di atas untuk menyimpan file pertama Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                      {driveFiles.map((file) => (
                        <div key={file.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                          <div className="flex items-center gap-3 min-w-0">
                            {file.mimeType.includes('spreadsheet') ? (
                              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : file.mimeType.includes('html') ? (
                              <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                            ) : (
                              <HardDrive className="w-5 h-5 text-slate-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {file.createdTime ? new Date(file.createdTime).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Google Drive File'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                              >
                                <span>Buka</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            
                            <button
                              onClick={() => handleDeleteFile(file)}
                              title="Hapus berkas dari Google Drive"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Terhubung Resmi Melalui Google Workspace API</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Selesai
            </button>
          </div>

        </div>
      </div>

      {/* Explicit User Confirmation Dialog for Mutating & Destructive Workspace Actions */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {confirmDialog.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-800 leading-snug">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => confirmDialog.onConfirm()}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
