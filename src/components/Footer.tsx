import React from 'react';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenSupabaseConfig: () => void;
  onOpenCheckStatus: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupabaseConfig, onOpenCheckStatus }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Org Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                IPNU
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">
                ARSIP DIGITAL ANGGOTA IPNU
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              Sistem pendataan, pendaftaran mandiri, dan arsip digital kader Ikatan Pelajar Nahdlatul Ulama (IPNU) berbasis web modern, responsif, dan terintegrasi dengan database cloud Supabase.
            </p>
            <div className="inline-flex items-center gap-2 text-amber-400 font-semibold text-[11px] bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <span>★ Belajar • Berjuang • Bertaqwa ★</span>
            </div>
          </div>

          {/* Navigasi Layanan */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Layanan Kader
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#top" className="hover:text-emerald-400 transition-colors">
                  Formulir Pendaftaran Mandiri
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCheckStatus}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Cek Status Verifikasi NIK
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSupabaseConfig}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Status Database Supabase
                </button>
              </li>
            </ul>
          </div>

          {/* Jenjang Kaderisasi Resmi */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Kaderisasi IPNU
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• <strong>MAKESTA</strong> (Masa Kesetiaan Anggota)</li>
              <li>• <strong>LAKMUD</strong> (Latihan Kader Muda)</li>
              <li>• <strong>LAKUT</strong> (Latihan Kader Utama)</li>
              <li>• <strong>LATIN & LAKNAS</strong> (Tingkat Nasional)</li>
              <li>• <strong>CBP</strong> (Corps Brigade Pembangunan)</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} Pimpinan Pusat Ikatan Pelajar Nahdlatul Ulama (IPNU). All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Sesuai PD/PRT IPNU</span>
            <span>•</span>
            <span>Mobile-First & Cloud Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
