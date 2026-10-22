import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhotoUploadCropProps {
  preview: string;
  onPhotoSelected: (file: File, previewUrl: string) => void;
  onClear: () => void;
  error?: string;
}

export const PhotoUploadCrop: React.FC<PhotoUploadCropProps> = ({
  preview,
  onPhotoSelected,
  onClear,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setFileError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Format berkas harus berupa JPG atau PNG.');
      return;
    }

    // Validate size: max 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 2 MB.`);
      return;
    }

    // Read and create data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onPhotoSelected(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Pas Foto Resmi 3x4 <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs text-slate-500">Maksimal 2 MB (JPG/PNG)</span>
      </div>

      <div className="text-xs text-slate-500">
        Disarankan berlatar belakang merah/biru, mengenakan jas/seragam IPNU atau kemeja rapi berkerah.
      </div>

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
              : error || fileError
              ? 'border-rose-400 bg-rose-50/30'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Tarik & letakkan foto di sini, atau{' '}
                <span className="text-emerald-700 font-semibold underline underline-offset-2">pilih dari perangkat</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Rasio standar 3x4 (portrait), otomatis disesuaikan
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
          {/* 3x4 Aspect ratio frame preview */}
          <div className="relative w-28 h-36 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-200 shrink-0">
            <img
              src={preview}
              alt="Preview Pas Foto 3x4"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-xs text-[10px] text-white text-center py-0.5 font-medium">
              3 x 4
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Foto Berhasil Dipilih
              </span>
              <p className="text-xs text-slate-600 mt-1.5">
                Foto Anda telah dipratinjau dalam rasio standar 3x4 dan siap diunggah ke arsip.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Ganti Foto
              </button>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {(fileError || error) && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{fileError || error}</span>
        </p>
      )}
    </div>
  );
};
