import React, { useState, useRef } from 'react';
import { 
  getOrgSettings, 
  saveOrgSettings, 
  resetOrgSettings, 
  DEFAULT_OFFICIAL_IPNU_LOGO, 
  OrgSettings 
} from '../lib/orgSettings';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Sliders, 
  Building2, 
  FileText, 
  Info, 
  Code, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface LayoutSettingsModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export const LayoutSettingsModal: React.FC<LayoutSettingsModalProps> = ({ onClose, onSaved }) => {
  const [settings, setSettings] = useState<OrgSettings>(getOrgSettings());
  const [activeTab, setActiveTab] = useState<'logo' | 'kop' | 'cv' | 'kode'>('logo');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSettings(prev => ({
          ...prev,
          logoUrl: dataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setSettings(prev => ({
      ...prev,
      logoUrl: DEFAULT_OFFICIAL_IPNU_LOGO
    }));
  };

  const handleSave = () => {
    saveOrgSettings(settings);
    setSavedFeedback(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleResetAll = () => {
    if (window.confirm('Kembalikan seluruh pengaturan layout dan logo ke standar PAC Pacet?')) {
      const def = resetOrgSettings();
      setSettings(def);
      if (onSaved) onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Pengaturan Layout & Logo IPNU</h3>
              <p className="text-xs text-emerald-200">
                Kustomisasi Logo Beranda, KOP Surat CV, Identitas Organisasi & Dokumen
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'logo'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo Beranda & KOP CV</span>
          </button>

          <button
            onClick={() => setActiveTab('kop')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kop'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>KOP Surat & Kontak Lembaga</span>
          </button>

          <button
            onClick={() => setActiveTab('cv')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cv'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Format & Layout Dokumen CV</span>
          </button>

          <button
            onClick={() => setActiveTab('kode')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kode'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Panduan Edit Kode File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: GANTI LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Ubah Logo IPNU Sekali untuk Seluruh Halaman</p>
                  <p className="mt-0.5 text-slate-600">
                    Logo yang Anda pilih atau unggah di bawah ini akan otomatis menggantikan logo pada <strong>Header Beranda</strong>, <strong>Banner Hero</strong>, dan <strong>KOP Surat CV Output</strong>.
                  </p>
                </div>
              </div>

              {/* Logo Preview & Upload Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Current Logo Preview */}
                <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Pratinjau Logo Aktif
                  </span>
                  
                  <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 shadow-sm p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={settings.logoUrl}
                      alt="Logo IPNU"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 mt-2 text-center">
                    Tampil pada Beranda & KOP Surat CV
                  </span>
                </div>

                {/* Upload Actions */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Pilih Berkas Logo Baru:
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoFile}
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Logo dari Perangkat (PNG/JPG/SVG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gunakan Logo Resmi Default</span>
                    </button>
                  </div>

                  {/* Image URL input alternative */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Atau Masukkan Tautan / URL Gambar Logo:
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl.startsWith('data:') ? '' : settings.logoUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value || DEFAULT_OFFICIAL_IPNU_LOGO }))}
                      placeholder="https://domain.com/logo-ipnu.png"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600 font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      *Disarankan menggunakan gambar PNG dengan latar belakang transparan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOP SURAT & LEMBAGA */}
          {activeTab === 'kop' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Kepengurusan:
                  </label>
                  <select
                    value={settings.tingkatKepengurusan}
                    onChange={(e) => setSettings(prev => ({ ...prev, tingkatKepengurusan: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-emerald-600"
                  >
                    <option value="PIMPINAN ANAK CABANG">PIMPINAN ANAK CABANG (PAC)</option>
                    <option value="PIMPINAN CABANG">PIMPINAN CABANG (PC)</option>
                    <option value="PIMPINAN RANTING">PIMPINAN RANTING (PR)</option>
                    <option value="PIMPINAN KOMISARIAT">PIMPINAN KOMISARIAT (PK)</option>
                    <option value="PIMPINAN WILAYAH">PIMPINAN WILAYAH (PW)</option>
                    <option value="PIMPINAN PUSAT">PIMPINAN PUSAT (PP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Daerah / Kecamatan / Wilayah:
                  </label>
                  <input
                    type="text"
                    value={settings.namaDaerah}
                    onChange={(e) => setSettings(prev => ({ ...prev, namaDaerah: e.target.value.toUpperCase() }))}
                    placeholder="Contoh: KECAMATAN PACET"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Organisasi:
                </label>
                <input
                  type="text"
                  value={settings.namaOrganisasi}
                  onChange={(e) => setSettings(prev => ({ ...prev, namaOrganisasi: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Sekretariat:
                </label>
                <input
                  type="text"
                  value={settings.alamatSekretariat}
                  onChange={(e) => setSettings(prev => ({ ...prev, alamatSekretariat: e.target.value }))}
                  placeholder="Contoh: Graha MWCNU PACET Lt.2 Jl.Raya Pacet No.270 61374"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp Sekretariat:
                  </label>
                  <input
                    type="text"
                    value={settings.kontakSekretariat}
                    onChange={(e) => setSettings(prev => ({ ...prev, kontakSekretariat: e.target.value }))}
                    placeholder="0858-1596-1804 – 0831-1950-7285"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Resmi Sekretariat:
                  </label>
                  <input
                    type="email"
                    value={settings.emailSekretariat}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailSekretariat: e.target.value }))}
                    placeholder="pelajarnupacet@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motto Organisasi (Bagian Bawah Halaman):
                </label>
                <input
                  type="text"
                  value={settings.motto}
                  onChange={(e) => setSettings(prev => ({ ...prev, motto: e.target.value.toUpperCase() }))}
                  placeholder="BELAJAR, BERJUANG, BERTAQWA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold tracking-widest uppercase focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FORMAT & LAYOUT DOKUMEN CV */}
          {activeTab === 'cv' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Huruf Dokumen CV:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, cvFontFamily: 'serif' }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.cvFontFamily === 'serif'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block font-serif text-sm">Times New Roman</span>
                      <span className="text-[10px] text-slate-500">Standar Surat Resmi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, cvFontFamily: 'sans' }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.cvFontFamily === 'sans'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block font-sans text-sm font-semibold">Plus Jakarta Sans</span>
                      <span className="text-[10px] text-slate-500">Modern & Bersih</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ukuran Bingkai Pas Foto:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, cvPhotoSize: '4x6' }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.cvPhotoSize === '4x6'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block text-sm">4 x 6 cm</span>
                      <span className="text-[10px] text-slate-500">Sesuai Dokumen Pacet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, cvPhotoSize: '3x4' }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.cvPhotoSize === '3x4'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block text-sm">3 x 4 cm</span>
                      <span className="text-[10px] text-slate-500">Ukuran Pas Foto Standar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kerapatan Baris Dokumen (Spacing):
                  </label>
                  <select
                    value={settings.cvSpacing}
                    onChange={(e) => setSettings(prev => ({ ...prev, cvSpacing: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-emerald-600"
                  >
                    <option value="compact">Ringkas (Muat Banyak Baris / 1 Halaman)</option>
                    <option value="normal">Normal (Standar Dokumen Pacet)</option>
                    <option value="relaxed">Renggang (Elegan & Bernapas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota Titimangsa Surat:
                  </label>
                  <input
                    type="text"
                    value={settings.titimangsaKota}
                    onChange={(e) => setSettings(prev => ({ ...prev, titimangsaKota: e.target.value }))}
                    placeholder="Contoh: Mojokerto"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Akan tertera di atas tanda tangan: [Kota], [Tanggal Hari Ini]
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN EDIT KODE */}
          {activeTab === 'kode' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 space-y-3 font-mono text-[11px] leading-relaxed">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pb-1 border-b border-slate-800">
                  <Code className="w-4 h-4" />
                  <span>Struktur Berkas & Panduan Edit Layout Kode</span>
                </div>

                <div className="space-y-2">
                  <p className="text-amber-300 font-bold">1. File Layout CV Dokumen Resmi:</p>
                  <p className="text-slate-300 pl-3">
                    → Lokasi: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white">src/components/CvPrintModal.tsx</code>
                    <br />
                    Di berkas ini Anda dapat mengedit tata letak KOP surat, urutan riwayat pendidikan, format kaderisasi formal/nonformal, letak pas foto, dan posisi tanda tangan.
                  </p>

                  <p className="text-amber-300 font-bold pt-1">2. File Beranda & Header Logo:</p>
                  <p className="text-slate-300 pl-3">
                    → Lokasi: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white">src/components/Header.tsx</code>
                    <br />
                    Mengatur bilah navigasi atas, badge logo IPNU di sebelah judul, serta tombol menu pendaftaran & admin.
                  </p>

                  <p className="text-amber-300 font-bold pt-1">3. File Hero Banner Beranda:</p>
                  <p className="text-slate-300 pl-3">
                    → Lokasi: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white">src/App.tsx</code>
                    <br />
                    Mengatur kartu hijau sambutan di bagian atas beranda pendaftaran mandiri.
                  </p>

                  <p className="text-amber-300 font-bold pt-1">4. Konfigurasi Terpusat:</p>
                  <p className="text-slate-300 pl-3">
                    → Lokasi: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white">src/lib/orgSettings.ts</code>
                    <br />
                    Menyimpan SVG resmi logo IPNU dan pengaturan default KOP surat PAC IPNU Pacet.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Pengaturan Awal</span>
          </button>

          <div className="flex gap-2 items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              {savedFeedback ? <Check className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{savedFeedback ? 'Berhasil Disimpan!' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
