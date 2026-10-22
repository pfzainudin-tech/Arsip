import React from 'react';
import { AnggotaFull } from '../../types';
import { X, FileSpreadsheet, Printer, Download, HardDrive, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  members: AnggotaFull[];
  onClose: () => void;
  onOpenGoogleWorkspace?: (tab?: 'sheets' | 'drive') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ members, onClose, onOpenGoogleWorkspace }) => {
  const exportToExcel = () => {
    // Build CSV with UTF-8 BOM so Excel opens with correct encoding and columns
    const headers = [
      'No',
      'NIK',
      'Nama Lengkap',
      'Status Verifikasi',
      'Tempat Lahir',
      'Tanggal Lahir',
      'No WhatsApp',
      'Email',
      'Alamat Lengkap',
      'Pendidikan Terakhir',
      'Kaderisasi Formal Terakhir',
      'Kaderisasi Non-Formal',
      'Tanggal Terdaftar',
      'Catatan Verifikasi'
    ];

    const rows = members.map((m, idx) => {
      const lastPendidikan = m.riwayat_pendidikan && m.riwayat_pendidikan.length > 0
        ? `${m.riwayat_pendidikan[m.riwayat_pendidikan.length - 1].jenjang} - ${m.riwayat_pendidikan[m.riwayat_pendidikan.length - 1].nama_sekolah}`
        : '-';

      const formalKad = m.riwayat_kaderisasi
        ?.filter((k) => k.kategori === 'Formal')
        ?.map((k) => `${k.jenjang_formal} (${k.tahun})`)
        ?.join('; ') || '-';

      const nonFormalKad = m.riwayat_kaderisasi
        ?.filter((k) => k.kategori === 'Non-Formal')
        ?.map((k) => `${k.nama_kaderisasi_nonformal} (${k.tahun})`)
        ?.join('; ') || '-';

      return [
        idx + 1,
        `="${m.nik}"`, // format as text so Excel doesn't truncate leading zeroes
        `"${m.nama_lengkap.replace(/"/g, '""')}"`,
        `"${m.status_verifikasi}"`,
        `"${m.tempat_lahir}"`,
        `"${m.tanggal_lahir}"`,
        `="${m.no_hp_wa}"`,
        `"${m.email}"`,
        `"${m.alamat_lengkap.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${lastPendidikan.replace(/"/g, '""')}"`,
        `"${formalKad.replace(/"/g, '""')}"`,
        `"${nonFormalKad.replace(/"/g, '""')}"`,
        `"${new Date(m.created_at || Date.now()).toLocaleDateString('id-ID')}"`,
        `"${(m.catatan_verifikasi || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Database_Arsip_Anggota_IPNU_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Ekspor Data Arsip Anggota</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-600">
            Pilih format ekspor data untuk mengunduh atau menyinkronkan rekapitulasi data anggota (Total: <strong>{members.length} anggota</strong>):
          </p>

          <div className="space-y-3">
            {/* Option 1: Google Sheets */}
            {onOpenGoogleWorkspace && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGoogleWorkspace('sheets');
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-emerald-600/40 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-50 transition-all flex items-start gap-4 group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      Sinkronkan ke Google Sheets
                    </h4>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.2 rounded-full">
                      Resmi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buat spreadsheet Google otomatis di cloud dengan format tabel hijau IPNU, tersimpan di folder Google Drive Anda.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 mt-2">
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Menu Google Sheets &rarr;
                  </span>
                </div>
              </button>
            )}

            {/* Option 2: Excel CSV */}
            <button
              onClick={exportToExcel}
              className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50 transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Unduh Microsoft Excel (.CSV)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh langsung berkas offline spreadsheet lengkap dengan NIK 16 digit terproteksi dan riwayat pendidikan & kaderisasi.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 mt-2">
                  <Download className="w-3.5 h-3.5" /> Unduh Berkas CSV Sekarang
                </span>
              </div>
            </button>

            {/* Option 3: Google Drive Backup */}
            {onOpenGoogleWorkspace && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGoogleWorkspace('drive');
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-amber-500/30 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Cadangkan Database ke Google Drive (.JSON)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Amankan seluruh rekaman basis data anggota ke folder "Arsip Digital IPNU" di Google Drive pribadi Anda.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 mt-2">
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Folder Google Drive &rarr;
                  </span>
                </div>
              </button>
            )}

            {/* Option 4: Print / PDF Roster */}
            <button
              onClick={handlePrintRoster}
              className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Cetak / Simpan ke Dokumen PDF
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mencetak daftar rekapitulasi anggota lengkap dengan kop surat resmi IPNU untuk laporan pertanggungjawaban (LPJ).
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 mt-2">
                  <Printer className="w-3.5 h-3.5" /> Buka Dialog Cetak / PDF
                </span>
              </div>
            </button>
          </div>
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
