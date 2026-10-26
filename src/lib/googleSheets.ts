import { getAccessToken } from './googleAuth';
import { getOrCreateIpnuFolder } from './googleDrive';
import { AnggotaFull } from '../types';

export interface SheetSyncResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowCount: number;
  syncedAt: string;
}

export const LAST_SHEETS_SYNC_KEY = 'ipnu_last_sheets_sync';

export const getLastSheetsBackup = (): SheetSyncResult | null => {
  try {
    const raw = localStorage.getItem(LAST_SHEETS_SYNC_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading last sheets backup:', e);
    return null;
  }
};

export const saveLastSheetsBackup = (result: SheetSyncResult) => {
  try {
    localStorage.setItem(LAST_SHEETS_SYNC_KEY, JSON.stringify(result));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ipnu_sheets_backup_updated', { detail: result }));
    }
  } catch (e) {
    console.error('Error saving last sheets backup:', e);
  }
};

export function getBackupStatus(lastBackup: SheetSyncResult | null): {
  isOverdue: boolean;
  daysAgo: number | null;
  formattedDate: string;
  relativeText: string;
} {
  if (!lastBackup || !lastBackup.syncedAt) {
    return {
      isOverdue: true,
      daysAgo: null,
      formattedDate: 'Belum pernah',
      relativeText: 'Belum pernah dicadangkan'
    };
  }

  const syncDate = new Date(lastBackup.syncedAt);
  const now = new Date();
  const diffMs = now.getTime() - syncDate.getTime();
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const isOverdue = daysAgo >= 7;

  let relativeText = '';
  if (daysAgo === 0) {
    relativeText = 'Hari ini';
  } else if (daysAgo === 1) {
    relativeText = '1 hari yang lalu';
  } else {
    relativeText = `${daysAgo} hari yang lalu`;
  }

  const formattedDate = syncDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    isOverdue,
    daysAgo,
    formattedDate,
    relativeText
  };
}

export const syncMembersToGoogleSheet = async (
  members: AnggotaFull[]
): Promise<SheetSyncResult> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Akses Google belum terhubung. Silakan login terlebih dahulu.');

  const folderId = await getOrCreateIpnuFolder();
  const title = `Database Anggota IPNU - ${new Date().getFullYear()}`;

  // 1. Create a new Google Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'Data Anggota',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  const spreadsheet = await createRes.json();
  if (!createRes.ok) {
    throw new Error(spreadsheet.error?.message || 'Gagal membuat Google Spreadsheet.');
  }

  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Move spreadsheet into "Arsip Digital IPNU" folder in Google Drive
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.warn('Could not move spreadsheet to folder:', err);
  }

  // 2. Prepare Header and Rows Data
  const headers = [
    'No',
    'NIK (16 Digit)',
    'Nama Lengkap',
    'Jabatan',
    'Asal Kepengurusan',
    'Tempat Lahir',
    'Tanggal Lahir',
    'No. WhatsApp',
    'Alamat Email',
    'Alamat Lengkap',
    'Status Verifikasi',
    'Pendidikan Terakhir',
    'Kaderisasi Formal Terakhir',
    'Kaderisasi Non-Formal',
    'Tanggal Pendaftaran'
  ];

  const rows = members.map((m, idx) => {
    const lastPendidikan = m.riwayat_pendidikan && m.riwayat_pendidikan.length > 0
      ? `${m.riwayat_pendidikan[m.riwayat_pendidikan.length - 1].jenjang} - ${m.riwayat_pendidikan[m.riwayat_pendidikan.length - 1].nama_sekolah}`
      : '-';

    const formalKad = m.riwayat_kaderisasi
      ?.filter((k) => k.kategori === 'Formal')
      ?.map((k) => `${k.jenjang_formal} (${k.tahun})`)
      ?.join('; ') || '-';

    const nonFormalKad = m.riwayat_kaderisasi
      ?.filter((k) => k.kategori === 'Non-Formal')
      ?.map((k) => `${k.nama_kaderisasi_nonformal} (${k.tahun})`)
      ?.join('; ') || '-';

    return [
      idx + 1,
      `'${m.nik}`, // prefix with single quote to preserve 16 digits text format in Sheets
      m.nama_lengkap,
      m.jabatan || 'ANGGOTA',
      m.asal_kepengurusan || 'PAC. IPNU KECAMATAN PACET',
      m.tempat_lahir,
      m.tanggal_lahir,
      m.no_hp_wa,
      m.email,
      m.alamat_lengkap,
      m.status_verifikasi,
      lastPendidikan,
      formalKad,
      nonFormalKad,
      new Date(m.created_at || Date.now()).toLocaleDateString('id-ID')
    ];
  });

  const allValues = [headers, ...rows];

  // 3. Write data to sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Data Anggota'!A1:O${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: allValues
      })
    }
  );

  if (!updateRes.ok) {
    const updateError = await updateRes.json();
    throw new Error(updateError.error?.message || 'Gagal mengisi data anggota ke spreadsheet.');
  }

  // 4. Format header row with IPNU Green background and white bold text
  try {
    const sheetId = spreadsheet.sheets?.[0]?.properties?.sheetId || 0;
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.0,
                    green: 0.53,
                    blue: 0.27 // IPNU green approx #008844
                  },
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 10,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 15
              }
            }
          }
        ]
      })
    });
  } catch (formatErr) {
    console.warn('Header styling skipped:', formatErr);
  }

  const syncResult: SheetSyncResult = {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: members.length,
    syncedAt: new Date().toISOString()
  };

  saveLastSheetsBackup(syncResult);

  return syncResult;
};
