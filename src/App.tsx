import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { KepalaSekolahDashboard } from './components/dashboard/KepalaSekolahDashboard';
import { KibBView } from './components/inventory/KibBView';
import { KibEView } from './components/inventory/KibEView';
import { AllInventoryView } from './components/inventory/AllInventoryView';
import { NeedsView } from './components/needs/NeedsView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { LocationsView } from './components/locations/LocationsView';
import { LabelPrintView } from './components/qrcode/LabelPrintView';
import { QrScannerView } from './components/qrcode/QrScannerView';
import { ReportsView } from './components/reports/ReportsView';
import { SchoolSettingsView } from './components/settings/SchoolSettingsView';
import { LetterheadSettingsView } from './components/settings/LetterheadSettingsView';
import { StaffSettingsView } from './components/settings/StaffSettingsView';
import { UsersManagementView } from './components/users/UsersManagementView';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { CorrectionNotesView } from './components/correction/CorrectionNotesView';
import { Bell, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isKepalaSekolah } = useAuth();
  const { toasts, dismissToast } = useRealtime();

  // Route state
  const [currentView, setCurrentView] = useState<string>(
    isKepalaSekolah ? 'monitoring' : 'dashboard'
  );

  useEffect(() => {
    // If switched role to Kepala Sekolah, default to monitoring view
    if (isKepalaSekolah && currentView === 'dashboard') {
      setCurrentView('monitoring');
    }
  }, [isKepalaSekolah]);

  const viewTitles: Record<string, string> = {
    dashboard: 'Ringkasan Utama Inventaris',
    monitoring: 'Dashboard Monitoring Kepala Sekolah (Read-Only)',
    kibb: 'KIB B — Peralatan dan Mesin',
    kibe: 'KIB E — Buku (Pelajaran & Pustaka)',
    all_inventory: 'Seluruh Inventaris Sekolah',
    needs: 'Usulan Kebutuhan Barang & Perhitungan Kekurangan',
    procurement: 'Pengadaan Barang & Penerimaan',
    locations: 'Master Lokasi & Ruangan',
    transfers: 'Riwayat Perpindahan Barang',
    label_print: 'Cetak Massal Label Stiker & QR Code',
    qr_scan: 'Pindai & Verifikasi QR Code Aset',
    reports: '22 Rekap Laporan Resmi & Ekspor Dokumen',
    settings_school: 'Profil & Identitas Resmi Sekolah',
    settings_letterhead: 'Pengaturan & Pratinjau Kop Surat Dinas',
    settings_staff: 'Pengaturan Pejabat & Pengurus Barang Pembantu',
    users_mgmt: 'Manajemen Pengguna & Hak Akses',
    backup_restore: 'Backup & Pemulihan Database Pusat',
    audit_logs: 'Audit Trail & Rekam Jejak Aktivitas',
    correction_notes: 'Catatan & Koreksi Data Kepala Sekolah',
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboard onNavigate={setCurrentView} />;
      case 'monitoring':
        return <KepalaSekolahDashboard onNavigate={setCurrentView} />;
      case 'kibb':
        return <KibBView />;
      case 'kibe':
        return <KibEView />;
      case 'all_inventory':
        return <AllInventoryView />;
      case 'needs':
        return <NeedsView onNavigate={setCurrentView} />;
      case 'procurement':
        return <ProcurementView onNavigate={setCurrentView} />;
      case 'locations':
        return <LocationsView defaultTab="locations" />;
      case 'transfers':
        return <LocationsView defaultTab="transfers" />;
      case 'label_print':
        return <LabelPrintView />;
      case 'qr_scan':
        return <QrScannerView />;
      case 'reports':
        return <ReportsView />;
      case 'settings_school':
        return <SchoolSettingsView />;
      case 'settings_letterhead':
        return <LetterheadSettingsView />;
      case 'settings_staff':
        return <StaffSettingsView />;
      case 'users_mgmt':
        return <UsersManagementView />;
      case 'backup_restore':
        return <BackupRestoreView />;
      case 'audit_logs':
        return <AuditTrailView />;
      case 'correction_notes':
        return <CorrectionNotesView />;
      default:
        return <MainDashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentViewTitle={viewTitles[currentView] || 'SIM-ASET'}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Realtime Toast Notifications Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">Sinkronisasi Realtime Terkini</p>
                <p className="text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {toast.timestamp}
                </span>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <AppContent />
      </RealtimeProvider>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Memuat SIM-ASET Sekolah...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default App;
