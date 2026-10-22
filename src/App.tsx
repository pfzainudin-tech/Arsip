/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RegistrationWizard } from './components/RegistrationForm/RegistrationWizard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { CheckStatusModal } from './components/CheckStatusModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { KtaPrintModal } from './components/Admin/KtaPrintModal';
import { CvPrintModal } from './components/CvPrintModal';
import { LayoutSettingsModal } from './components/LayoutSettingsModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { MemberProfileView } from './components/MemberProfile/MemberProfileView';
import { MemberLoginModal } from './components/MemberProfile/MemberLoginModal';
import { getOrgSettings, subscribeOrgSettings, OrgSettings } from './lib/orgSettings';
import { getAllAnggota } from './lib/db';
import { AnggotaFull } from './types';
import { 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Lock, 
  Star,
  Palette,
  FileSpreadsheet,
  UserPlus,
  LogIn,
  UserCheck,
  ArrowRight,
  FileText,
  Key
} from 'lucide-react';

const SESSION_MEMBER_KEY = 'ipnu_active_member_session_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'beranda' | 'pendaftaran' | 'profil' | 'admin'>('beranda');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(getOrgSettings());
  const [allMembers, setAllMembers] = useState<AnggotaFull[]>([]);
  
  // Member authentication session
  const [currentMember, setCurrentMember] = useState<AnggotaFull | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_MEMBER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckStatus, setShowCheckStatus] = useState(false);
  const [checkStatusNik, setCheckStatusNik] = useState('');
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);
  const [showGoogleWorkspace, setShowGoogleWorkspace] = useState(false);
  const [googleWorkspaceTab, setGoogleWorkspaceTab] = useState<'sheets' | 'drive'>('sheets');
  const [activeKtaMember, setActiveKtaMember] = useState<AnggotaFull | null>(null);
  const [activeCvMember, setActiveCvMember] = useState<AnggotaFull | null>(null);

  const loadAllMembers = async () => {
    try {
      const data = await getAllAnggota();
      setAllMembers(data);
      // If currentMember is logged in, refresh their data
      if (currentMember) {
        const found = data.find(m => m.id === currentMember.id);
        if (found) {
          setCurrentMember(found);
          localStorage.setItem(SESSION_MEMBER_KEY, JSON.stringify(found));
        }
      }
    } catch (e) {
      console.warn('Failed to load members:', e);
    }
  };

  useEffect(() => {
    loadAllMembers();
    return subscribeOrgSettings((updated) => {
      setOrgSettings(updated);
    });
  }, []);

  const handleMemberLoginSuccess = (member: AnggotaFull) => {
    setCurrentMember(member);
    localStorage.setItem(SESSION_MEMBER_KEY, JSON.stringify(member));
    setActiveTab('profil');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminUnlocked(true);
    setActiveTab('admin');
  };

  const handleMemberLogout = () => {
    setCurrentMember(null);
    localStorage.removeItem(SESSION_MEMBER_KEY);
    setActiveTab('beranda');
  };

  const handleMemberUpdate = (updated: AnggotaFull) => {
    setCurrentMember(updated);
    localStorage.setItem(SESSION_MEMBER_KEY, JSON.stringify(updated));
    loadAllMembers();
  };

  const handleOpenCheckStatus = (nik: string = '') => {
    setCheckStatusNik(nik);
    setShowCheckStatus(true);
  };

  const handleOpenGoogleWorkspace = (tab: 'sheets' | 'drive' = 'sheets') => {
    loadAllMembers();
    setGoogleWorkspaceTab(tab);
    setShowGoogleWorkspace(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCheckStatus={() => handleOpenCheckStatus('')}
        onOpenSupabaseConfig={() => setShowSupabaseConfig(true)}
        onOpenLayoutSettings={() => setShowLayoutSettings(true)}
        onOpenGoogleWorkspace={handleOpenGoogleWorkspace}
        onOpenLoginModal={() => setShowLoginModal(true)}
        isAdminUnlocked={isAdminUnlocked}
        setIsAdminUnlocked={setIsAdminUnlocked}
        currentMember={currentMember}
        onLogoutMember={handleMemberLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        
        {/* ================= TAB 1: BERANDA / PORTAL UTAMA (BERSIH DARI FITUR ADMIN) ================= */}
        {activeTab === 'beranda' && (
          <div className="space-y-8">
            
            {/* Hero Card Banner */}
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden print:hidden border border-emerald-700/50">
              
              {/* Background ambient accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-amber-300 font-bold text-xs border border-amber-400/30 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>Sistem Arsip & Portal Anggota Mandiri</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    Arsip Digital & Pendaftaran Anggota IPNU
                  </h1>

                  <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                    Layanan resmi {orgSettings.tingkatKepengurusan} {orgSettings.namaOrganisasi} {orgSettings.namaDaerah}. Daftarkan diri Anda secara mandiri, dapatkan password akses otomatis, dan kelola riwayat organisasi, pendidikan, serta kaderisasi untuk mencetak Curriculum Vitae (CV) resmi.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Upload Foto KTP & Verifikasi NIK</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Otomatis Jadi Format CV Resmi IPNU</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Login Mandiri Anggota & Update Riwayat</span>
                    </div>
                  </div>
                </div>

                {/* Hero Badge Logo Frame (Clean display, no admin triggers) */}
                <div className="hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center overflow-hidden border-2 border-amber-400">
                    <img
                      src={orgSettings.logoUrl}
                      alt="Logo IPNU"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-amber-300 font-semibold mt-2">
                    IPNU Mandiri
                  </span>
                </div>

              </div>
            </div>

            {/* Dua Pintu Utama: Masuk Profil vs Daftar Baru */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Masuk Profil Anggota & Admin */}
              <div className="bg-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-500/50 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <LogIn className="w-7 h-7 text-emerald-800" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Sudah Terdaftar
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-2">
                      Masuk ke Profil Akun
                    </h2>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Akses profil Anda dengan <strong>Nama Lengkap</strong> dan <strong>Password Otomatis</strong> yang diberikan saat pendaftaran. Anda dapat menambah atau mengupdate riwayat organisasi, pendidikan, dan kaderisasi serta mencetak CV.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Menggunakan password otomatis yang dibuatkan sistem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Tambah / perbarui riwayat kapan pun</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {currentMember ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('profil')}
                      className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-amber-300" />
                      <span>Buka Profil ({currentMember.nama_lengkap.split(' ')[0]})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                      className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-amber-300" />
                      <span>Klik untuk Masuk Profil</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Daftar Anggota Baru */}
              <div className="bg-white rounded-3xl border-2 border-amber-200 hover:border-amber-400 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <UserPlus className="w-7 h-7 text-amber-900" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Pendaftaran Anggota Baru
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-2">
                      Daftar Anggota Baru (Mandiri)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Pendaftaran dimulai ketika Anda menekan tombol di bawah ini. Isi data diri, <strong>upload foto KTP</strong>, riwayat pendidikan, riwayat organisasi, kaderisasi MAKESTA/LAKMUD, pas foto, dan tanda tangan digital.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Sistem akan langsung membuatkan Password Akses Otomatis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Data langsung tersusun rapi menjadi CV resmi IPNU</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pendaftaran')}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-amber-950" />
                    <span>Mulai Pendaftaran Baru Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Baris Bawah: Cek NIK Cepat */}
            <div className="bg-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow-xs">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                    Pencarian Cepat Berdasarkan NIK 16 Digit
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cek apakah NIK Anda sudah terdaftar atau cetak KTA tanpa perlu login
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenCheckStatus('')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 border border-slate-300 font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                <span>Periksa NIK Saya</span>
              </button>
            </div>

          </div>
        )}

        {/* ================= TAB 2: PENDAFTARAN MANDIRI ================= */}
        {activeTab === 'pendaftaran' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('beranda')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  ← Kembali ke Beranda
                </button>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-emerald-900">
                  Formulir Pendaftaran Anggota Baru IPNU
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Sudah punya akun? Masuk
              </button>
            </div>

            <RegistrationWizard 
              onCheckStatus={handleOpenCheckStatus} 
              onOpenCv={(m) => setActiveCvMember(m)}
              onOpenProfile={(m) => handleMemberLoginSuccess(m)}
            />
          </div>
        )}

        {/* ================= TAB 3: PROFIL ANGGOTA MANDIRI ================= */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            {currentMember ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('beranda')}
                    className="text-xs text-slate-500 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    ← Kembali ke Beranda
                  </button>
                </div>

                <MemberProfileView
                  member={currentMember}
                  onUpdateMember={handleMemberUpdate}
                  onOpenCv={(m) => setActiveCvMember(m)}
                  onOpenKta={(m) => setActiveKtaMember(m)}
                  onLogout={handleMemberLogout}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <LogIn className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Masuk ke Profil Akun</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Silakan masuk menggunakan <strong>Nama Lengkap</strong> dan <strong>Password Otomatis</strong> yang diberikan saat pendaftaran, atau masuk sebagai Admin.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                  >
                    Buka Form Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pendaftaran')}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                  >
                    Belum Terdaftar? Daftar Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: ADMIN (HANYA DIAKSES SETELAH LOGIN ADMIN) ================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {isAdminUnlocked ? (
              <>
                {/* Admin Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-black text-slate-800">
                          Portal Verifikasi & Arsip Pengurus IPNU
                        </h2>
                        <p className="text-xs text-slate-500">
                          {orgSettings.tingkatKepengurusan} • {orgSettings.namaDaerah} (Hak Akses Admin Penuh)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleWorkspace('sheets')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Google Drive & Sheets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLayoutSettings(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors shadow-xs"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Logo & Layout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSupabaseConfig(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <span>Skema Supabase</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('beranda')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                    >
                      <span>Portal Publik</span>
                    </button>
                  </div>
                </div>

                {/* Admin Dashboard: Member Directory, Verification, Export */}
                <AdminDashboard 
                  onOpenCv={(m) => setActiveCvMember(m)} 
                  onOpenGoogleWorkspace={handleOpenGoogleWorkspace}
                />
              </>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Akses Admin Terkunci</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Akses khusus pengurus hanya dapat dibuka oleh admin berwenang melalui verifikasi akun di form login.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  Buka Form Masuk Admin
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenSupabaseConfig={() => setShowSupabaseConfig(true)}
        onOpenCheckStatus={() => handleOpenCheckStatus('')}
      />

      {/* Member / Admin Login Modal */}
      <MemberLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleMemberLoginSuccess}
        onLoginAdmin={handleAdminLoginSuccess}
        onSwitchToRegister={() => setActiveTab('pendaftaran')}
      />

      {/* Modals */}
      {showCheckStatus && (
        <CheckStatusModal
          initialNik={checkStatusNik}
          onClose={() => setShowCheckStatus(false)}
          onOpenKta={(m) => {
            setShowCheckStatus(false);
            setActiveKtaMember(m);
          }}
          onOpenCv={(m) => {
            setShowCheckStatus(false);
            setActiveCvMember(m);
          }}
          onOpenProfile={(m) => {
            setShowCheckStatus(false);
            handleMemberLoginSuccess(m);
          }}
        />
      )}

      {showSupabaseConfig && (
        <SupabaseConfigModal
          onClose={() => setShowSupabaseConfig(false)}
          onConfigChanged={() => {
            loadAllMembers();
          }}
        />
      )}

      {showLayoutSettings && (
        <LayoutSettingsModal
          onClose={() => setShowLayoutSettings(false)}
          onSaved={() => {
            setOrgSettings(getOrgSettings());
          }}
        />
      )}

      {showGoogleWorkspace && (
        <GoogleWorkspaceModal
          members={allMembers}
          defaultTab={googleWorkspaceTab}
          onClose={() => setShowGoogleWorkspace(false)}
        />
      )}

      {activeKtaMember && (
        <KtaPrintModal
          member={activeKtaMember}
          onClose={() => setActiveKtaMember(null)}
        />
      )}

      {activeCvMember && (
        <CvPrintModal
          member={activeCvMember}
          isAdmin={isAdminUnlocked}
          onClose={() => setActiveCvMember(null)}
        />
      )}

    </div>
  );
}
