import React, { useRef, useState, useEffect } from 'react';
import { AnggotaFull } from '../types';
import { getOrgSettings, subscribeOrgSettings, OrgSettings } from '../lib/orgSettings';
import { LayoutSettingsModal } from './LayoutSettingsModal';
import { 
  X, 
  Printer, 
  Download, 
  Edit3, 
  Palette, 
  Sliders, 
  Check,
  HardDrive,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { uploadCvToDrive } from '../lib/googleDrive';
import { getAccessToken, googleSignIn } from '../lib/googleAuth';

interface CvPrintModalProps {
  member: AnggotaFull;
  onClose: () => void;
  isAdmin?: boolean;
}

export const CvPrintModal: React.FC<CvPrintModalProps> = ({ member, onClose, isAdmin = false }) => {
  const printRef = useRef<HTMLDivElement | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(getOrgSettings());
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  useEffect(() => {
    return subscribeOrgSettings((updated) => {
      setOrgSettings(updated);
    });
  }, []);

  // Formatter for Indonesian date
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Determine Jabatan
  const defaultJabatan = member.jabatan?.trim().toUpperCase() || 
    (member.riwayat_organisasi && member.riwayat_organisasi.length > 0 
      ? member.riwayat_organisasi[member.riwayat_organisasi.length - 1].jabatan.toUpperCase()
      : 'KETUA');

  // Determine Asal Kepengurusan
  const defaultAsal = member.asal_kepengurusan?.trim() || `${orgSettings.tingkatKepengurusan} ${orgSettings.namaDaerah}`;

  // Customizable fields in case member wants to adjust for specific submission
  const [jabatan, setJabatan] = useState(defaultJabatan);
  const [asalKepengurusan, setAsalKepengurusan] = useState(defaultAsal);
  const [titimangsaTempat, setTitimangsaTempat] = useState(member.tempat_lahir || orgSettings.titimangsaKota || 'Mojokerto');
  const [titimangsaTanggal, setTitimangsaTanggal] = useState(() => {
    const today = new Date();
    return `${today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} M`;
  });
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [showDriveConfirm, setShowDriveConfirm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    setUploadError(null);
    let token = await getAccessToken();
    if (!token) {
      try {
        const signResult = await googleSignIn();
        token = signResult?.accessToken || null;
      } catch (err: any) {
        setUploadError(err?.message || 'Gagal masuk akun Google. Pastikan popup izin tidak diblokir.');
        return;
      }
    }
    if (!token) return;

    setShowDriveConfirm(true);
  };

  const executeSaveToDrive = async () => {
    setShowDriveConfirm(false);
    setIsSavingToDrive(true);
    setUploadError(null);
    try {
      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV ${jabatan} - ${member.nama_lengkap}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; margin: 40px auto; max-width: 800px; color: #111; line-height: 1.4; padding: 20px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #005a2b; padding-bottom: 12px; margin-bottom: 20px; }
    h1.title { text-align: center; font-size: 18px; text-decoration: underline; margin: 20px 0 6px; font-weight: bold; }
    h2.subtitle { text-align: center; font-size: 14px; margin-top: 0; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 13px; }
    table.data td { padding: 4px 6px; vertical-align: top; }
    table.bordered { border: 1px solid #333; margin-top: 6px; }
    table.bordered th, table.bordered td { border: 1px solid #333; padding: 6px 8px; font-size: 12px; }
    table.bordered th { background: #f0f0f0; }
    .section-title { font-weight: bold; font-size: 13px; margin: 12px 0 4px; }
    .footer-sign { margin-top: 30px; display: flex; justify-content: flex-end; }
    .sign-box { text-align: center; width: 240px; font-size: 13px; }
  </style>
</head>
<body>
  ${printRef.current?.innerHTML || ''}
</body>
</html>`;

      const result = await uploadCvToDrive(
        { ...member, jabatan, asal_kepengurusan: asalKepengurusan },
        htmlContent
      );
      setDriveLink(result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`);
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal menyimpan berkas ke Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  // Map riwayat pendidikan by level
  const sdPendidikan = member.riwayat_pendidikan?.find(p => p.jenjang === 'SD');
  const smpPendidikan = member.riwayat_pendidikan?.find(p => p.jenjang === 'SMP');
  const smaPendidikan = member.riwayat_pendidikan?.find(p => ['SMA', 'SMK'].includes(p.jenjang));
  const perguruanTinggi = member.riwayat_pendidikan?.filter(p => ['D1', 'D2', 'D3', 'S1', 'S2'].includes(p.jenjang));

  // Formal kaderisasi
  const formalKaderisasi = member.riwayat_kaderisasi?.filter(k => k.kategori === 'Formal') || [];
  const nonFormalKaderisasi = member.riwayat_kaderisasi?.filter(k => k.kategori === 'Non-Formal') || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in">
          
          {/* Top Navigation Bar (Hidden when printing) */}
          <div className="bg-emerald-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden border-b border-emerald-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                CV
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">
                  Curriculum Vitae Resmi IPNU
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Format resmi {orgSettings.tingkatKepengurusan} {orgSettings.namaDaerah}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowLayoutModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/40 text-xs font-semibold transition-colors"
                  title="Khusus Admin: Ganti Logo IPNU dan Layout KOP"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ganti Logo & Layout</span>
                  <span className="sm:hidden">Logo</span>
                </button>
              )}

              <button
                onClick={() => setIsQuickEditing(!isQuickEditing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isQuickEditing ? 'Tutup Edit' : 'Ubah Jabatan/Kota'}</span>
                <span className="sm:hidden">Jabatan</span>
              </button>

              <button
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                title="Simpan dokumen CV ini ke Google Drive Anda"
              >
                {isSavingToDrive ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span className="hidden sm:inline">{isSavingToDrive ? 'Menyimpan...' : 'Simpan ke Drive'}</span>
                <span className="sm:hidden">Drive</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drive Upload Success Banner */}
          {driveLink && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 print:hidden animate-in fade-in shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dokumen CV berhasil disimpan di Google Drive dalam folder <strong>"Arsip Digital IPNU"</strong>!</span>
              </div>
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 hover:underline shrink-0"
              >
                <span>Buka di Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Drive Upload Error Banner */}
          {uploadError && (
            <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800 print:hidden animate-in fade-in shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-800 font-bold">
                Tutup
              </button>
            </div>
          )}

          {/* Quick Toolbar for editing Jabatan / Asal (Hidden on print) */}
          {isQuickEditing && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 shrink-0 print:hidden text-xs animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jabatan CV (Disesuaikan Anggota):
                  </label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value.toUpperCase())}
                    placeholder="KETUA, WAKIL KETUA, SEKRETARIS..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold uppercase focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kop / Asal Kepengurusan:
                  </label>
                  <input
                    type="text"
                    value={asalKepengurusan}
                    onChange={(e) => setAsalKepengurusan(e.target.value.toUpperCase())}
                    placeholder="PAC. IPNU KECAMATAN PACET"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tempat Titimangsa:
                  </label>
                  <input
                    type="text"
                    value={titimangsaTempat}
                    onChange={(e) => setTitimangsaTempat(e.target.value)}
                    placeholder="Mojokerto"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tanggal Titimangsa:
                  </label>
                  <input
                    type="text"
                    value={titimangsaTanggal}
                    onChange={(e) => setTitimangsaTanggal(e.target.value)}
                    placeholder="19 Oktober 2026 M"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Printable CV Document (A4 format style) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 print:bg-white print:p-0 flex justify-center">
            
            {/* A4 Sheet Container */}
            <div 
              ref={printRef}
              className={`w-full max-w-[794px] min-h-[1123px] bg-white p-8 sm:p-12 shadow-md print:shadow-none print:p-8 flex flex-col justify-between text-slate-900 relative ${
                orgSettings.cvFontFamily === 'sans' ? 'font-sans' : 'font-serif'
              }`}
              style={{
                fontFamily: orgSettings.cvFontFamily === 'sans' 
                  ? "'Plus Jakarta Sans', Arial, sans-serif" 
                  : "'Times New Roman', Times, serif"
              }}
            >
              {/* Inner Content */}
              <div className={`${
                orgSettings.cvSpacing === 'compact' ? 'space-y-4' : orgSettings.cvSpacing === 'relaxed' ? 'space-y-7' : 'space-y-6'
              }`}>

                {/* 1. KOP SURAT PAC IPNU DENGAN LOGO DINAMIS */}
                <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-3">
                  {/* Left Logo: Dynamic IPNU Emblem / Custom Logo */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={orgSettings.logoUrl}
                      alt="Logo IPNU"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Right Text: Official PAC IPNU Header */}
                  <div className="text-right text-emerald-800 leading-tight">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight">
                      {orgSettings.tingkatKepengurusan}
                    </h2>
                    <h1 className="text-base sm:text-lg font-black tracking-normal">
                      {orgSettings.namaOrganisasi}
                    </h1>
                    <h3 className="text-sm sm:text-base font-bold tracking-wide">
                      {orgSettings.namaDaerah}
                    </h3>
                    <p className="text-[11px] text-emerald-950 mt-1 font-sans">
                      {orgSettings.alamatSekretariat}
                    </p>
                    <p className="text-[11px] text-emerald-950 font-sans">
                      {orgSettings.kontakSekretariat}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-sans font-medium">
                      {orgSettings.emailSekretariat}
                    </p>
                  </div>
                </div>

                {/* 2. JUDUL CV (Disesuaikan dengan Jabatan yang diisi anggota) */}
                <div className="text-center pt-2">
                  <h2 className="text-sm sm:text-base font-bold tracking-wide underline underline-offset-4 uppercase">
                    CURICULUM VITAE {jabatan} {asalKepengurusan.toUpperCase()}
                  </h2>
                </div>

                {/* 3. BIODATA UTAMA */}
                <div className="text-xs sm:text-[13px] leading-relaxed pt-1">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <td className="w-40 sm:w-44 py-0.5 sm:py-1 align-top">Nama Lengkap</td>
                        <td className="w-4 py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1 font-bold uppercase">{member.nama_lengkap}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 sm:py-1 align-top">TTL</td>
                        <td className="py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1">
                          {member.tempat_lahir}, {formatIndonesianDate(member.tanggal_lahir)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 sm:py-1 align-top">Alamat</td>
                        <td className="py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1">{member.alamat_lengkap}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 sm:py-1 align-top">Alamat Email</td>
                        <td className="py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1">{member.email}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 sm:py-1 align-top">No. HP</td>
                        <td className="py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1 font-sans font-medium">{member.no_hp_wa}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 sm:py-1 align-top">Asal Kepengurusan</td>
                        <td className="py-0.5 sm:py-1 align-top">:</td>
                        <td className="py-0.5 sm:py-1 uppercase font-semibold">{asalKepengurusan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. RIWAYAT PENDIDIKAN */}
                <div className="text-xs sm:text-[13px] leading-relaxed space-y-1 pt-1">
                  <h4 className="font-bold">Riwayat Pendidikan</h4>
                  
                  <table className="w-full text-left pl-2">
                    <tbody>
                      <tr>
                        <td className="w-36 sm:w-40 py-0.5">1. SD/MI</td>
                        <td className="w-4 py-0.5">:</td>
                        <td className="py-0.5 font-medium">{sdPendidikan?.nama_sekolah || '-'}</td>
                        <td className="py-0.5 text-right w-36">
                          {sdPendidikan?.tahun_lulus ? `Lulus tahun ${sdPendidikan.tahun_lulus}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">2. SMP/MTs</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-medium">{smpPendidikan?.nama_sekolah || '-'}</td>
                        <td className="py-0.5 text-right">
                          {smpPendidikan?.tahun_lulus ? `Lulus tahun ${smpPendidikan.tahun_lulus}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">3. SMA/SMK/MA</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-medium">{smaPendidikan?.nama_sekolah || '-'}</td>
                        <td className="py-0.5 text-right">
                          {smaPendidikan?.tahun_lulus ? `Lulus tahun ${smaPendidikan.tahun_lulus}` : ''}
                        </td>
                      </tr>
                      {perguruanTinggi && perguruanTinggi.map((pt, idx) => (
                        <tr key={pt.id || idx}>
                          <td className="py-0.5">{4 + idx}. Perguruan Tinggi ({pt.jenjang})</td>
                          <td className="py-0.5">:</td>
                          <td className="py-0.5 font-medium">{pt.nama_sekolah}</td>
                          <td className="py-0.5 text-right">
                            {pt.tahun_lulus ? `Lulus tahun ${pt.tahun_lulus}` : pt.tahun_masuk ? `Masuk tahun ${pt.tahun_masuk}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. RIWAYAT PENDIDIKAN KADERISASI IPNU-IPPNU */}
                <div className="text-xs sm:text-[13px] leading-relaxed space-y-1 pt-1">
                  <h4 className="font-bold">Riwayat Pendidikan Kaderisasi IPNU-IPPNU</h4>
                  
                  <div className="pl-2 space-y-1">
                    <div className="flex items-start">
                      <span className="w-24 sm:w-28 font-semibold shrink-0">FORMAL :</span>
                      <div className="flex-1 space-y-0.5">
                        {formalKaderisasi.length > 0 ? (
                          formalKaderisasi.map((kad, idx) => (
                            <div key={kad.id || idx}>
                              {idx + 1}. <strong>{kad.jenjang_formal}</strong> di {kad.penyelenggara || kad.lokasi || '........'} {kad.tahun ? `(${kad.tahun})` : ''}
                            </div>
                          ))
                        ) : (
                          <>
                            <div>1. MAKESTA di............</div>
                            <div>2. LAKMUD di.........</div>
                          </>
                        )}
                      </div>
                    </div>

                    {nonFormalKaderisasi.length > 0 && (
                      <div className="flex items-start pt-1">
                        <span className="w-24 sm:w-28 font-semibold shrink-0">NON-FORMAL :</span>
                        <div className="flex-1 space-y-0.5">
                          {nonFormalKaderisasi.map((kad, idx) => (
                            <div key={kad.id || idx}>
                              {idx + 1}. {kad.nama_kaderisasi_nonformal} di {kad.penyelenggara || kad.lokasi || '........'} {kad.tahun ? `(${kad.tahun})` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. PENGALAMAN ORGANISASI */}
                <div className="text-xs sm:text-[13px] leading-relaxed space-y-1 pt-1">
                  <h4 className="font-bold">Pengalaman Organisasi</h4>
                  
                  <ol className="list-decimal pl-6 space-y-1">
                    {member.riwayat_organisasi && member.riwayat_organisasi.length > 0 ? (
                      member.riwayat_organisasi.map((org, idx) => (
                        <li key={org.id || idx} className="uppercase">
                          <strong>{org.jabatan}</strong> {org.nama_organisasi} {org.tahun_mulai ? `TAHUN ${org.tahun_mulai}${org.tahun_selesai ? ` - ${org.tahun_selesai}` : ''}` : ''}
                        </li>
                      ))
                    ) : (
                      <>
                        <li>KETUA IPNU RANTING DESA..... TAHUN ........</li>
                        <li>KETUA ..................................................</li>
                        <li>.................................................................</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* 7. BOTTOM: PAS FOTO & TANDA TANGAN */}
                <div className="pt-6 sm:pt-8 flex items-end justify-between">
                  
                  {/* Left: Pas Foto (4x6 atau 3x4 sesuai pengaturan) */}
                  <div className={`${
                    orgSettings.cvPhotoSize === '3x4' ? 'w-24 sm:w-28 h-32 sm:h-38' : 'w-28 sm:w-32 h-36 sm:h-44'
                  } border-2 border-slate-700 p-0.5 flex items-center justify-center bg-slate-50 relative overflow-hidden shrink-0`}>
                    {member.pas_foto_url ? (
                      <img
                        src={member.pas_foto_url}
                        alt={member.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-slate-500 text-xs">
                        <span className="block font-serif">Pas poto</span>
                        <span className="block font-sans text-sm font-bold">{orgSettings.cvPhotoSize}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Date, Signature & Bold Underlined Name */}
                  <div className="text-center w-64 sm:w-72 space-y-1">
                    <p className="text-xs sm:text-[13px]">
                      {titimangsaTempat}, {titimangsaTanggal}
                    </p>

                    {/* Digital Signature Container */}
                    <div className="h-20 sm:h-24 flex items-center justify-center">
                      {member.tanda_tangan_url ? (
                        <img
                          src={member.tanda_tangan_url}
                          alt="Tanda Tangan"
                          className="max-h-full max-w-[200px] object-contain"
                        />
                      ) : (
                        <div className="text-[11px] text-slate-300 italic">
                          ( Tanda Tangan Digital )
                        </div>
                      )}
                    </div>

                    {/* Underlined Uppercase Name */}
                    <p className="text-xs sm:text-sm font-bold uppercase underline underline-offset-2 tracking-wide">
                      _{member.nama_lengkap}
                    </p>
                  </div>

                </div>

              </div>

              {/* 8. FOOTER: MOTTO IPNU */}
              <div className="text-center pt-8 border-t border-slate-200 mt-6">
                <span className="text-emerald-800 font-bold tracking-[0.3em] text-xs sm:text-sm uppercase font-serif">
                  {orgSettings.motto || 'BELAJAR, BERJUANG, BERTAQWA'}
                </span>
              </div>

            </div>

          </div>

          {/* Footer print bar (hidden on print) */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between print:hidden shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLayoutModal(true)}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 underline underline-offset-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pengaturan Layout & Logo</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSavingToDrive ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <HardDrive className="w-4 h-4 text-white" />
                )}
                <span>{isSavingToDrive ? 'Menyimpan...' : 'Simpan ke Google Drive'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Dialog for Saving CV to Drive */}
      {showDriveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-800 leading-snug">
                  Simpan CV ke Google Drive
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda ingin mengunggah dokumen CV resmi atas nama <strong>{member.nama_lengkap}</strong> ({jabatan}) ke folder <strong>"Arsip Digital IPNU"</strong> di akun Google Drive Anda?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDriveConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSaveToDrive}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
              >
                Ya, Simpan ke Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal for Layout & Logo Settings */}
      {showLayoutModal && (
        <LayoutSettingsModal
          onClose={() => setShowLayoutModal(false)}
          onSaved={() => {
            setOrgSettings(getOrgSettings());
          }}
        />
      )}
    </>
  );
};
