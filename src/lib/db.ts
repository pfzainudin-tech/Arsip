import { AnggotaFull, RegistrationFormData, StatusVerifikasi } from '../types';
import { INITIAL_MOCK_MEMBERS } from './mockData';
import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY = 'ipnu_arsip_members_v1';

// Initialize local storage with mock data if empty
const getLocalMembers = (): AnggotaFull[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MEMBERS));
      return INITIAL_MOCK_MEMBERS;
    }
    const parsed: AnggotaFull[] = JSON.parse(raw);
    // Ensure every member has password_akses & foto_ktp_url
    let modified = false;
    const sanitized = parsed.map((m, idx) => {
      let copy = { ...m };
      if (!copy.password_akses) {
        copy.password_akses = `IPNU-${195400 + idx + 1}`;
        modified = true;
      }
      if (!copy.foto_ktp_url) {
        copy.foto_ktp_url = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
        modified = true;
      }
      return copy;
    });
    if (modified) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return INITIAL_MOCK_MEMBERS;
  }
};

const saveLocalMembers = (members: AnggotaFull[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

// Convert data URL or File to Supabase Storage or Blob URL
const uploadFileToSupabase = async (
  bucketName: string, 
  filePath: string, 
  file: File | Blob
): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'image/png'
      });

    if (error) {
      console.warn(`Supabase storage upload error in ${bucketName}:`, error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn(`Exception during file upload to ${bucketName}:`, err);
    return null;
  }
};

// Base64 helper for local signatures or files
const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

export const getAllAnggota = async (): Promise<AnggotaFull[]> => {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: anggotaList, error } = await supabase
        .from('anggota')
        .select(`
          *,
          riwayat_pendidikan (*),
          riwayat_organisasi (*),
          riwayat_kaderisasi (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && anggotaList && anggotaList.length > 0) {
        return anggotaList as AnggotaFull[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage:', e);
    }
  }

  return getLocalMembers();
};

export const getAnggotaByNik = async (nik: string): Promise<AnggotaFull | null> => {
  const members = await getAllAnggota();
  return members.find(m => m.nik.trim() === nik.trim()) || null;
};

export const checkNikUnique = async (nik: string, excludeId?: string): Promise<boolean> => {
  const members = await getAllAnggota();
  const existing = members.find(m => m.nik.trim() === nik.trim() && m.id !== excludeId);
  return !existing;
};

export const checkEmailUnique = async (email: string, excludeId?: string): Promise<boolean> => {
  const members = await getAllAnggota();
  const existing = members.find(
    m => m.email.trim().toLowerCase() === email.trim().toLowerCase() && m.id !== excludeId
  );
  return !existing;
};

export const createAnggota = async (
  formData: RegistrationFormData
): Promise<{ success: boolean; data?: AnggotaFull; error?: string }> => {
  // Validate unique NIK & Email
  const isNikUnique = await checkNikUnique(formData.nik);
  if (!isNikUnique) {
    return { success: false, error: 'NIK 16 digit sudah terdaftar dalam sistem.' };
  }

  const isEmailUnique = await checkEmailUnique(formData.email);
  if (!isEmailUnique) {
    return { success: false, error: 'Alamat email sudah terdaftar dalam sistem.' };
  }

  const newId = crypto.randomUUID ? crypto.randomUUID() : `ipnu-${Date.now()}`;
  const timestamp = new Date().toISOString();

  let finalFotoUrl = formData.pas_foto_preview;
  let finalTtdUrl = formData.tanda_tangan_data_url;

  const supabase = getSupabaseClient();

  // Try uploading to Supabase Storage if configured
  if (supabase) {
    try {
      if (formData.pas_foto_file) {
        const ext = formData.pas_foto_file.name.split('.').pop() || 'jpg';
        const fotoPath = `${newId}/pas-foto-${Date.now()}.${ext}`;
        const uploadedUrl = await uploadFileToSupabase('pas-foto', fotoPath, formData.pas_foto_file);
        if (uploadedUrl) finalFotoUrl = uploadedUrl;
      }

      if (formData.tanda_tangan_data_url) {
        const ttdBlob = dataUrlToBlob(formData.tanda_tangan_data_url);
        const ttdPath = `${newId}/tanda-tangan-${Date.now()}.png`;
        const uploadedTtdUrl = await uploadFileToSupabase('tanda-tangan', ttdPath, ttdBlob);
        if (uploadedTtdUrl) finalTtdUrl = uploadedTtdUrl;
      }
    } catch (err) {
      console.warn('Storage upload error, continuing with local data URLs:', err);
    }
  }

  // Determine Jabatan & Asal Kepengurusan
  const latestOrg = formData.organisasi_list[formData.organisasi_list.length - 1];
  const derivedJabatan = formData.jabatan?.trim().toUpperCase() || 
    (latestOrg?.jabatan ? latestOrg.jabatan.trim().toUpperCase() : 'ANGGOTA');
  const derivedAsal = formData.asal_kepengurusan?.trim().toUpperCase() || 
    (latestOrg?.nama_organisasi ? latestOrg.nama_organisasi.trim().toUpperCase() : 'PAC. IPNU KECAMATAN PACET');

  // Use custom password from registration form if provided, otherwise auto-generate
  const customPassword = formData.password_akses?.trim();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const autoPassword = `IPNU-${randomSuffix}`;
  const finalPassword = customPassword || autoPassword;

  const newMember: AnggotaFull = {
    id: newId,
    nama_lengkap: formData.nama_lengkap.trim().toUpperCase(),
    alamat_lengkap: formData.alamat_lengkap.trim(),
    tempat_lahir: formData.tempat_lahir.trim(),
    tanggal_lahir: formData.tanggal_lahir,
    nik: formData.nik.trim(),
    no_hp_wa: formData.no_hp_wa.trim(),
    email: formData.email.trim().toLowerCase(),
    jabatan: derivedJabatan,
    asal_kepengurusan: derivedAsal,
    tingkat_kepengurusan: formData.tingkat_kepengurusan || undefined,
    pas_foto_url: finalFotoUrl,
    foto_ktp_url: formData.foto_ktp_preview || '',
    tanda_tangan_url: finalTtdUrl,
    password_akses: finalPassword,
    status_verifikasi: 'Menunggu Verifikasi',
    catatan_verifikasi: '',
    created_at: timestamp,
    updated_at: timestamp,
    riwayat_pendidikan: formData.pendidikan_list.map((p, idx) => ({
      ...p,
      id: p.id || `pen-${newId}-${idx}`,
      anggota_id: newId
    })),
    riwayat_organisasi: formData.organisasi_list.map((o, idx) => ({
      ...o,
      id: o.id || `org-${newId}-${idx}`,
      anggota_id: newId
    })),
    riwayat_kaderisasi: formData.kaderisasi_list.map((k, idx) => ({
      ...k,
      id: k.id || `kad-${newId}-${idx}`,
      anggota_id: newId
    }))
  };

  // If Supabase is available, insert into database
  if (supabase) {
    try {
      const { error: anggotaError } = await supabase.from('anggota').insert([
        {
          id: newMember.id,
          nama_lengkap: newMember.nama_lengkap,
          alamat_lengkap: newMember.alamat_lengkap,
          tempat_lahir: newMember.tempat_lahir,
          tanggal_lahir: newMember.tanggal_lahir,
          nik: newMember.nik,
          no_hp_wa: newMember.no_hp_wa,
          email: newMember.email,
          jabatan: newMember.jabatan,
          asal_kepengurusan: newMember.asal_kepengurusan,
          pas_foto_url: newMember.pas_foto_url,
          tanda_tangan_url: newMember.tanda_tangan_url,
          status_verifikasi: newMember.status_verifikasi,
          catatan_verifikasi: '',
          created_at: newMember.created_at,
          updated_at: newMember.updated_at
        }
      ]);

      if (!anggotaError) {
        if (newMember.riwayat_pendidikan.length > 0) {
          await supabase.from('riwayat_pendidikan').insert(
            newMember.riwayat_pendidikan.map(p => ({
              anggota_id: newMember.id,
              jenjang: p.jenjang,
              nama_sekolah: p.nama_sekolah,
              tahun_masuk: p.tahun_masuk,
              tahun_lulus: p.tahun_lulus
            }))
          );
        }

        if (newMember.riwayat_organisasi.length > 0) {
          await supabase.from('riwayat_organisasi').insert(
            newMember.riwayat_organisasi.map(o => ({
              anggota_id: newMember.id,
              nama_organisasi: o.nama_organisasi,
              jabatan: o.jabatan,
              tahun_mulai: o.tahun_mulai,
              tahun_selesai: o.tahun_selesai
            }))
          );
        }

        if (newMember.riwayat_kaderisasi.length > 0) {
          await supabase.from('riwayat_kaderisasi').insert(
            newMember.riwayat_kaderisasi.map(k => ({
              anggota_id: newMember.id,
              kategori: k.kategori,
              jenjang_formal: k.jenjang_formal || null,
              nama_kaderisasi_nonformal: k.nama_kaderisasi_nonformal || null,
              penyelenggara: k.penyelenggara,
              lokasi: k.lokasi,
              tahun: k.tahun,
              sertifikat_url: k.sertifikat_url || null
            }))
          );
        }
      } else {
        console.warn('Supabase DB error, saving to local store:', anggotaError.message);
      }
    } catch (err) {
      console.warn('Exception during Supabase insert:', err);
    }
  }

  // Always update local storage so data is immediately available
  const currentMembers = getLocalMembers();
  saveLocalMembers([newMember, ...currentMembers]);

  return { success: true, data: newMember };
};

export const updateStatusVerifikasi = async (
  id: string,
  status: StatusVerifikasi,
  catatan?: string
): Promise<boolean> => {
  const supabase = getSupabaseClient();
  const timestamp = new Date().toISOString();

  if (supabase) {
    try {
      await supabase
        .from('anggota')
        .update({
          status_verifikasi: status,
          catatan_verifikasi: catatan || '',
          updated_at: timestamp
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Error updating status in Supabase:', err);
    }
  }

  // Update local
  const currentMembers = getLocalMembers();
  const updated = currentMembers.map(m => {
    if (m.id === id) {
      return {
        ...m,
        status_verifikasi: status,
        catatan_verifikasi: catatan !== undefined ? catatan : m.catatan_verifikasi,
        updated_at: timestamp
      };
    }
    return m;
  });
  saveLocalMembers(updated);

  return true;
};

export const updateAnggotaFull = async (
  id: string,
  updatedData: Partial<AnggotaFull>
): Promise<{ success: boolean; data?: AnggotaFull; error?: string }> => {
  const currentMembers = getLocalMembers();
  const existingIndex = currentMembers.findIndex(m => m.id === id);

  if (existingIndex === -1) {
    return { success: false, error: 'Data anggota tidak ditemukan.' };
  }

  const existingMember = currentMembers[existingIndex];
  const timestamp = new Date().toISOString();

  // If email or nik is being updated, check uniqueness
  if (updatedData.nik && updatedData.nik !== existingMember.nik) {
    const isNikUnique = await checkNikUnique(updatedData.nik, id);
    if (!isNikUnique) {
      return { success: false, error: 'NIK sudah terdaftar pada anggota lain.' };
    }
  }

  if (updatedData.email && updatedData.email !== existingMember.email) {
    const isEmailUnique = await checkEmailUnique(updatedData.email, id);
    if (!isEmailUnique) {
      return { success: false, error: 'Email sudah terdaftar pada anggota lain.' };
    }
  }

  const updatedMember: AnggotaFull = {
    ...existingMember,
    ...updatedData,
    riwayat_pendidikan: updatedData.riwayat_pendidikan !== undefined 
      ? updatedData.riwayat_pendidikan 
      : existingMember.riwayat_pendidikan,
    riwayat_organisasi: updatedData.riwayat_organisasi !== undefined 
      ? updatedData.riwayat_organisasi 
      : existingMember.riwayat_organisasi,
    riwayat_kaderisasi: updatedData.riwayat_kaderisasi !== undefined 
      ? updatedData.riwayat_kaderisasi 
      : existingMember.riwayat_kaderisasi,
    updated_at: timestamp
  };

  // Update in Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('anggota')
        .update({
          nama_lengkap: updatedMember.nama_lengkap,
          alamat_lengkap: updatedMember.alamat_lengkap,
          tempat_lahir: updatedMember.tempat_lahir,
          tanggal_lahir: updatedMember.tanggal_lahir,
          nik: updatedMember.nik,
          no_hp_wa: updatedMember.no_hp_wa,
          email: updatedMember.email,
          jabatan: updatedMember.jabatan,
          asal_kepengurusan: updatedMember.asal_kepengurusan,
          pas_foto_url: updatedMember.pas_foto_url,
          tanda_tangan_url: updatedMember.tanda_tangan_url,
          status_verifikasi: updatedMember.status_verifikasi,
          catatan_verifikasi: updatedMember.catatan_verifikasi || '',
          updated_at: timestamp
        })
        .eq('id', id);

      // If riwayat_pendidikan was updated, sync with Supabase
      if (updatedData.riwayat_pendidikan !== undefined) {
        await supabase.from('riwayat_pendidikan').delete().eq('anggota_id', id);
        if (updatedMember.riwayat_pendidikan.length > 0) {
          await supabase.from('riwayat_pendidikan').insert(
            updatedMember.riwayat_pendidikan.map(p => ({
              anggota_id: id,
              jenjang: p.jenjang,
              nama_sekolah: p.nama_sekolah,
              tahun_masuk: p.tahun_masuk,
              tahun_lulus: p.tahun_lulus
            }))
          );
        }
      }

      // If riwayat_organisasi was updated, sync with Supabase
      if (updatedData.riwayat_organisasi !== undefined) {
        await supabase.from('riwayat_organisasi').delete().eq('anggota_id', id);
        if (updatedMember.riwayat_organisasi.length > 0) {
          await supabase.from('riwayat_organisasi').insert(
            updatedMember.riwayat_organisasi.map(o => ({
              anggota_id: id,
              nama_organisasi: o.nama_organisasi,
              jabatan: o.jabatan,
              tahun_mulai: o.tahun_mulai,
              tahun_selesai: o.tahun_selesai
            }))
          );
        }
      }

      // If riwayat_kaderisasi was updated, sync with Supabase
      if (updatedData.riwayat_kaderisasi !== undefined) {
        await supabase.from('riwayat_kaderisasi').delete().eq('anggota_id', id);
        if (updatedMember.riwayat_kaderisasi.length > 0) {
          await supabase.from('riwayat_kaderisasi').insert(
            updatedMember.riwayat_kaderisasi.map(k => ({
              anggota_id: id,
              kategori: k.kategori,
              jenjang_formal: k.jenjang_formal || null,
              nama_kaderisasi_nonformal: k.nama_kaderisasi_nonformal || null,
              penyelenggara: k.penyelenggara,
              lokasi: k.lokasi,
              tahun: k.tahun,
              sertifikat_url: k.sertifikat_url || null
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Exception during Supabase update:', err);
    }
  }

  // Update local storage
  currentMembers[existingIndex] = updatedMember;
  saveLocalMembers(currentMembers);

  return { success: true, data: updatedMember };
};

export const deleteAnggota = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('anggota').delete().eq('id', id);
    } catch (e) {
      console.warn('Error deleting from Supabase:', e);
    }
  }

  const currentMembers = getLocalMembers();
  saveLocalMembers(currentMembers.filter(m => m.id !== id));
  return true;
};

export const resetToDemoData = () => {
  saveLocalMembers(INITIAL_MOCK_MEMBERS);
};

export const verifyMemberLogin = async (
  namaOrIdentifier: string,
  passwordAkses: string
): Promise<{ success: boolean; member?: AnggotaFull; error?: string }> => {
  const members = await getAllAnggota();
  const cleanInput = namaOrIdentifier.trim();
  const cleanUpper = cleanInput.toUpperCase();
  const cleanLower = cleanInput.toLowerCase();
  const rawPass = passwordAkses.trim();
  const upperPass = rawPass.toUpperCase();

  if (!cleanInput) {
    return { success: false, error: 'Silakan masukkan Nama Lengkap atau NIK Anda.' };
  }
  if (!rawPass) {
    return { success: false, error: 'Silakan masukkan Password Akses Anda.' };
  }

  const found = members.find(m => {
    const mNama = m.nama_lengkap.trim().toUpperCase();
    const mPass = (m.password_akses || '').trim();
    const mNik = m.nik.trim();
    const mEmail = (m.email || '').trim().toLowerCase();

    const isUserMatch = (mNama === cleanUpper) || (mNik === cleanInput) || (mEmail === cleanLower);
    const isPassMatch = (mPass === rawPass) || (mPass.toUpperCase() === upperPass) || (mNik === rawPass);

    return isUserMatch && isPassMatch;
  });

  if (found) {
    return { success: true, member: found };
  }

  // Check if identifier exists but password was wrong
  const existsUser = members.find(m => {
    const mNama = m.nama_lengkap.trim().toUpperCase();
    const mNik = m.nik.trim();
    const mEmail = (m.email || '').trim().toLowerCase();
    return (mNama === cleanUpper) || (mNik === cleanInput) || (mEmail === cleanLower);
  });

  if (existsUser) {
    return { 
      success: false, 
      error: `Password salah untuk akun "${existsUser.nama_lengkap}". Silakan periksa kembali password akun yang Anda buat saat pendaftaran.` 
    };
  }

  return { 
    success: false, 
    error: `Akun "${cleanInput}" tidak ditemukan. Pastikan nama lengkap atau NIK Anda sudah terdaftar.` 
  };
};


