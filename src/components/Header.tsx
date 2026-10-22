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
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-700/60">
      
      {/* Top Mini Bar with IPNU Arabic Calligraphy / Tagline */}
      <div className="bg-emerald-950/80 px-4 py-1 border-b border-emerald-800/40 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-amber-400 font-bold tracking-wide hidden sm:inline">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="text-emerald-300 font-semibold sm:border-l sm:border-emerald-800 sm:pl-2">
            Motto: Belajar, Berjuang, Bertaqwa
          </span>
        </div>

        {/* Top Tools: Only displayed if Admin is logged in */}
        {isAdminUnlocked ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Akses Admin Aktif</span>
            </span>

            <button
              onClick={onOpenLayoutSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/40 transition-colors"
              title="Edit Logo Beranda, KOP CV, dan Layout"
            >
              <Palette className="w-3 h-3 text-amber-300" />
              <span>Logo & Layout</span>
            </button>

            <button
              onClick={() => onOpenGoogleWorkspace?.('sheets')}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700/60 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50 transition-colors"
              title="Google Drive & Google Sheets"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
              <span>Google Drive & Sheets</span>
            </button>

            <button
              onClick={onOpenSupabaseConfig}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                supabaseConfig.isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                  : 'bg-emerald-800/60 text-emerald-300 hover:bg-emerald-800 border border-emerald-700/60'
              }`}
              title="Konfigurasi Supabase"
            >
              <Database className="w-3 h-3" />
              <span>{supabaseConfig.isConfigured ? 'Supabase Terhubung' : 'Database Lokal'}</span>
            </button>
          </div>
        ) : (
          <div className="text-emerald-400 text-[10px] font-medium hidden sm:block">
            Sistem Informasi & Arsip Digital Terpadu IPNU
          </div>
        )}
      </div>

      {/* Main Branding Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Logo & Org Title */}
        <div 
          onClick={() => setActiveTab('beranda')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* IPNU Emblem Badge / Custom Logo */}
          <div className="relative w-12 h-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center border-2 border-amber-400 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              src={orgSettings.logoUrl}
              alt="Logo IPNU"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                ARSIP DIGITAL ANGGOTA IPNU
              </h1>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 mt-1 font-medium">
              {orgSettings.tingkatKepengurusan} • {orgSettings.namaDaerah}
            </p>
          </div>
        </div>

        {/* Navigation Controls: Clean, public-facing */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
          
          {/* Ikon Daftar: Pendaftaran Baru */}
          <button
            onClick={() => setActiveTab('pendaftaran')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pendaftaran'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100'
            }`}
            title="Mulai Pendaftaran Anggota Baru"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>

          {/* Ikon Masuk: Masuk ke Profil (Bisa untuk Anggota atau Admin) */}
          {currentMember ? (
            <button
              onClick={() => setActiveTab('profil')}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profil'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title="Buka Profil & Kelola Riwayat"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Profil: {currentMember.nama_lengkap.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profil'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100'
              }`}
              title="Masuk Akun (Anggota Mandiri atau Admin)"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Masuk Profil</span>
            </button>
          )}

          {/* Cek Status NIK Button */}
          <button
            onClick={onOpenCheckStatus}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 transition-colors"
            title="Cari NIK & Cek Status"
          >
            <Search className="w-3.5 h-3.5 text-emerald-300" />
            <span>Cek NIK</span>
          </button>

          {/* If Admin is logged in, show Admin Dashboard button & Logout Admin */}
          {isAdminUnlocked && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-emerald-700/60">
              <button
                onClick={() => setActiveTab('admin')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-amber-950 shadow-sm'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                }`}
                title="Buka Dashboard Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dashboard Admin</span>
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
