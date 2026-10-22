import React from 'react';
import { JenjangPendidikan, RiwayatPendidikan } from '../../types';
import { GraduationCap, Plus, Trash2, School, Calendar, Info } from 'lucide-react';

interface Step2Props {
  pendidikanList: RiwayatPendidikan[];
  onChange: (list: RiwayatPendidikan[]) => void;
  errors: Record<string, string>;
}

const JENJANG_OPTIONS: JenjangPendidikan[] = [
  'SD',
  'SMP',
  'SMA',
  'SMK',
  'D1',
  'D2',
  'D3',
  'S1',
  'S2'
];

export const Step2Pendidikan: React.FC<Step2Props> = ({
  pendidikanList,
  onChange,
  errors
}) => {
  const handleAdd = () => {
    const newItem: RiwayatPendidikan = {
      id: `p-${Date.now()}`,
      jenjang: 'SMA',
      nama_sekolah: '',
      tahun_masuk: '',
      tahun_lulus: ''
    };
    onChange([...pendidikanList, newItem]);
  };

  const handleRemove = (index: number) => {
    const updated = pendidikanList.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdate = (index: number, field: keyof RiwayatPendidikan, value: string) => {
    const updated = [...pendidikanList];
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
              2
            </span>
            Riwayat Pendidikan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cantumkan riwayat pendidikan formal mulai dari jenjang menengah hingga perguruan tinggi.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pendidikan</span>
        </button>
      </div>

      {pendidikanList.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Pendidikan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Tambahkan minimal 1 (satu) riwayat pendidikan terakhir Anda untuk melengkapi berkas arsip.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pendidikan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pendidikanList.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative hover:border-emerald-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  Pendidikan #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus baris ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Jenjang */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jenjang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={item.jenjang}
                    onChange={(e) => handleUpdate(index, 'jenjang', e.target.value as JenjangPendidikan)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {JENJANG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nama Sekolah */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Sekolah / Madrasah / Kampus <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <School className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={item.nama_sekolah}
                      onChange={(e) => handleUpdate(index, 'nama_sekolah', e.target.value)}
                      placeholder="Contoh: SMA Nahdlatul Ulama 1"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Tahun Masuk */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Masuk
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.tahun_masuk}
                      onChange={(e) => handleUpdate(index, 'tahun_masuk', e.target.value.replace(/\D/g, ''))}
                      placeholder="2019"
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* Tahun Lulus */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tahun Lulus
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.tahun_lulus}
                      onChange={(e) => handleUpdate(index, 'tahun_lulus', e.target.value.replace(/\D/g, ''))}
                      placeholder="2022"
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-300 text-sm text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pendidikanList.length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Pendidikan Lain</span>
              </button>
            </div>
          )}
        </div>
      )}

      {errors.pendidikan && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{errors.pendidikan}</span>
        </div>
      )}
    </div>
  );
};
