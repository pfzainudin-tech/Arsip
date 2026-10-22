import React, { useState, useEffect } from 'react';
import { AnggotaFull, RegistrationFormData } from '../../types';
import { Step1DataDiri } from './Step1DataDiri';
import { Step2Pendidikan } from './Step2Pendidikan';
import { Step3Organisasi } from './Step3Organisasi';
import { Step4Kaderisasi } from './Step4Kaderisasi';
import { Step5Berkas } from './Step5Berkas';
import { RegistrationSuccess } from './RegistrationSuccess';
import { createAnggota } from '../../lib/db';
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Check, 
  Loader2, 
  FileText, 
  GraduationCap, 
  Users, 
  Award, 
  Upload,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'ipnu_registration_draft_v1';

const INITIAL_FORM_DATA: RegistrationFormData = {
  nama_lengkap: '',
  alamat_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  nik: '',
  no_hp_wa: '',
  email: '',
  jabatan: 'KETUA',
  asal_kepengurusan: 'PAC. IPNU KECAMATAN PACET',
  pendidikan_list: [
    {
      id: 'p-init-1',
      jenjang: 'SMA',
      nama_sekolah: '',
      tahun_masuk: '',
      tahun_lulus: ''
    }
  ],
  organisasi_list: [],
  kaderisasi_list: [
    {
      id: 'k-init-1',
      kategori: 'Formal',
      jenjang_formal: 'MAKESTA',
      penyelenggara: '',
      lokasi: '',
      tahun: '',
      sertifikat_url: ''
    }
  ],
  pas_foto_file: null,
  pas_foto_preview: '',
  tanda_tangan_data_url: '',
  password_akses: '',
  konfirmasi_password: '',
  simpan_ke_google: true
};

interface RegistrationWizardProps {
  onCheckStatus: (nik: string) => void;
  onOpenCv: (member: AnggotaFull) => void;
  onOpenProfile?: (member: AnggotaFull) => void;
}

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ 
  onCheckStatus, 
  onOpenCv,
  onOpenProfile 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_FORM_DATA,
          ...parsed,
          pas_foto_file: null // file object cannot be serialized
        };
      }
    } catch (e) {
      console.warn('Draft load failed', e);
    }
    return INITIAL_FORM_DATA;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedMember, setSubmittedMember] = useState<AnggotaFull | null>(null);

  // Auto-save draft
  useEffect(() => {
    if (submittedMember) return;
    try {
      const { pas_foto_file, ...draftToSave } = formData;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
    } catch (e) {
      // quota exceeded or private browsing
    }
  }, [formData, submittedMember]);

  const updateFormData = (fields: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields
    }));
    // Clear relevant errors
    const updatedErrors = { ...errors };
    Object.keys(fields).forEach((key) => {
      delete updatedErrors[key];
    });
    setErrors(updatedErrors);
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.nama_lengkap.trim()) {
        newErrors.nama_lengkap = 'Nama lengkap wajib diisi.';
      }
      if (!formData.alamat_lengkap.trim()) {
        newErrors.alamat_lengkap = 'Alamat lengkap wajib diisi.';
      }
      if (!formData.tempat_lahir.trim()) {
        newErrors.tempat_lahir = 'Tempat lahir wajib diisi.';
      }
      if (!formData.tanggal_lahir) {
        newErrors.tanggal_lahir = 'Tanggal lahir wajib dipilih.';
      }

      // NIK Validation: exactly 16 digits
      if (!formData.nik) {
        newErrors.nik = 'NIK wajib diisi.';
      } else if (!/^\d{16}$/.test(formData.nik)) {
        newErrors.nik = 'NIK harus terdiri dari tepat 16 digit angka.';
      }

      // Phone WA: Starts with 08 or 628, min 10 digits
      if (!formData.no_hp_wa) {
        newErrors.no_hp_wa = 'Nomor HP/WA wajib diisi.';
      } else {
        const cleanedPhone = formData.no_hp_wa.replace(/\D/g, '');
        if (!formData.no_hp_wa.startsWith('08') && !formData.no_hp_wa.startsWith('628') && !formData.no_hp_wa.startsWith('+628')) {
          newErrors.no_hp_wa = 'Nomor WA harus diawali angka 08 (contoh: 081234567890).';
        } else if (cleanedPhone.length < 10 || cleanedPhone.length > 14) {
          newErrors.no_hp_wa = 'Panjang nomor HP/WA tidak valid (10-14 digit).';
        }
      }

      // Email Validation
      if (!formData.email) {
        newErrors.email = 'Alamat email wajib diisi.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format email tidak valid.';
      }
    }

    if (stepNumber === 2) {
      if (formData.pendidikan_list.length === 0) {
        newErrors.pendidikan = 'Harap tambahkan minimal 1 (satu) riwayat pendidikan.';
      } else {
        const hasEmptySchool = formData.pendidikan_list.some((p) => !p.nama_sekolah.trim());
        if (hasEmptySchool) {
          newErrors.pendidikan = 'Semua nama sekolah/lembaga pendidikan harus diisi.';
        }
      }
    }

    if (stepNumber === 4) {
      // Validate kaderisasi
      if (formData.kaderisasi_list.length > 0) {
        for (const [idx, k] of formData.kaderisasi_list.entries()) {
          if (k.kategori === 'Non-Formal' && !k.nama_kaderisasi_nonformal?.trim()) {
            newErrors[`kaderisasi_${idx}`] = 'Nama kegiatan kaderisasi non-formal harus diisi.';
            break;
          }
          if (!k.penyelenggara.trim() || !k.lokasi.trim() || !k.tahun.trim()) {
            newErrors[`kaderisasi_${idx}`] = 'Penyelenggara, lokasi, dan tahun kaderisasi harus diisi lengkap.';
            break;
          }
        }
      }
    }

    if (stepNumber === 5) {
      if (!formData.pas_foto_preview) {
        newErrors.pas_foto = 'Pas foto resmi 3x4 wajib diunggah.';
      }
      if (!formData.tanda_tangan_data_url) {
        newErrors.tanda_tangan = 'Tanda tangan digital wajib digoreskan.';
      }
      if (formData.password_akses && formData.password_akses.length < 6) {
        newErrors.password_akses = 'Password minimal terdiri dari 6 karakter.';
      }
      if (
        formData.password_akses &&
        formData.konfirmasi_password &&
        formData.password_akses !== formData.konfirmasi_password
      ) {
        newErrors.konfirmasi_password = 'Konfirmasi password tidak cocok dengan password yang dibuat.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setSubmitError(null);
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Ensure password_akses is set (fallback to auto-generated if blank)
    const submissionData = { ...formData };
    if (!submissionData.password_akses?.trim()) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      submissionData.password_akses = `IPNU-${randomSuffix}`;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createAnggota(submissionData);
      if (result.success && result.data) {
        setSubmittedMember(result.data);
        localStorage.removeItem(DRAFT_STORAGE_KEY);

        // Save credential to Google Password Manager via standard API if available
        if (submissionData.simpan_ke_google !== false && typeof window !== 'undefined' && 'PasswordCredential' in window && navigator.credentials) {
          try {
            const cred = new (window as any).PasswordCredential({
              id: result.data.nama_lengkap,
              password: result.data.password_akses,
              name: result.data.nama_lengkap
            });
            await navigator.credentials.store(cred);
          } catch (credErr) {
            console.log('Google Credential Store notice:', credErr);
          }
        }
      } else {
        setSubmitError(result.error || 'Terjadi kesalahan saat menyimpan data pendaftaran.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Gagal mengirim pendaftaran. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedMember(null);
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
    setErrors({});
    setSubmitError(null);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // If already submitted successfully, render success view
  if (submittedMember) {
    return (
      <RegistrationSuccess
        member={submittedMember}
        onReset={handleReset}
        onCheckStatus={onCheckStatus}
        onOpenCv={onOpenCv}
        onOpenProfile={onOpenProfile}
      />
    );
  }

  const steps = [
    { number: 1, title: 'Data Diri', icon: FileText, desc: 'Identitas & KTP' },
    { number: 2, title: 'Pendidikan', icon: GraduationCap, desc: 'Sekolah & Kampus' },
    { number: 3, title: 'Organisasi', icon: Users, desc: 'Pengalaman Organisasi' },
    { number: 4, title: 'Kaderisasi', icon: Award, desc: 'Formal & Non-Formal' },
    { number: 5, title: 'Berkas & Akun', icon: Upload, desc: 'Foto, TTD & Password' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isPassed = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <button
                  type="button"
                  onClick={() => {
                    // Only allow navigating back to previously visited steps
                    if (s.number < currentStep) setCurrentStep(s.number);
                  }}
                  className={`flex flex-col items-center group relative text-center focus:outline-hidden ${
                    s.number < currentStep ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                      isPassed
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                        ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-100 font-extrabold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <span
                    className={`mt-1.5 text-[11px] sm:text-xs font-semibold hidden md:block ${
                      isCurrent
                        ? 'text-emerald-800'
                        : isPassed
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1.5 sm:mx-3 rounded-full transition-all ${
                      currentStep > s.number ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Label on Mobile */}
        <div className="md:hidden mt-3 text-center border-t border-slate-100 pt-2">
          <span className="text-xs font-bold text-emerald-800">
            Langkah {currentStep} dari 5: {steps[currentStep - 1].title}
          </span>
          <span className="text-[11px] text-slate-500 block">
            ({steps[currentStep - 1].desc})
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-6">
        {submitError && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menyimpan Data</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1DataDiri
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <Step2Pendidikan
            pendidikanList={formData.pendidikan_list}
            onChange={(list) => updateFormData({ pendidikan_list: list })}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <Step3Organisasi
            organisasiList={formData.organisasi_list}
            onChange={(list) => updateFormData({ organisasi_list: list })}
            errors={errors}
          />
        )}

        {currentStep === 4 && (
          <Step4Kaderisasi
            kaderisasiList={formData.kaderisasi_list}
            onChange={(list) => updateFormData({ kaderisasi_list: list })}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <Step5Berkas
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}

        {/* Navigation Buttons */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset formulir dan hapus draf yang tersimpan?')) {
                  handleReset();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium py-2 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Draf</span>
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Arsip...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pendaftaran</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
