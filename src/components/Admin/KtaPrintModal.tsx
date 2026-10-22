import React, { useRef } from 'react';
import { AnggotaFull } from '../../types';
import { X, Printer, Shield, Star, Award, CheckCircle2 } from 'lucide-react';

interface KtaPrintModalProps {
  member: AnggotaFull;
  onClose: () => void;
}

export const KtaPrintModal: React.FC<KtaPrintModalProps> = ({ member, onClose }) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  // Find latest formal kaderisasi
  const formalKad = member.riwayat_kaderisasi
    ?.filter((k) => k.kategori === 'Formal')
    ?.pop();

  const highestKad = formalKad?.jenjang_formal || 'Kader IPNU';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
        
        {/* Header Modal */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Cetak KTA & Lembar Biodata IPNU</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / Save PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-8 bg-slate-100 print:bg-white print:p-0">
          
          {/* 1. KARTU TANDA ANGGOTA (KTA) - DUA SISI */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider print:hidden">
              <span>Kartu Tanda Anggota (KTA Digital Standar)</span>
              <span>Ukuran Standar ID Card (CR-80)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
              
              {/* SISI DEPAN (FRONT) */}
              <div className="w-full max-w-[370px] mx-auto h-[225px] rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-3.5 shadow-lg relative overflow-hidden flex flex-col justify-between border-2 border-amber-400/40 print:shadow-none print:border-emerald-800">
                {/* Background stars watermark */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute top-2 right-3 text-amber-400/20 text-4xl select-none font-serif">★</div>

                {/* KTA Header */}
                <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white text-emerald-800 font-black text-[10px] flex items-center justify-center shadow-xs">
                      IPNU
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black tracking-tight leading-none text-amber-300">
                        IKATAN PELAJAR NAHDLATUL ULAMA
                      </h4>
                      <p className="text-[8px] text-emerald-200 uppercase tracking-widest mt-0.5">
                        KARTU TANDA ANGGOTA (KTA)
                      </p>
                    </div>
                  </div>
                  <div className="text-[8px] font-mono text-emerald-300 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                    NIA.{member.nik.slice(8)}
                  </div>
                </div>

                {/* KTA Body */}
                <div className="flex items-center gap-3 py-1">
                  <div className="w-16 h-20 rounded-md overflow-hidden border-2 border-amber-400 bg-slate-200 shrink-0 shadow-xs">
                    {member.pas_foto_url ? (
                      <img
                        src={member.pas_foto_url}
                        alt={member.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500">
                        3x4
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-[9px] space-y-0.5">
                    <div className="font-extrabold text-[11px] text-white truncate uppercase tracking-tight">
                      {member.nama_lengkap}
                    </div>
                    <div className="text-emerald-200 flex items-center gap-1 font-mono">
                      <span>NIK: {member.nik}</span>
                    </div>
                    <div className="text-emerald-100 truncate">
                      {member.tempat_lahir}, {member.tanggal_lahir}
                    </div>
                    <div className="text-emerald-200 truncate text-[8px]">
                      {member.alamat_lengkap}
                    </div>
                    <div className="pt-1 flex items-center gap-1">
                      <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                        {highestKad}
                      </span>
                      <span className="text-[8px] text-emerald-300 font-bold">
                        {member.status_verifikasi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KTA Front Footer */}
                <div className="flex items-end justify-between border-t border-emerald-700/60 pt-1 text-[7px] text-emerald-300">
                  <span>Masa Berlaku: Selama Menjadi Anggota Aktif</span>
                  {member.tanda_tangan_url && (
                    <div className="text-right">
                      <img
                        src={member.tanda_tangan_url}
                        alt="TTD"
                        className="h-5 w-14 object-contain inline-block filter brightness-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SISI BELAKANG (BACK) */}
              <div className="w-full max-w-[370px] mx-auto h-[225px] rounded-2xl bg-white text-slate-800 p-4 shadow-lg relative overflow-hidden flex flex-col justify-between border-2 border-emerald-700 print:shadow-none">
                <div className="text-center border-b border-slate-200 pb-1.5">
                  <h5 className="text-[10px] font-black text-emerald-800 tracking-wider">
                    BELAJAR • BERJUANG • BERTAQWA
                  </h5>
                  <p className="text-[8px] text-slate-500 italic">
                    Motto Dasar Pelajar Nahdlatul Ulama
                  </p>
                </div>

                <div className="text-[8px] text-slate-600 space-y-1.5 leading-tight py-1">
                  <p className="font-semibold text-slate-800">Ketentuan Pemegang KTA:</p>
                  <ol className="list-decimal pl-3 space-y-0.5">
                    <li>Kartu ini adalah identitas sah keanggotaan IPNU di seluruh Indonesia.</li>
                    <li>Wajib dibawa saat menghadiri kegiatan resmi organisasi & kaderisasi.</li>
                    <li>Tidak dapat dipindahtangankan kepada orang lain.</li>
                    <li>Jika menemukan kartu ini, harap hubungi sekretariat PAC/PC IPNU terdekat.</li>
                  </ol>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[8px] text-slate-500">
                  <div className="text-left font-mono">
                    <div>PIMPINAN CABANG IPNU</div>
                    <div className="text-[7px]">Sistem Basis Data Digital</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">Pimpinan Pusat IPNU</div>
                    <div className="text-[7px] text-slate-400">Jakarta, Indonesia</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. LEMBAR BIODATA ARSIP RESMI ANGGOTA (A4 FORMAT) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-sm space-y-5 text-slate-800 text-xs print:border-none print:shadow-none print:p-0">
            {/* Kop Surat */}
            <div className="text-center border-b-2 border-double border-slate-800 pb-3">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-emerald-900 uppercase">
                PIMPINAN PUSAT IKATAN PELAJAR NAHDLATUL ULAMA
              </h2>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                LEMBAR BIODATA & ARSIP DIGITAL KEANGGOTAAN RESMI
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Gedung PBNU Lt. 5, Jl. Kramat Raya No. 164 Jakarta Pusat • Basis Data Terpadu
              </p>
            </div>

            {/* Biodata Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="sm:col-span-2 space-y-2">
                <table className="w-full text-left text-xs">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600 w-36">Nama Lengkap</td>
                      <td className="py-1 font-bold text-slate-900 uppercase">: {member.nama_lengkap}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600">NIK (16 Digit)</td>
                      <td className="py-1 font-mono font-bold text-emerald-800">: {member.nik}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600">Tempat, Tanggal Lahir</td>
                      <td className="py-1">: {member.tempat_lahir}, {member.tanggal_lahir}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600">Alamat Lengkap</td>
                      <td className="py-1">: {member.alamat_lengkap}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600">No. WhatsApp</td>
                      <td className="py-1">: {member.no_hp_wa}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 font-semibold text-slate-600">Email</td>
                      <td className="py-1">: {member.email}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-600">Status Verifikasi</td>
                      <td className="py-1 font-bold text-emerald-800">: {member.status_verifikasi}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photo Box */}
              <div className="flex flex-col items-center justify-center p-2 border border-slate-200 rounded-xl bg-slate-50">
                <div className="w-24 h-32 rounded-lg overflow-hidden border border-slate-300 bg-white">
                  {member.pas_foto_url ? (
                    <img src={member.pas_foto_url} alt={member.nama_lengkap} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Pas Foto</div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">Pas Foto 3x4</span>
              </div>
            </div>

            {/* Riwayat Kaderisasi Table */}
            <div>
              <h4 className="font-bold text-xs text-emerald-900 border-b border-emerald-800 pb-1 mb-2">
                I. RIWAYAT KADERISASI IPNU
              </h4>
              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-1.5 border border-slate-200 text-center w-8">No</th>
                    <th className="p-1.5 border border-slate-200">Kategori</th>
                    <th className="p-1.5 border border-slate-200">Nama Kegiatan / Jenjang</th>
                    <th className="p-1.5 border border-slate-200">Penyelenggara</th>
                    <th className="p-1.5 border border-slate-200">Lokasi</th>
                    <th className="p-1.5 border border-slate-200 text-center">Tahun</th>
                  </tr>
                </thead>
                <tbody>
                  {member.riwayat_kaderisasi?.map((k, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-1.5 border border-slate-200 text-center">{i + 1}</td>
                      <td className="p-1.5 border border-slate-200 font-semibold">{k.kategori}</td>
                      <td className="p-1.5 border border-slate-200 font-bold text-emerald-800">
                        {k.kategori === 'Formal' ? k.jenjang_formal : k.nama_kaderisasi_nonformal}
                      </td>
                      <td className="p-1.5 border border-slate-200">{k.penyelenggara}</td>
                      <td className="p-1.5 border border-slate-200">{k.lokasi}</td>
                      <td className="p-1.5 border border-slate-200 text-center">{k.tahun}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan Pengurus & Anggota */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-bold text-slate-800 mt-1">Pimpinan Cabang / Wilayah IPNU</p>
                <div className="h-16 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-[9px] text-emerald-800 font-bold rotate-[-12deg]">
                    CAP RESMI
                  </div>
                </div>
                <p className="font-bold underline text-slate-800">( Pengurus Kaderisasi )</p>
              </div>

              <div>
                <p className="text-slate-500">Pemilik Data Anggota,</p>
                <p className="font-bold text-slate-800 mt-1">Yang Bersangkutan</p>
                <div className="h-16 flex items-center justify-center">
                  {member.tanda_tangan_url ? (
                    <img src={member.tanda_tangan_url} alt="TTD Anggota" className="max-h-14 max-w-[120px] object-contain" />
                  ) : (
                    <div className="text-slate-300 text-xs italic">Tanda tangan</div>
                  )}
                </div>
                <p className="font-bold underline text-slate-800 uppercase">{member.nama_lengkap}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer print bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end gap-2 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang</span>
          </button>
        </div>

      </div>
    </div>
  );
};
