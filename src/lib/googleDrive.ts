import { getAccessToken } from './googleAuth';
import { AnggotaFull } from '../types';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

export const getOrCreateIpnuFolder = async (): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung. Silakan login terlebih dahulu.');

  const folderName = 'Arsip Digital IPNU';
  
  // Search if folder exists
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  const folder = await createRes.json();
  return folder.id;
};

export const listIpnuDriveFiles = async (): Promise<DriveItem[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung.');

  try {
    const folderId = await getOrCreateIpnuFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&orderBy=createdTime desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('Error listing Drive files:', err);
    return [];
  }
};

export const uploadCvToDrive = async (
  member: AnggotaFull,
  cvHtmlContent: string
): Promise<{ id: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung.');

  const folderId = await getOrCreateIpnuFolder();
  const fileName = `CV_${member.jabatan || 'Anggota'}_${member.nama_lengkap.replace(/\s+/g, '_')}_${member.nik}.html`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'text/html'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([cvHtmlContent], { type: 'text/html' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal mengunggah berkas CV ke Google Drive.');
  }

  return { id: data.id, webViewLink: data.webViewLink };
};

export const uploadCredentialTicketToDrive = async (
  member: AnggotaFull
): Promise<{ id: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung. Silakan hubungkan akun Google terlebih dahulu.');

  const folderId = await getOrCreateIpnuFolder();
  const cleanName = member.nama_lengkap.replace(/\s+/g, '_');
  const fileName = `Kredensial_Akun_IPNU_${cleanName}_${member.nik}.txt`;

  const ticketContent = `=====================================================
ARSIP DIGITAL IPNU - TIKET KREDENSIAL AKUN ANGGOTA
=====================================================
Nama Lengkap / User : ${member.nama_lengkap}
Password Akses      : ${member.password_akses || 'IPNU-195401'}
NIK                 : ${member.nik}
Email               : ${member.email}
No. HP / WhatsApp   : ${member.no_hp_wa}
Jabatan             : ${member.jabatan || 'ANGGOTA'}
Asal Kepengurusan   : ${member.asal_kepengurusan || 'PAC. IPNU KECAMATAN PACET'}
Status Pendaftaran  : ${member.status_verifikasi}
Tanggal Didaftarkan : ${member.created_at || new Date().toLocaleString('id-ID')}
=====================================================
Panduan Masuk Profil Mandiri:
1. Buka aplikasi Arsip Digital IPNU
2. Klik tombol 'Masuk Profil' di pojok atas
3. Masukkan Nama Lengkap atau NIK dan Password Akses di atas
4. Anda dapat memperbarui riwayat organisasi, pendidikan, kaderisasi,
   serta mencetak KTA dan Dokumen CV resmi.
=====================================================`;

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'text/plain'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([ticketContent], { type: 'text/plain' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal menyimpan tiket kredensial ke Google Drive.');
  }

  return { id: data.id, webViewLink: data.webViewLink };
};

export const backupDatabaseToDrive = async (
  members: AnggotaFull[]
): Promise<{ id: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung.');

  const folderId = await getOrCreateIpnuFolder();
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `Backup_Database_IPNU_${timestamp}.json`;
  const content = JSON.stringify(members, null, 2);

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal mencadangkan data ke Google Drive.');
  }

  return { id: data.id, webViewLink: data.webViewLink };
};

export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal menghapus berkas dari Google Drive.');
  }

  return true;
};
