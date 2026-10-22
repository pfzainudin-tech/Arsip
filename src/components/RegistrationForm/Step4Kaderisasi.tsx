import React, { useRef } from 'react';
import { JenjangFormal, KategoriKaderisasi, RiwayatKaderisasi } from '../../types';
import { 
  Plus, 
  Trash2, 
  FileCheck, 
  MapPin, 
  Calendar, 
  Building2, 
  UploadCloud, 
  CheckCircle2, 
  FileText,
  Star,
  Sparkles
} from 'lucide-react';

interface Step4Props {
  kaderisasiList: RiwayatKaderisasi[];
  onChange: (list: RiwayatKaderisasi[]) => void;
  errors: Record<string, string>;
}

const FORMAL_OPTIONS: { value: JenjangFormal; label: string; desc: string }[] = [
  { value: 'MAKESTA', label: 'MAKESTA', desc: 'Masa Kesetiaan Anggota (Kaderisasi Tingkat Pertama)' },
  { value: 'LAKMUD', label: 'LAKMUD', desc: 'Latihan Kader Muda (Kaderisasi Tingkat Menengah)' },
  { value: 'LAKUT', label: 'LAKUT', desc: 'Latihan Kader Utama (Kaderisasi Tingkat Lanjut)' },
  { value: 'LATIN I', label: 'LATIN I', desc: 'Latihan Instruktur I (Tingkat Wilayah/Cabang)' },
  { value: 'LATIN II', label: 'LATIN II', desc: 'Latihan Instruktur II' },
  { value: 'LAKNAS', label: 'LAKNAS', desc: 'Latihan Kader Nasional' },
  { value: 'LATINNAS', label: 'LATINNAS', desc: 'Latihan Instruktur Nasional' },
];

export const Step4Kaderisasi: React.FC<Step4Props> = ({
  kaderisasiList,
  onChange,
  errors
}) => {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleAdd = (defaultKategori: KategoriKaderisasi = 'Formal') => {
    const newItem: RiwayatKaderisasi = {
      id: `k-${Date.now()}`,
      kategori: defaultKategori,
      jenjang_formal: defaultKategori === 'Formal' ? 'MAKESTA' : undefined,
      nama_kaderisasi_nonformal: defaultKategori === 'Non-Formal' ? '' : undefined,
      penyelenggara: '',
      lokasi: '',
      tahun: '',
      sertifikat_url: ''
    };
    onChange([...kaderisasiList, newItem]);
  };

  const handleRemove = (index: number) => {
    const updated = kaderisasiList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdate = (index: number, updates: Partial<RiwayatKaderisasi>) => {
    const updated = [...kaderisasiList];
    updated[index] = {
      ...updated[index],
      ...updates
    };
    onChange(updated);
  };

  const handleCategoryChange = (index: number, kategori: KategoriKaderisasi) => {
    if (kategori === 'Formal') {
      handleUpdate(index, {
        kategori,
        jenjang_formal: 'MAKESTA',
        nama_kaderisasi_nonformal: undefined
      });
    } else {
      handleUpdate(index, {
        kategori,
        jenjang_formal: undefined,
        nama_kaderisasi_nonformal: ''
      });
    }
  };

  const handleCertificateUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        handleUpdate(index, {
          sertifikat_url: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-extrabold">
              4
            </span>
            Riwayat Kaderisasi IPNU
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data pengkaderan formal (MAKESTA s/d LATINNAS) dan non-formal (DIKLATAMA, Jurnalistik, dll).
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAdd('Formal')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kaderisasi</span>
        </button>
      </div>

      {kaderisasiList.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Kaderisasi</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tambahkan sertifikasi kaderisasi yang pernah Anda ikuti di IPNU untuk verifikasi status anggota aktif.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleAdd('Formal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kaderisasi Formal (MAKESTA/dll)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAdd('Non-Formal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Non-Formal</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {kaderisasiList.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative hover:border-emerald-300 transition-all space-y-4"
            >
              {/* Header card: Index & Category Badge & Delete */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Kaderisasi #{index + 1}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      item.kategori === 'Formal'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.kategori}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus kaderisasi ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Kategori Radio Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Kategori Kaderisasi <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      item.kategori === 'Formal'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`kategori-${index}`}
                      value="Formal"
                      checked={item.kategori === 'Formal'}
                      onChange={() => handleCategoryChange(index, 'Formal')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs">Formal (Wajib IPNU)</span>
                  </label>

                  <label
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      item.kategori === 'Non-Formal'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`kategori-${index}`}
                      value="Non-Formal"
                      checked={item.kategori === 'Non-Formal'}
                      onChange={() => handleCategoryChange(index, 'Non-Formal')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs">Non-Formal (Peminatan)</span>
                  </label>
                </div>
              </div>

              {/* Conditional Field: Formal Dropdown vs Non-Formal Free Text */}
              {item.kategori === 'Formal' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenjang Kaderisasi Formal <span className="text-rose-500">* (Wajib Pilih)</span>
                  </label>
                  <select
                    value={item.jenjang_formal || 'MAKESTA'}
                    onChange={(e) => handleUpdate(index, { jenjang_formal: e.target.value as JenjangFormal })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {FORMAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    MAKESTA adalah gerbang awal pengkaderan wajib bagi seluruh pelajar NU.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kegiatan Kaderisasi Non-Formal <span className="text-rose-500">* (Teks Bebas)</span>
                  </label>
                  <input
                    type="text"
                    value={item.nama_kaderisasi_nonformal || ''}
                    onChange={(e) => handleUpdate(index, { nama_kaderisasi_nonformal: e.target.value })}
                    placeholder="Contoh: DIKLATAMA CBP, Sekolah Jurnalistik Pelajar, LKK, DIKLATSUS, dll"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bisa ditambahkan berkali-kali untuk setiap pelatihan peminatan atau keterampilan yang pernah diikuti.
                  </p>
                </div>
              )}

              {/* Field Tambahan untuk Keduanya: Penyelenggara, Lokasi, Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                {/* Penyelenggara */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Penyelenggara <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={item.penyelenggara}
                      onChange={(e) => handleUpdate(index, { penyelenggara: e.target.value })}
                      placeholder="Contoh: PAC IPNU Tambun / PC IPNU Malang"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Lokasi */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Lokasi Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={item.lokasi}
                      onChange={(e) => handleUpdate(index, { lokasi: e.target.value })}
                      placeholder="Gedung MWC NU / Pesantren"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Tahun */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Pelaksanaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.tahun}
                      onChange={(e) => handleUpdate(index, { tahun: e.target.value.replace(/\D/g, '') })}
                      placeholder="2022"
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Sertifikat (JPG/PDF) */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Lampiran Sertifikat / Piagam (Opsional, JPG/PDF)
                  </label>
                  {item.sertifikat_url && (
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sertifikat Terlampir
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-700" />
                    <span>{item.sertifikat_url ? 'Ganti Berkas Sertifikat' : 'Pilih Berkas Sertifikat (JPG/PDF)'}</span>
                  </button>

                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={(e) => handleCertificateUpload(index, e)}
                  />

                  {item.sertifikat_url ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 max-w-xs truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Sertifikat_{item.kategori === 'Formal' ? item.jenjang_formal : 'NonFormal'}_{item.tahun || 'Doc'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdate(index, { sertifikat_url: '' })}
                        className="text-xs text-rose-600 hover:underline ml-2"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      *Membantu mempercepat proses verifikasi oleh pengurus
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Add Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAdd('Formal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Kaderisasi Formal (MAKESTA/dll)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAdd('Non-Formal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Non-Formal Bebas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
