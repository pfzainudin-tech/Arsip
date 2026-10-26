import React, { useState, useEffect } from 'react';
import { getSupabaseConfig } from '../lib/supabase';
import { getOrgSettings, subscribeOrgSettings, OrgSettings } from '../lib/orgSettings';
import { AnggotaFull } from '../types';
import { 
  FileText, 
  ShieldCheck, 
  Search, 
  Database, 
  Lock, 
  LogOut, 
  Palette, 
  FileSpreadsheet, 
  LogIn, 
  UserPlus, 
  UserCheck 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'beranda' | 'pendaftaran' | 'profil' | 'admin';
  setActiveTab: (tab: 'beranda' | 'pendaftaran' | 'profil' | 'admin') => void;
  onOpenCheckStatus: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenLayoutSettings: () => void;
  onOpenGoogleWorkspace?: (tab?: 'sheets' | 'drive') => void;
  onOpenLoginModal: () => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (val: boolean) => void;
  currentMember: AnggotaFull | null;
  onLogoutMember: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCheckStatus,
  onOpenSupabaseConfig,
  onOpenLayoutSettings,
  onOpenGoogleWorkspace,
  onOpenLoginModal,
  isAdminUnlocked,
  setIsAdminUnlocked,
  currentMember,
  onLogoutMember
}) => {
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(getOrgSettings());

  useEffect(() => {
    return subscribeOrgSettings((updated) => {
      setOrgSettings(updated);
    });
  }, []);

  const supabaseConfig = getSupabaseConfig();

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    setActiveTab('beranda');
  };

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-700/60 font-trajan">
      
      {/* Top Mini Bar with IPNU Arabic Calligraphy / Tagline */}
      <div className="bg-emerald-950/80 px-4 py-1 border-b border-emerald-800/40 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-amber-400 font-bold tracking-wide hidden sm:inline">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="text-emerald-300 font-bold sm:border-l sm:border-emerald-800 sm:pl-2 font-trajan uppercase tracking-wider">
            MOTTO: BELAJAR, BERJUANG, BERTAQWA
          </span>
        </div>

        {/* Top Tools: Only displayed if Admin is logged in */}
        {isAdminUnlocked ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-trajan uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" />
              <span>AKSES ADMIN AKTIF</span>
            </span>

            <button
              onClick={onOpenLayoutSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/40 transition-colors font-trajan uppercase tracking-wide"
              title="Edit Logo Beranda, KOP CV, dan Layout"
            >
              <Palette className="w-3 h-3 text-amber-300" />
              <span>LOGO & LAYOUT</span>
            </button>

            <button
              onClick={() => onOpenGoogleWorkspace?.('sheets')}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700/60 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50 transition-colors font-trajan uppercase tracking-wide"
              title="Google Drive & Google Sheets"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
              <span>GOOGLE DRIVE & SHEETS</span>
            </button>

            <button
              onClick={onOpenSupabaseConfig}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors font-trajan uppercase tracking-wide ${
                supabaseConfig.isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                  : 'bg-emerald-800/60 text-emerald-300 hover:bg-emerald-800 border border-emerald-700/60'
              }`}
              title="Konfigurasi Supabase"
            >
              <Database className="w-3 h-3" />
              <span>{supabaseConfig.isConfigured ? 'SUPABASE TERHUBUNG' : 'DATABASE LOKAL'}</span>
            </button>
          </div>
        ) : (
          <div className="text-emerald-400 text-[10px] font-semibold hidden sm:block font-trajan uppercase tracking-wider">
            SISTEM INFORMASI & ARSIP DIGITAL TERPADU IPNU
          </div>
        )}
      </div>

      {/* Main Branding Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Logo & Org Title */}
        <div 
          onClick={() => setActiveTab('beranda')}
          className="flex items-center gap-3 cursor-pointer group text-left"
        >
          {/* IPNU Emblem Badge / Custom Logo */}
          <div className="relative w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center border-2 border-amber-400 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              src={orgSettings.logoUrl}
              alt="Logo IPNU"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              {/* Span berada di sebelah kiri dengan font Trajan Pro dan CapsLock */}
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded uppercase font-trajan tracking-wider order-first shrink-0">
                RESMI
              </span>
              <h1 className="font-black text-base sm:text-lg tracking-wider text-white leading-none uppercase font-trajan">
                ARSIP DIGITAL ANGGOTA IPNU
              </h1>
            </div>
            <p className="text-[11px] text-emerald-200 mt-1.5 font-semibold uppercase font-trajan tracking-wider">
              {orgSettings.tingkatKepengurusan} • {orgSettings.namaDaerah}
            </p>
          </div>
        </div>

        {/* Navigation Controls: Clean, public-facing */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center font-trajan">
          
          {/* Ikon Daftar: Pendaftaran Baru */}
          <button
            onClick={() => setActiveTab('pendaftaran')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'pendaftaran'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100'
            }`}
            title="Mulai Pendaftaran Anggota Baru"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>DAFTAR BARU</span>
          </button>

          {/* Ikon Masuk: Masuk ke Profil (Bisa untuk Anggota atau Admin) */}
          {currentMember ? (
            <button
              onClick={() => setActiveTab('profil')}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === 'profil'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title="Buka Profil & Kelola Riwayat"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>PROFIL: {currentMember.nama_lengkap.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === 'profil'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100'
              }`}
              title="Masuk Akun (Anggota Mandiri atau Admin)"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>MASUK PROFIL</span>
            </button>
          )}

          {/* Cek Status NIK Button */}
          <button
            onClick={onOpenCheckStatus}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 transition-colors uppercase tracking-wider"
            title="Cari NIK & Cek Status"
          >
            <Search className="w-3.5 h-3.5 text-emerald-300" />
            <span>CEK NIK</span>
          </button>

          {/* If Admin is logged in, show Admin Dashboard button & Logout Admin */}
          {isAdminUnlocked && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-emerald-700/60">
              <button
                onClick={() => setActiveTab('admin')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
                title="Buka Dashboard Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DASHBOARD ADMIN</span>
              </button>

              <button
                onClick={handleAdminLock}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                title="Kunci / Keluar Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
