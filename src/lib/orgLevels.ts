import { AnggotaFull } from '../types';

export interface OrgLevelMeta {
  code: string;
  name: string;
  shortLabel: string;
  scope: string;
  description: string;
  badgeClass: string;
  activeClass: string;
  accentColor: string;
}

export const ORG_LEVELS_DEFINITION: OrgLevelMeta[] = [
  {
    code: 'PP',
    name: 'Pimpinan Pusat (PP)',
    shortLabel: 'PP',
    scope: 'Tingkat Nasional',
    description: 'Pimpinan Pusat IPNU Republik Indonesia',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    activeClass: 'border-amber-500 bg-amber-50 ring-2 ring-amber-400/30',
    accentColor: '#d97706'
  },
  {
    code: 'PW',
    name: 'Pimpinan Wilayah (PW)',
    shortLabel: 'PW',
    scope: 'Tingkat Provinsi',
    description: 'Pimpinan Wilayah IPNU Tingkat Provinsi',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    activeClass: 'border-purple-500 bg-purple-50 ring-2 ring-purple-400/30',
    accentColor: '#9333ea'
  },
  {
    code: 'PC',
    name: 'Pimpinan Cabang (PC)',
    shortLabel: 'PC',
    scope: 'Tingkat Kab / Kota',
    description: 'Pimpinan Cabang Tingkat Kabupaten atau Kota',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    activeClass: 'border-blue-500 bg-blue-50 ring-2 ring-blue-400/30',
    accentColor: '#2563eb'
  },
  {
    code: 'PAC',
    name: 'Pimpinan Anak Cabang (PAC)',
    shortLabel: 'PAC',
    scope: 'Tingkat Kecamatan',
    description: 'Pimpinan Anak Cabang Tingkat Kecamatan',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    activeClass: 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30',
    accentColor: '#059669'
  },
  {
    code: 'PR',
    name: 'Pimpinan Ranting (PR)',
    shortLabel: 'PR',
    scope: 'Tingkat Desa / Kelurahan',
    description: 'Pimpinan Ranting Tingkat Desa atau Kelurahan',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    activeClass: 'border-teal-500 bg-teal-50 ring-2 ring-teal-400/30',
    accentColor: '#0d9488'
  },
  {
    code: 'PK',
    name: 'Pimpinan Komisariat (PK)',
    shortLabel: 'PK',
    scope: 'Sekolah / Pesantren',
    description: 'Pimpinan Komisariat Sekolah, MTs/SMP, MA/SMA/SMK, & Pesantren',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    activeClass: 'border-sky-500 bg-sky-50 ring-2 ring-sky-400/30',
    accentColor: '#0284c7'
  },
  {
    code: 'PKPT',
    name: 'Pimpinan Komisariat Perguruan Tinggi (PKPT)',
    shortLabel: 'PKPT',
    scope: 'Kampus / Universitas',
    description: 'Pimpinan Komisariat Perguruan Tinggi & Akademi',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    activeClass: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400/30',
    accentColor: '#4f46e5'
  },
  {
    code: 'PAR',
    name: 'Pimpinan Anak Ranting (PAR)',
    shortLabel: 'PAR',
    scope: 'Dusun / RW / Masjid',
    description: 'Pimpinan Anak Ranting Tingkat Dusun atau RW',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-300',
    activeClass: 'border-stone-500 bg-stone-50 ring-2 ring-stone-400/30',
    accentColor: '#78716c'
  }
];

/**
 * Resolves the organizational management level code for a given member.
 * Checks member.tingkat_kepengurusan first, then inspects asal_kepengurusan,
 * and falls back to inspecting riwayat_organisasi.
 */
export function resolveMemberOrgLevel(member: Partial<AnggotaFull>): string {
  // 1. Direct explicit tingkat_kepengurusan
  if (member.tingkat_kepengurusan) {
    const raw = member.tingkat_kepengurusan.trim().toUpperCase();
    if (raw.includes('PKPT')) return 'PKPT';
    if (raw.includes('PAC') || raw.includes('ANAK CABANG')) return 'PAC';
    if (raw.includes('PAR') || raw.includes('ANAK RANTING')) return 'PAR';
    if (raw.includes('PR') || raw.includes('RANTING') || raw.includes('DESA')) return 'PR';
    if (raw.includes('PK') || raw.includes('KOMISARIAT')) return 'PK';
    if (raw.includes('PC') || raw.includes('CABANG')) return 'PC';
    if (raw.includes('PW') || raw.includes('WILAYAH')) return 'PW';
    if (raw.includes('PP') || raw.includes('PUSAT')) return 'PP';
  }

  // 2. Infer from asal_kepengurusan string
  const asal = (member.asal_kepengurusan || '').toUpperCase();
  if (asal.includes('PKPT')) return 'PKPT';
  if (asal.includes('PAC') || asal.includes('ANAK CABANG')) return 'PAC';
  if (asal.includes('PAR') || asal.includes('ANAK RANTING')) return 'PAR';
  if (asal.includes('PR') || asal.includes('RANTING') || asal.includes('DESA') || asal.includes('KELURAHAN')) return 'PR';
  if (asal.includes('PK') || asal.includes('KOMISARIAT') || asal.includes('SMK') || asal.includes('SMA') || asal.includes('MA ') || asal.includes('MTS') || asal.includes('PESANTREN') || asal.includes('PONDOK')) return 'PK';
  if (asal.includes('PC') || asal.includes('CABANG') || asal.includes('KABUPATEN') || asal.includes('KOTA')) return 'PC';
  if (asal.includes('PW') || asal.includes('WILAYAH') || asal.includes('PROVINSI')) return 'PW';
  if (asal.includes('PP') || asal.includes('PUSAT') || asal.includes('NASIONAL')) return 'PP';

  // 3. Infer from riwayat_organisasi if available
  if (member.riwayat_organisasi && member.riwayat_organisasi.length > 0) {
    for (const org of member.riwayat_organisasi) {
      const orgName = (org.nama_organisasi || '').toUpperCase();
      if (orgName.includes('PKPT')) return 'PKPT';
      if (orgName.includes('PAC') || orgName.includes('ANAK CABANG')) return 'PAC';
      if (orgName.includes('PAR') || orgName.includes('ANAK RANTING')) return 'PAR';
      if (orgName.includes('PR') || orgName.includes('RANTING')) return 'PR';
      if (orgName.includes('PK') || orgName.includes('KOMISARIAT')) return 'PK';
      if (orgName.includes('PC') || orgName.includes('CABANG')) return 'PC';
      if (orgName.includes('PW') || orgName.includes('WILAYAH')) return 'PW';
      if (orgName.includes('PP') || orgName.includes('PUSAT')) return 'PP';
    }
  }

  // Fallback default
  return 'PAC';
}

export function getOrgLevelMeta(code: string): OrgLevelMeta {
  const found = ORG_LEVELS_DEFINITION.find(l => l.code === code);
  if (found) return found;
  return {
    code,
    name: `Tingkat ${code}`,
    shortLabel: code,
    scope: 'Kepengurusan',
    description: `Struktur kepengurusan ${code}`,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    activeClass: 'border-slate-500 bg-slate-50 ring-2 ring-slate-400/30',
    accentColor: '#64748b'
  };
}
