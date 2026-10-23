import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

export const UsersManagementView: React.FC = () => {
  const { isSuperadmin } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('admin_tu');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Password reset modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [triggerRefresh]);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('password123');
    setName('');
    setRole('admin_tu');
    setNip('');
    setJabatan('Tenaga Administrasi Sekolah');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setName(u.name);
    setRole(u.role);
    setNip(u.nip || '');
    setJabatan(u.jabatan || '');
    setIsActive(u.isActive);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: name.trim(),
          role,
          nip: nip.trim() || undefined,
          jabatan: jabatan.trim() || undefined,
          isActive,
        });
      } else {
        await api.createUser({
          username: username.trim(),
          password,
          name: name.trim(),
          role,
          nip: nip.trim() || undefined,
          jabatan: jabatan.trim() || undefined,
        });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengguna.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResetUser || !newPassword) return;

    try {
      await api.resetUserPassword(targetResetUser.id, newPassword);
      alert(`Password untuk pengguna "${targetResetUser.username}" berhasil direset.`);
      setIsResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      alert('Gagal mereset password: ' + err.message);
    }
  };

  const roleNameMap: Record<UserRole, string> = {
    admin_tu: 'Tenaga Administrasi (TU)',
    pengurus_barang: 'Pengurus Barang',
    kepala_sekolah: 'Kepala Sekolah (Monitoring)',
    superadmin: 'Administrator Sistem',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Manajemen Pengguna & Hak Akses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun pengguna, peran, status aktivasi, dan reset password
          </p>
        </div>

        {isSuperadmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No</th>
                <th className="px-4 py-3">Nama Lengkap & NIP</th>
                <th className="px-3 py-3">Username</th>
                <th className="px-3 py-3">Peran & Hak Akses</th>
                <th className="px-3 py-3">Jabatan</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Terakhir Login</th>
                <th className="px-3 py-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{u.nip || '-'}</div>
                  </td>
                  <td className="px-3 py-3 font-mono font-medium text-slate-800">
                    {u.username}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[11px] font-semibold ${
                        u.role === 'kepala_sekolah'
                          ? 'text-amber-700'
                          : u.role === 'pengurus_barang'
                          ? 'text-emerald-700'
                          : u.role === 'superadmin'
                          ? 'text-purple-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {roleNameMap[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{u.jabatan || '-'}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        u.isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {u.isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{u.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                    {u.lastLogin ? formatDateTime(u.lastLogin) : 'Belum pernah'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {isSuperadmin && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setTargetResetUser(u);
                            setNewPassword('password123');
                            setIsResetModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Password Awal *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Peran Akses *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="admin_tu">Tenaga Administrasi</option>
                    <option value="pengurus_barang">Pengurus Barang</option>
                    <option value="kepala_sekolah">Kepala Sekolah (Monitoring)</option>
                    <option value="superadmin">Administrator Sistem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIP (Opsional)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jabatan Struktural</label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveUser"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="isActiveUser" className="font-medium text-slate-700">
                    Akun Pengguna Aktif
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && targetResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
              <button onClick={() => setIsResetModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Reset password untuk pengguna <strong>{targetResetUser.name}</strong> ({targetResetUser.username}):
              </p>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Password Baru (min 6 karakter)</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
