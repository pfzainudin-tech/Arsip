// Settings store for Organization Branding, Logo, and CV Layout

export interface OrgSettings {
  logoUrl: string; // custom data URL, image URL, or default SVG
  tingkatKepengurusan: string; // e.g. "PIMPINAN ANAK CABANG"
  namaOrganisasi: string; // e.g. "IKATAN PELAJAR NAHDLATUL ULAMA"
  namaDaerah: string; // e.g. "KECAMATAN PACET"
  alamatSekretariat: string;
  kontakSekretariat: string;
  emailSekretariat: string;
  motto: string;
  // CV Layout preferences
  cvFontFamily: 'serif' | 'sans';
  cvSpacing: 'compact' | 'normal' | 'relaxed';
  cvPhotoSize: '4x6' | '3x4';
  titimangsaKota: string;
}

// Official IPNU Emblem (Kongres 2018 / Hasil Ketetapan Resmi)
export const DEFAULT_OFFICIAL_IPNU_LOGO = '/assets/aistudio/LOGO_IPNU_RESMI_KONGRES_2018_357ea3ef.png';

export const DEFAULT_ORG_SETTINGS: OrgSettings = {
  logoUrl: DEFAULT_OFFICIAL_IPNU_LOGO,
  tingkatKepengurusan: 'PIMPINAN ANAK CABANG',
  namaOrganisasi: 'IKATAN PELAJAR NAHDLATUL ULAMA',
  namaDaerah: 'KECAMATAN PACET',
  alamatSekretariat: 'Graha MWCNU PACET Lt.2 Jl.Raya Pacet No.270 61374',
  kontakSekretariat: '0858-1596-1804 – 0831-1950-7285',
  emailSekretariat: 'pelajarnupacet@gmail.com',
  motto: 'BELAJAR, BERJUANG, BERTAQWA',
  cvFontFamily: 'serif',
  cvSpacing: 'normal',
  cvPhotoSize: '4x6',
  titimangsaKota: 'Mojokerto'
};

const STORAGE_KEY = 'ipnu_org_layout_settings_v1';

// In-memory subscribers for live UI updates
type Listener = (settings: OrgSettings) => void;
const listeners: Listener[] = [];

export const getOrgSettings = (): OrgSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Upgrade legacy SVG logo to new official high-resolution PNG logo
      if (!parsed.logoUrl || parsed.logoUrl.startsWith('data:image/svg+xml')) {
        parsed.logoUrl = DEFAULT_OFFICIAL_IPNU_LOGO;
      }
      return {
        ...DEFAULT_ORG_SETTINGS,
        ...parsed
      };
    }
  } catch (e) {
    console.warn('Failed reading org settings from storage', e);
  }
  return DEFAULT_ORG_SETTINGS;
};

export const saveOrgSettings = (newSettings: Partial<OrgSettings>): OrgSettings => {
  const current = getOrgSettings();
  const updated: OrgSettings = {
    ...current,
    ...newSettings
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving org settings to storage', e);
  }
  // Notify listeners
  listeners.forEach(fn => fn(updated));
  return updated;
};

export const resetOrgSettings = (): OrgSettings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  listeners.forEach(fn => fn(DEFAULT_ORG_SETTINGS));
  return DEFAULT_ORG_SETTINGS;
};

export const subscribeOrgSettings = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};
