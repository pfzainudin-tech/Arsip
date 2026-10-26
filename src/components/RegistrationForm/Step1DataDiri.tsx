import React, { useRef } from 'react';
import { RegistrationFormData } from '../../types';
import { 
  User, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Eye
} from 'lucide-react';

interface Step1Props {
  formData: RegistrationFormData;
  updateFormData: (fields: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

export const Step1DataDiri: React.FC<Step1Props> = ({
  formData,
  updateFormData,
  errors
}) => {
  const ktpInputRef = useRef<HTMLInputElement>(null);

  const handleKtpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, JPEG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      updateFormData({
        foto_ktp_file: file,
        foto_ktp_preview: dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveKtp = () => {
    updateFormData({
      foto_ktp_file: null,
      foto_ktp_preview: ''
    });
    if (ktpInputRef.current) {
      ktpInputRef.current.value = '';
    }
  };
  const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically convert to uppercase as required
    updateFormData({ nama_lengkap: e.target.value.toUpperCase() });
  };

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numbers and limit to 16 characters
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
    updateFormData({ nik: numericOnly });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep numbers and optional plus
    const val = e.target.value.replace(/[^\d+]/g, '');
    updateFormData({ no_hp_wa: val });
  };

  // WhatsApp helper
  const cleanPhoneForWa = (phone: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('08')) {
      clean = '628' + clean.slice(2);
    }
    return clean;
  };

  const waNumber = cleanPhoneForWa(formData.no_hp_wa);
  const isValidWaNumber = waNumber.length >= 10 && waNumber.startsWith('628');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-extrabold">
            1
          </span>
          Data Diri Anggota
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi identitas pribadi sesuai Kartu Tanda Penduduk (KTP) atau Kartu Keluarga (KK).
        </p>
      </div>

      <div className="space-y-4">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nama Lengkap <span className="text-rose-500">*</span>
            <span className="text-xs font-normal text-slate-400 ml-2">(Otomatis Huruf Kapital)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={formData.nama_lengkap}
              onChange={handleNamaChange}
              placeholder="CONTOH: AHMAD FAUZI NUGRAHA"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium uppercase tracking-wide transition-all ${
                errors.nama_lengkap
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
            />
          </div>
          {errors.nama_lengkap && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.nama_lengkap}
            </p>
          )}
        </div>

        {/* NIK 16 Digit */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-700">
              Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
            </label>
            <span className={`text-xs font-mono font-medium ${
              formData.nik.length === 16 ? 'text-emerald-700' : 'text-slate-400'
            }`}>
              {formData.nik.length}/16 Digit
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={formData.nik}
              onChange={handleNikChange}
              placeholder="16 digit angka sesuai KTP/KK (misal: 3573011506040002)"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-mono tracking-wider transition-all ${
                errors.nik
                  ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                  : formData.nik.length === 16
                  ? 'border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-100'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
              }`}
            />
            {formData.nik.length === 16 && (
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>
          {errors.nik ? (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.nik}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Hanya angka, tepat 16 digit. NIK digunakan sebagai identitas tunggal kader IPNU.
            </p>
          )}
        </div>

        {/* Upload Foto KTP / Kartu Identitas */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>Upload Foto KTP / Kartu Identitas</span>
              <span className="text-xs font-normal text-slate-400">(KTP / Kartu Pelajar / KIA / KK)</span>
            </label>
            {formData.foto_ktp_preview && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Berkas Siap
              </span>
            )}
          </div>

          <input
            type="file"
            ref={ktpInputRef}
            onChange={handleKtpFileChange}
            accept="image/*"
            className="hidden"
          />

          {formData.foto_ktp_preview ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
                <img
                  src={formData.foto_ktp_preview}
                  alt="Preview KTP"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Foto KTP / Kartu Identitas Terlampir
                </p>
                <p className="text-[11px] text-slate-500">
                  Foto akan digunakan untuk verifikasi data kepengurusan dan NIK oleh pengurus IPNU.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => ktpInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ganti Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveKtp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => ktpInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-5 text-center cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Klik untuk unggah Foto KTP / Kartu Pelajar
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format file JPG, PNG, atau JPEG (Maks. 5MB). Pastikan tulisan pada KTP terbaca jelas.
              </p>
            </div>
          )}
        </div>

        {/* Tempat Lahir & Tanggal Lahir (1 Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tempat Lahir <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => updateFormData({ tempat_lahir: e.target.value })}
                placeholder="Kota / Kabupaten Lahir"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                  errors.tempat_lahir
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.tempat_lahir && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.tempat_lahir}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tanggal Lahir <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={formData.tanggal_lahir}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ tanggal_lahir: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-700 transition-all ${
                  errors.tanggal_lahir
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.tanggal_lahir && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.tanggal_lahir}
              </p>
            )}
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Alamat Lengkap <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.alamat_lengkap}
            onChange={(e) => updateFormData({ alamat_lengkap: e.target.value })}
            placeholder="Jalan, No. Rumah, RT/RW, Dusun/Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all ${
              errors.alamat_lengkap
                ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
            }`}
          />
          {errors.alamat_lengkap && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.alamat_lengkap}
            </p>
          )}
        </div>

        {/* Kontak: No HP/WA & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-700">
                No. HP / WhatsApp <span className="text-rose-500">*</span>
              </label>
              {isValidWaNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Test Link WA
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={formData.no_hp_wa}
                onChange={handlePhoneChange}
                placeholder="08xxxxxxxxxx"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                  errors.no_hp_wa
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.no_hp_wa ? (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.no_hp_wa}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Format diawali angka 08 (contoh: 081234567890)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Alamat Email Aktif <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value.toLowerCase() })}
                placeholder="nama@email.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Jabatan & Asal Kepengurusan (Untuk Penyesuaian CV Resmi) */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Jabatan & Asal Kepengurusan IPNU (Penyesuaian CV Otomatis)
            </label>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
              Format CV Resmi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Yang Diemban <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jabatan || ''}
                onChange={(e) => updateFormData({ jabatan: e.target.value.toUpperCase() })}
                placeholder="Contoh: KETUA, SEKRETARIS, ANGGOTA..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['KETUA', 'WAKIL KETUA', 'SEKRETARIS', 'BENDAHARA', 'ANGGOTA'].map((jab) => (
                  <button
                    key={jab}
                    type="button"
                    onClick={() => updateFormData({ jabatan: jab })}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors ${
                      formData.jabatan === jab
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {jab}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Kepengurusan & Asal Instansi
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {[
                  { code: 'PAC', label: 'PAC (Kecamatan)' },
                  { code: 'PR', label: 'PR (Ranting/Desa)' },
                  { code: 'PK', label: 'PK (Sekolah/Pesantren)' },
                  { code: 'PKPT', label: 'PKPT (Kampus)' },
                  { code: 'PC', label: 'PC (Cabang/Kab)' },
                  { code: 'PW', label: 'PW (Wilayah/Jatim)' },
                  { code: 'PP', label: 'PP (Pusat)' },
                ].map((tier) => (
                  <button
                    key={tier.code}
                    type="button"
                    onClick={() => {
                      updateFormData({ 
                        tingkat_kepengurusan: tier.code,
                        asal_kepengurusan: formData.asal_kepengurusan && !formData.asal_kepengurusan.startsWith('PAC.') && !formData.asal_kepengurusan.startsWith('PR.') && !formData.asal_kepengurusan.startsWith('PK.')
                          ? formData.asal_kepengurusan 
                          : `${tier.code}. IPNU `
                      });
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-colors ${
                      formData.tingkat_kepengurusan === tier.code
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.asal_kepengurusan || ''}
                onChange={(e) => updateFormData({ asal_kepengurusan: e.target.value })}
                placeholder="Contoh: PAC. IPNU KECAMATAN PACET"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Akan otomatis tertera di Kop Surat dan Judul Curiculum Vitae (CV).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
