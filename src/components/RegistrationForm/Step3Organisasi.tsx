import React from 'react';
import { RiwayatOrganisasi } from '../../types';
import { Users, Plus, Trash2, Award, Calendar } from 'lucide-react';

interface Step3Props {
  organisasiList: RiwayatOrganisasi[];
  onChange: (list: RiwayatOrganisasi[]) => void;
  errors: Record<string, string>;
}

export const Step3Organisasi: React.FC<Step3Props> = ({
  organisasiList,
  onChange,
  errors
}) => {
  const handleAdd = () => {
    const newItem: RiwayatOrganisasi = {
      id: `o-${Date.now()}`,
      nama_organisasi: '',
      jabatan: '',
      tahun_mulai: '',
      tahun_selesai: ''
    };
    onChange([...organisasiList, newItem]);
  };

  const handleRemove = (index: number) => {
    const updated = organisasiList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdate = (index: number, field: keyof RiwayatOrganisasi, value: string) => {
    const updated = [...organisasiList];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-extrabold">
              3
            </span>
            Riwayat Organisasi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengalaman keorganisasian di internal IPNU, OSIS, Rohis, Remaja Masjid, maupun kepemudaan lainnya.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Organisasi</span>
        </button>
      </div>

      {organisasiList.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Organisasi</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Jika Anda pernah aktif di organisasi (IPNU, OSIS, Pramuka, Remas, dll), silakan tambahkan di sini.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Organisasi Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {organisasiList.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative hover:border-emerald-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  Organisasi #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus riwayat ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Nama Organisasi */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Lembaga / Organisasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.nama_organisasi}
                    onChange={(e) => handleUpdate(index, 'nama_organisasi', e.target.value)}
                    placeholder="Contoh: Pimpinan Ranting IPNU / OSIS SMK 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* Jabatan */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jabatan / Amanah <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={item.jabatan}
                      onChange={(e) => handleUpdate(index, 'jabatan', e.target.value)}
                      placeholder="Ketua / Sekretaris / Anggota"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Tahun Mulai */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Mulai
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.tahun_mulai}
                      onChange={(e) => handleUpdate(index, 'tahun_mulai', e.target.value.replace(/\D/g, ''))}
                      placeholder="2021"
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Tahun Selesai */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Selesai
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.tahun_selesai}
                      onChange={(e) => handleUpdate(index, 'tahun_selesai', e.target.value.replace(/\D/g, ''))}
                      placeholder="2023 / Sekarang"
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Organisasi Lain</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
