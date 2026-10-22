import React, { useState } from 'react';
import { 
  AnggotaFull, 
  RiwayatOrganisasi, 
  RiwayatPendidikan, 
  RiwayatKaderisasi,
  JenjangPendidikan,
  KategoriKaderisasi,
  JenjangFormal
} from '../../types';
import { updateAnggotaFull } from '../../lib/db';
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  FileText, 
  Save, 
  X, 
  Calendar,
  Building,
  Check,
  AlertCircle,
  ExternalLink,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface MemberProfileViewProps {
  member: AnggotaFull;
  onUpdateMember: (updated: AnggotaFull) => void;
  onOpenCv: (member: AnggotaFull) => void;
  onOpenKta: (member: AnggotaFull) => void;
  onLogout: () => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  member,
  onUpdateMember,
  onOpenCv,
  onOpenKta,
  onLogout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'organisasi' | 'pendidikan' | 'kaderisasi' | 'biodata'>('organisasi');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for add/edit
  const [editingOrg, setEditingOrg] = useState<{ index: number; data: RiwayatOrganisasi } | null>(null);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [orgForm, setOrgForm] = useState<RiwayatOrganisasi>({
    nama_organisasi: '',
    jabatan: '',
    tahun_mulai: '',
    tahun_selesai: ''
  });

  const [editingEdu, setEditingEdu] = useState<{ index: number; data: RiwayatPendidikan } | null>(null);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [eduForm, setEduForm] = useState<RiwayatPendidikan>({
    jenjang: 'SMA',
    nama_sekolah: '',
    tahun_masuk: '',
    tahun_lulus: ''
  });

  const [editingKad, setEditingKad] = useState<{ index: number; data: RiwayatKaderisasi } | null>(null);
  const [showAddKadModal, setShowAddKadModal] = useState(false);
  const [kadForm, setKadForm] = useState<RiwayatKaderisasi>({
    kategori: 'Formal',
    jenjang_formal: 'MAKESTA',
    nama_kaderisasi_nonformal: '',
    penyelenggara: '',
    lokasi: '',
    tahun: '',
    sertifikat_url: ''
  });

  // Biodata Edit State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioForm, setBioForm] = useState({
    no_hp_wa: member.no_hp_wa || '',
    email: member.email || '',
    alamat_lengkap: member.alamat_lengkap || '',
    jabatan: member.jabatan || '',
    asal_kepengurusan: member.asal_kepengurusan || '',
    tempat_lahir: member.tempat_lahir || '',
    tanggal_lahir: member.tanggal_lahir || ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ================= ORGANISASI HANDLERS =================
  const handleOpenAddOrg = () => {
    setOrgForm({
      nama_organisasi: '',
      jabatan: '',
      tahun_mulai: '',
      tahun_selesai: ''
    });
    setEditingOrg(null);
    setShowAddOrgModal(true);
  };

  const handleOpenEditOrg = (org: RiwayatOrganisasi, index: number) => {
    setOrgForm({ ...org });
    setEditingOrg({ index, data: org });
    setShowAddOrgModal(true);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.nama_organisasi || !orgForm.jabatan || !orgForm.tahun_mulai) {
      alert('Mohon isi nama organisasi, jabatan, dan tahun mulai.');
      return;
    }

    setSaving(true);
    let updatedList = [...member.riwayat_organisasi];
    if (editingOrg !== null) {
      updatedList[editingOrg.index] = { ...orgForm, id: editingOrg.data.id || `org-${Date.now()}` };
    } else {
      updatedList.push({
        ...orgForm,
        id: `org-${Date.now()}`,
        anggota_id: member.id
      });
    }

    const res = await updateAnggotaFull(member.id, { riwayat_organisasi: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      setShowAddOrgModal(false);
      showToast(editingOrg !== null ? 'Riwayat organisasi berhasil diperbarui!' : 'Riwayat organisasi baru berhasil ditambahkan!');
    } else {
      alert(res.error || 'Gagal menyimpan perubahan.');
    }
  };

  const handleDeleteOrg = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat organisasi ini?')) return;
    setSaving(true);
    const updatedList = member.riwayat_organisasi.filter((_, idx) => idx !== index);
    const res = await updateAnggotaFull(member.id, { riwayat_organisasi: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      showToast('Riwayat organisasi berhasil dihapus.');
    }
  };

  // ================= PENDIDIKAN HANDLERS =================
  const handleOpenAddEdu = () => {
    setEduForm({
      jenjang: 'SMA',
      nama_sekolah: '',
      tahun_masuk: '',
      tahun_lulus: ''
    });
    setEditingEdu(null);
    setShowAddEduModal(true);
  };

  const handleOpenEditEdu = (edu: RiwayatPendidikan, index: number) => {
    setEduForm({ ...edu });
    setEditingEdu({ index, data: edu });
    setShowAddEduModal(true);
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.nama_sekolah || !eduForm.tahun_masuk || !eduForm.tahun_lulus) {
      alert('Mohon isi nama sekolah/kampus serta tahun masuk dan lulus.');
      return;
    }

    setSaving(true);
    let updatedList = [...member.riwayat_pendidikan];
    if (editingEdu !== null) {
      updatedList[editingEdu.index] = { ...eduForm, id: editingEdu.data.id || `edu-${Date.now()}` };
    } else {
      updatedList.push({
        ...eduForm,
        id: `edu-${Date.now()}`,
        anggota_id: member.id
      });
    }

    const res = await updateAnggotaFull(member.id, { riwayat_pendidikan: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      setShowAddEduModal(false);
      showToast(editingEdu !== null ? 'Riwayat pendidikan berhasil diperbarui!' : 'Riwayat pendidikan baru berhasil ditambahkan!');
    } else {
      alert(res.error || 'Gagal menyimpan riwayat pendidikan.');
    }
  };

  const handleDeleteEdu = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat pendidikan ini?')) return;
    setSaving(true);
    const updatedList = member.riwayat_pendidikan.filter((_, idx) => idx !== index);
    const res = await updateAnggotaFull(member.id, { riwayat_pendidikan: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      showToast('Riwayat pendidikan berhasil dihapus.');
    }
  };

  // ================= KADERISASI HANDLERS =================
  const handleOpenAddKad = () => {
    setKadForm({
      kategori: 'Formal',
      jenjang_formal: 'MAKESTA',
      nama_kaderisasi_nonformal: '',
      penyelenggara: '',
      lokasi: '',
      tahun: '',
      sertifikat_url: ''
    });
    setEditingKad(null);
    setShowAddKadModal(true);
  };

  const handleOpenEditKad = (kad: RiwayatKaderisasi, index: number) => {
    setKadForm({ ...kad });
    setEditingKad({ index, data: kad });
    setShowAddKadModal(true);
  };

  const handleSaveKad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kadForm.penyelenggara || !kadForm.tahun) {
      alert('Mohon isi penyelenggara dan tahun kaderisasi.');
      return;
    }

    setSaving(true);
    let updatedList = [...member.riwayat_kaderisasi];
    if (editingKad !== null) {
      updatedList[editingKad.index] = { ...kadForm, id: editingKad.data.id || `kad-${Date.now()}` };
    } else {
      updatedList.push({
        ...kadForm,
        id: `kad-${Date.now()}`,
        anggota_id: member.id
      });
    }

    const res = await updateAnggotaFull(member.id, { riwayat_kaderisasi: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      setShowAddKadModal(false);
      showToast(editingKad !== null ? 'Riwayat kaderisasi berhasil diperbarui!' : 'Riwayat kaderisasi baru berhasil ditambahkan!');
    } else {
      alert(res.error || 'Gagal menyimpan riwayat kaderisasi.');
    }
  };

  const handleDeleteKad = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kaderisasi ini?')) return;
    setSaving(true);
    const updatedList = member.riwayat_kaderisasi.filter((_, idx) => idx !== index);
    const res = await updateAnggotaFull(member.id, { riwayat_kaderisasi: updatedList });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      showToast('Riwayat kaderisasi berhasil dihapus.');
    }
  };

  // ================= BIODATA HANDLERS =================
  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateAnggotaFull(member.id, {
      no_hp_wa: bioForm.no_hp_wa,
      email: bioForm.email,
      alamat_lengkap: bioForm.alamat_lengkap,
      jabatan: bioForm.jabatan,
      asal_kepengurusan: bioForm.asal_kepengurusan,
      tempat_lahir: bioForm.tempat_lahir,
      tanggal_lahir: bioForm.tanggal_lahir
    });
    setSaving(false);
    if (res.success && res.data) {
      onUpdateMember(res.data);
      setIsEditingBio(false);
      showToast('Data diri dan kontak berhasil diperbarui!');
    } else {
      alert(res.error || 'Gagal memperbarui data diri.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Member Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header Banner with IPNU green gradient */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {/* Photo Frame */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white p-1 shadow-xl border-2 border-amber-400 overflow-hidden shrink-0">
                {member.pas_foto_url ? (
                  <img 
                    src={member.pas_foto_url} 
                    alt={member.nama_lengkap} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Foto 3x4
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  {member.jabatan || 'Anggota'}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {member.nama_lengkap}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200">
                  <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/50">
                    NIK: {member.nik}
                  </span>
                  <span>{member.asal_kepengurusan || 'Pimpinan IPNU'}</span>
                </div>
              </div>
            </div>

            {/* Verification Status & Direct CV Actions */}
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  member.status_verifikasi === 'Terverifikasi'
                    ? 'bg-emerald-400 text-emerald-950'
                    : member.status_verifikasi === 'Ditolak'
                    ? 'bg-rose-400 text-rose-950'
                    : 'bg-amber-300 text-amber-950'
                }`}
              >
                {member.status_verifikasi === 'Terverifikasi' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {member.status_verifikasi === 'Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                {member.status_verifikasi === 'Menunggu Verifikasi' && <Clock className="w-3.5 h-3.5" />}
                <span>Status: {member.status_verifikasi}</span>
              </span>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onOpenCv(member)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat & Cetak CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenKta(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>KTA Digital</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-semibold text-xs transition-all"
                  title="Ganti NIK atau Keluar dari Profil Saya"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Member Portal Notice Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Portal Anggota Mandiri:</strong> Anda dapat menambahkan dan memperbarui riwayat organisasi, pendidikan, dan kaderisasi di bawah ini. Perubahan akan langsung tercermin pada lembar CV resmi Anda.
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => setActiveSubTab('organisasi')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeSubTab === 'organisasi'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Riwayat Organisasi ({member.riwayat_organisasi.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pendidikan')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeSubTab === 'pendidikan'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Riwayat Pendidikan ({member.riwayat_pendidikan.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('kaderisasi')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeSubTab === 'kaderisasi'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Riwayat Kaderisasi ({member.riwayat_kaderisasi.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('biodata')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors ${
              activeSubTab === 'biodata'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Data Diri & Kontak</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* ================= TAB 1: RIWAYAT ORGANISASI ================= */}
          {activeSubTab === 'organisasi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Riwayat Pengalaman Organisasi</h3>
                  <p className="text-xs text-slate-500">
                    Tambahkan kepengurusan di IPNU, OSIS, Pramuka, BEM, atau organisasi lainnya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddOrg}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Organisasi</span>
                </button>
              </div>

              {member.riwayat_organisasi.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada riwayat organisasi tercatat</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Klik tombol "Tambah Organisasi" untuk melengkapi riwayat organisasi yang akan ditampilkan di CV Anda.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddOrg}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {member.riwayat_organisasi.map((org, index) => (
                    <div 
                      key={org.id || index}
                      className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-emerald-900 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200">
                            {org.jabatan}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">
                            {org.tahun_mulai} - {org.tahun_selesai || 'Sekarang'}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">{org.nama_organisasi}</h4>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleOpenEditOrg(org, index)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrg(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: RIWAYAT PENDIDIKAN ================= */}
          {activeSubTab === 'pendidikan' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Riwayat Pendidikan Formal & Pesantren</h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi jenjang pendidikan mulai dari SD/MI, SMP/MTs, SMA/SMK/MA hingga Perguruan Tinggi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddEdu}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pendidikan</span>
                </button>
              </div>

              {member.riwayat_pendidikan.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada riwayat pendidikan tercatat</p>
                  <button
                    type="button"
                    onClick={handleOpenAddEdu}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {member.riwayat_pendidikan.map((edu, index) => (
                    <div 
                      key={edu.id || index}
                      className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800 text-xs px-2.5 py-0.5 rounded-full bg-slate-200">
                            {edu.jenjang}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold">
                            {edu.tahun_masuk} - {edu.tahun_lulus}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">{edu.nama_sekolah}</h4>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEdu(edu, index)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEdu(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: RIWAYAT KADERISASI ================= */}
          {activeSubTab === 'kaderisasi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Riwayat Pengkaderan IPNU (Formal & Non-Formal)</h3>
                  <p className="text-xs text-slate-500">
                    Jenjang kaderisasi IPNU: MAKESTA (Masa Kesetiaan Anggota), LAKMUD (Latihan Kader Muda), LAKUT (Latihan Kader Utama), dll.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddKad}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kaderisasi</span>
                </button>
              </div>

              {member.riwayat_kaderisasi.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                  <Award className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada riwayat kaderisasi tercatat</p>
                  <button
                    type="button"
                    onClick={handleOpenAddKad}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kaderisasi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {member.riwayat_kaderisasi.map((kad, index) => {
                    const isFormal = kad.kategori === 'Formal';
                    const title = isFormal ? kad.jenjang_formal : (kad.nama_kaderisasi_nonformal || 'Kaderisasi Non-Formal');
                    return (
                      <div 
                        key={kad.id || index}
                        className="bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                              isFormal ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}>
                              {kad.kategori}: {title}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-bold">
                              Tahun {kad.tahun}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                            <div><strong className="text-slate-700">Penyelenggara:</strong> {kad.penyelenggara}</div>
                            {kad.lokasi && <div><strong className="text-slate-700">Lokasi:</strong> {kad.lokasi}</div>}
                            {kad.sertifikat_url && (
                              <div className="text-emerald-700 font-semibold">
                                ✓ Sertifikat / No. Piagam: {kad.sertifikat_url}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleOpenEditKad(kad, index)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKad(index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: BIODATA & KONTAK ================= */}
          {activeSubTab === 'biodata' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Biodata Diri & Kontak</h3>
                  <p className="text-xs text-slate-500">Perbarui kontak WA, email, alamat, atau jabatan Anda.</p>
                </div>

                {!isEditingBio && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah Kontak / Biodata</span>
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <form onSubmit={handleSaveBiodata} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nomor HP / WhatsApp</label>
                      <input
                        type="text"
                        value={bioForm.no_hp_wa}
                        onChange={(e) => setBioForm({ ...bioForm, no_hp_wa: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Aktif</label>
                      <input
                        type="email"
                        value={bioForm.email}
                        onChange={(e) => setBioForm({ ...bioForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan di Kepengurusan</label>
                      <input
                        type="text"
                        value={bioForm.jabatan}
                        onChange={(e) => setBioForm({ ...bioForm, jabatan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                        placeholder="Contoh: KETUA, SEKRETARIS, ANGGOTA"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asal Kepengurusan</label>
                      <input
                        type="text"
                        value={bioForm.asal_kepengurusan}
                        onChange={(e) => setBioForm({ ...bioForm, asal_kepengurusan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                        placeholder="Contoh: PAC IPNU KECAMATAN PACET"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={bioForm.tempat_lahir}
                        onChange={(e) => setBioForm({ ...bioForm, tempat_lahir: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={bioForm.tanggal_lahir}
                        onChange={(e) => setBioForm({ ...bioForm, tanggal_lahir: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={3}
                      value={bioForm.alamat_lengkap}
                      onChange={(e) => setBioForm({ ...bioForm, alamat_lengkap: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingBio(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-medium">Nama Lengkap (Sesuai KTP):</span>
                      <p className="font-bold text-slate-900 mt-0.5">{member.nama_lengkap}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Nomor Induk Kependudukan (NIK):</span>
                      <p className="font-mono font-bold text-slate-900 mt-0.5">{member.nik}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Tempat, Tanggal Lahir:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {member.tempat_lahir || '-'}, {member.tanggal_lahir || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Jabatan & Kepengurusan:</span>
                      <p className="font-bold text-emerald-800 mt-0.5">
                        {member.jabatan || 'Anggota'} • {member.asal_kepengurusan || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">No. WhatsApp / HP:</span>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">{member.no_hp_wa}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Alamat Email:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 font-medium">Alamat Domisili Lengkap:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{member.alamat_lengkap}</p>
                  </div>

                  {/* KTP and Password Akses Info */}
                  <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                        Kunci Akses / Password Login
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-emerald-800 text-sm tracking-wider">
                          {member.password_akses || 'IPNU-195401'}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                          Aktif
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Gunakan nama lengkap dan password ini untuk masuk kembali ke akun profil Anda.
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                        Foto KTP / Kartu Identitas
                      </span>
                      {member.foto_ktp_url ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={member.foto_ktp_url} 
                            alt="Foto KTP" 
                            className="w-16 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                          />
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            ✓ Berkas KTP Terlampir & Tersimpan
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">Belum ada foto KTP terlampir.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL: ADD / EDIT ORGANISASI ================= */}
      {showAddOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingOrg !== null ? 'Edit Riwayat Organisasi' : 'Tambah Riwayat Organisasi'}
                </h3>
              </div>
              <button onClick={() => setShowAddOrgModal(false)} className="text-white hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrg} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Organisasi *</label>
                <input
                  type="text"
                  required
                  value={orgForm.nama_organisasi}
                  onChange={(e) => setOrgForm({ ...orgForm, nama_organisasi: e.target.value })}
                  placeholder="Contoh: PR IPNU Desa Pacet / OSIS SMA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Posisi *</label>
                <input
                  type="text"
                  required
                  value={orgForm.jabatan}
                  onChange={(e) => setOrgForm({ ...orgForm, jabatan: e.target.value })}
                  placeholder="Contoh: Ketua / Sekretaris / Anggota Kaderisasi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Mulai *</label>
                  <input
                    type="text"
                    required
                    value={orgForm.tahun_mulai}
                    onChange={(e) => setOrgForm({ ...orgForm, tahun_mulai: e.target.value })}
                    placeholder="Contoh: 2021"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Selesai</label>
                  <input
                    type="text"
                    value={orgForm.tahun_selesai}
                    onChange={(e) => setOrgForm({ ...orgForm, tahun_selesai: e.target.value })}
                    placeholder="Contoh: 2023 atau Sekarang"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrgModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PENDIDIKAN ================= */}
      {showAddEduModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingEdu !== null ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
                </h3>
              </div>
              <button onClick={() => setShowAddEduModal(false)} className="text-white hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdu} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenjang Pendidikan *</label>
                <select
                  value={eduForm.jenjang}
                  onChange={(e) => setEduForm({ ...eduForm, jenjang: e.target.value as JenjangPendidikan })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="SD">SD / MI</option>
                  <option value="SMP">SMP / MTs</option>
                  <option value="SMA">SMA / MA</option>
                  <option value="SMK">SMK</option>
                  <option value="D1">Diploma (D1)</option>
                  <option value="D2">Diploma (D2)</option>
                  <option value="D3">Diploma (D3)</option>
                  <option value="S1">Strata 1 (S1)</option>
                  <option value="S2">Strata 2 (S2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sekolah / Lembaga *</label>
                <input
                  type="text"
                  required
                  value={eduForm.nama_sekolah}
                  onChange={(e) => setEduForm({ ...eduForm, nama_sekolah: e.target.value })}
                  placeholder="Contoh: SMA Negeri 1 Pacet / Ponpes Amanatul Ummah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Masuk *</label>
                  <input
                    type="text"
                    required
                    value={eduForm.tahun_masuk}
                    onChange={(e) => setEduForm({ ...eduForm, tahun_masuk: e.target.value })}
                    placeholder="Contoh: 2018"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Lulus *</label>
                  <input
                    type="text"
                    required
                    value={eduForm.tahun_lulus}
                    onChange={(e) => setEduForm({ ...eduForm, tahun_lulus: e.target.value })}
                    placeholder="Contoh: 2021"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEduModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT KADERISASI ================= */}
      {showAddKadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingKad !== null ? 'Edit Riwayat Kaderisasi' : 'Tambah Riwayat Kaderisasi IPNU'}
                </h3>
              </div>
              <button onClick={() => setShowAddKadModal(false)} className="text-white hover:text-emerald-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKad} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kaderisasi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKadForm({ ...kadForm, kategori: 'Formal' })}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      kadForm.kategori === 'Formal'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Formal IPNU
                  </button>
                  <button
                    type="button"
                    onClick={() => setKadForm({ ...kadForm, kategori: 'Non-Formal' })}
                    className={`py-2 text-xs font-bold rounded-xl border ${
                      kadForm.kategori === 'Non-Formal'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Non-Formal / Pelatihan
                  </button>
                </div>
              </div>

              {kadForm.kategori === 'Formal' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenjang Formal IPNU *</label>
                  <select
                    value={kadForm.jenjang_formal || 'MAKESTA'}
                    onChange={(e) => setKadForm({ ...kadForm, jenjang_formal: e.target.value as JenjangFormal })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="MAKESTA">MAKESTA (Masa Kesetiaan Anggota)</option>
                    <option value="LAKMUD">LAKMUD (Latihan Kader Muda)</option>
                    <option value="LAKUT">LAKUT (Latihan Kader Utama)</option>
                    <option value="LATIN I">LATIN I (Latihan Instruktur I)</option>
                    <option value="LATIN II">LATIN II (Latihan Instruktur II)</option>
                    <option value="LAKNAS">LAKNAS (Latihan Kader Nasional)</option>
                    <option value="LATINNAS">LATINNAS (Latihan Instruktur Nasional)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kegiatan Non-Formal *</label>
                  <input
                    type="text"
                    required
                    value={kadForm.nama_kaderisasi_nonformal || ''}
                    onChange={(e) => setKadForm({ ...kadForm, nama_kaderisasi_nonformal: e.target.value })}
                    placeholder="Contoh: DIKLATAMA CBP, Pelatihan Jurnalistik"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penyelenggara *</label>
                <input
                  type="text"
                  required
                  value={kadForm.penyelenggara}
                  onChange={(e) => setKadForm({ ...kadForm, penyelenggara: e.target.value })}
                  placeholder="Contoh: PAC IPNU Kecamatan Pacet / PC IPNU Mojokerto"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    value={kadForm.lokasi}
                    onChange={(e) => setKadForm({ ...kadForm, lokasi: e.target.value })}
                    placeholder="Contoh: Ponpes Al-Ihsan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun *</label>
                  <input
                    type="text"
                    required
                    value={kadForm.tahun}
                    onChange={(e) => setKadForm({ ...kadForm, tahun: e.target.value })}
                    placeholder="Contoh: 2022"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Piagam / Sertifikat (Opsional)</label>
                <input
                  type="text"
                  value={kadForm.sertifikat_url || ''}
                  onChange={(e) => setKadForm({ ...kadForm, sertifikat_url: e.target.value })}
                  placeholder="Contoh: 042/MAKESTA/PAC/VII/2022"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
