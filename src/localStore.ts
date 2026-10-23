import {
  User,
  InventoryItem,
  LocationItem,
  LocationHistory,
  NeedItem,
  ProcurementItem,
  CorrectionNote,
  SchoolSettings,
  LetterheadSettings,
  StaffSettings,
  ActivityLog,
  BackupRecord,
  DashboardStats,
} from './types';

interface LocalDBSchema {
  users: User[];
  locations: LocationItem[];
  inventoryItems: InventoryItem[];
  locationHistories: LocationHistory[];
  needs: NeedItem[];
  procurements: ProcurementItem[];
  correctionNotes: CorrectionNote[];
  schoolSettings: SchoolSettings;
  letterheadSettings: LetterheadSettings;
  staffSettings: StaffSettings;
  activityLogs: ActivityLog[];
  backups: BackupRecord[];
}

const STORAGE_KEY = 'simaset_offline_db_v2';
const CURRENT_USER_KEY = 'simaset_current_user_v2';

function getInitialLocalData(): LocalDBSchema {
  const now = new Date().toISOString();

  const locations: LocationItem[] = [
    { id: 'loc-k1', name: 'Kelas 1', description: 'Ruang Belajar Kelas 1', isActive: true },
    { id: 'loc-k2', name: 'Kelas 2', description: 'Ruang Belajar Kelas 2', isActive: true },
    { id: 'loc-k3', name: 'Kelas 3', description: 'Ruang Belajar Kelas 3', isActive: true },
    { id: 'loc-k4', name: 'Kelas 4', description: 'Ruang Belajar Kelas 4', isActive: true },
    { id: 'loc-k5', name: 'Kelas 5', description: 'Ruang Belajar Kelas 5', isActive: true },
    { id: 'loc-k6', name: 'Kelas 6', description: 'Ruang Belajar Kelas 6', isActive: true },
    { id: 'loc-guru', name: 'Ruang Guru', description: 'Ruang Majelis Guru', isActive: true },
    { id: 'loc-ks', name: 'Ruang Kepala Sekolah', description: 'Ruang Kerja Kepala Sekolah', isActive: true },
    { id: 'loc-tu', name: 'Ruang Tata Usaha', description: 'Ruang Layanan Administrasi Sekolah', isActive: true },
    { id: 'loc-perpus', name: 'Perpustakaan', description: 'Perpustakaan Sekolah & Pojok Literasi', isActive: true },
    { id: 'loc-gudang', name: 'Gudang', description: 'Gudang Penyimpanan Barang & Perlengkapan', isActive: true },
    { id: 'loc-lab', name: 'Laboratorium', description: 'Laboratorium Komputer & IPA', isActive: true },
    { id: 'loc-uks', name: 'UKS', description: 'Unit Kesehatan Sekolah', isActive: true },
    { id: 'loc-op', name: 'Ruang Operator', description: 'Ruang Server & Data Dapodik', isActive: true },
    { id: 'loc-lain', name: 'Lokasi Lainnya', description: 'Area Lainnya di Lingkungan Sekolah', isActive: true },
  ];

  const users: User[] = [
    {
      id: 'usr-admin-tu',
      username: 'admin_tu',
      name: 'Siti Rahmawati, S.Pd',
      role: 'admin_tu',
      nip: '198506122008012004',
      jabatan: 'Tenaga Administrasi Sekolah',
      isActive: true,
      createdAt: now,
    },
    {
      id: 'usr-pengurus',
      username: 'pengurus_barang',
      name: 'Ahmad Fauzi, S.Kom',
      role: 'pengurus_barang',
      nip: '198304152009021003',
      jabatan: 'Pengurus Barang Sekolah',
      isActive: true,
      createdAt: now,
    },
    {
      id: 'usr-kepsek',
      username: 'kepala_sekolah',
      name: 'Drs. H. Bambang Sudarmono, M.Pd',
      role: 'kepala_sekolah',
      nip: '197003181995121001',
      jabatan: 'Kepala Sekolah',
      isActive: true,
      createdAt: now,
    },
    {
      id: 'usr-superadmin',
      username: 'superadmin',
      name: 'Administrator IT Sekolah',
      role: 'superadmin',
      nip: '199008202015031002',
      jabatan: 'Administrator Sistem Inventaris',
      isActive: true,
      createdAt: now,
    },
  ];

  const inventoryItems: InventoryItem[] = [
    {
      id: 'inv-kibb-1',
      kib: 'KIB_B',
      itemCode: '02.06.01.01.001',
      name: 'Printer Epson L3210',
      brandModel: 'Epson / EcoTank L3210 All-in-One',
      specification: 'Print, Scan, Copy, Ink Tank System USB 2.0',
      registerNumber: 'REG-2026-B-001',
      year: 2026,
      quantity: 3,
      unit: 'Unit',
      unitPrice: 2450000,
      totalValue: 7350000,
      fundSource: 'BOS Reguler',
      condition: 'Baik',
      locationId: 'loc-guru',
      locationName: 'Ruang Guru',
      notes: 'Printer utama operasional administrasi guru',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
    {
      id: 'inv-kibb-2',
      kib: 'KIB_B',
      itemCode: '02.06.01.02.002',
      name: 'Laptop Lenovo',
      brandModel: 'Lenovo ThinkPad E14 Gen 4',
      specification: 'Core i5-1235U, 16GB RAM, 512GB SSD NVMe, Windows 11 Pro',
      registerNumber: 'REG-2026-B-002',
      year: 2025,
      quantity: 6,
      unit: 'Unit',
      unitPrice: 9500000,
      totalValue: 57000000,
      fundSource: 'BOS Kinerja',
      condition: 'Baik',
      locationId: 'loc-tu',
      locationName: 'Ruang Tata Usaha',
      notes: 'Laptop untuk pengolahan administrasi TU dan Dapodik',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
    {
      id: 'inv-kibb-3',
      kib: 'KIB_B',
      itemCode: '02.06.02.01.003',
      name: 'Proyektor Epson',
      brandModel: 'Epson EB-X51 XGA 3LCD',
      specification: '3800 Lumens, XGA Resolution, HDMI/VGA',
      registerNumber: 'REG-2026-B-003',
      year: 2024,
      quantity: 2,
      unit: 'Unit',
      unitPrice: 6200000,
      totalValue: 12400000,
      fundSource: 'BOS Reguler',
      condition: 'Baik',
      locationId: 'loc-k6',
      locationName: 'Kelas 6',
      notes: 'Media presentasi dan pembelajaran interaktif kelas 6',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
    {
      id: 'inv-kibe-1',
      kib: 'KIB_E',
      itemCode: '05.17.01.01.001',
      name: 'Buku Bahasa Indonesia Kelas 1',
      year: 2024,
      quantity: 20,
      unit: 'Eksemplar',
      unitPrice: 65000,
      totalValue: 1300000,
      fundSource: 'BOS Reguler',
      condition: 'Baik',
      locationId: 'loc-k1',
      locationName: 'Kelas 1',
      subject: 'Bahasa Indonesia',
      gradeClass: 'Kelas 1',
      author: 'Kemendikbudristek',
      publisher: 'Pusat Perbukuan',
      isbn: '978-602-244-300-1',
      notes: 'Buku Teks Utama Kurikulum Merdeka Siswa Kelas 1',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
    {
      id: 'inv-kibe-2',
      kib: 'KIB_E',
      itemCode: '05.17.01.02.002',
      name: 'Buku Matematika Kelas 2',
      year: 2024,
      quantity: 28,
      unit: 'Eksemplar',
      unitPrice: 70000,
      totalValue: 1960000,
      fundSource: 'BOS Reguler',
      condition: 'Baik',
      locationId: 'loc-k2',
      locationName: 'Kelas 2',
      subject: 'Matematika',
      gradeClass: 'Kelas 2',
      author: 'Tim Puskurbuk',
      publisher: 'Pusat Kurikulum dan Perbukuan',
      isbn: '978-602-244-302-5',
      notes: 'Buku Belajar Bersama Temanmu Matematika Kelas 2',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
    {
      id: 'inv-kibe-3',
      kib: 'KIB_E',
      itemCode: '05.17.02.01.003',
      name: 'Buku Cerita Anak',
      year: 2023,
      quantity: 45,
      unit: 'Eksemplar',
      unitPrice: 45000,
      totalValue: 2025000,
      fundSource: 'BOS Reguler',
      condition: 'Baik',
      locationId: 'loc-perpus',
      locationName: 'Perpustakaan',
      subject: 'Literasi / Fiksi Anak',
      gradeClass: 'Umum / SD',
      author: 'Dewi Lestari & Ilustrator Anak',
      publisher: 'Pustaka Nusantara',
      isbn: '978-623-010-889-0',
      notes: 'Koleksi bacaan pengayaan literasi di ruang perpustakaan',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Ahmad Fauzi, S.Kom',
      updatedBy: 'Ahmad Fauzi, S.Kom',
    },
  ];

  const needs: NeedItem[] = [
    {
      id: 'need-1',
      needCode: 'KBT-2026-B-001',
      kib: 'KIB_B',
      name: 'Laptop Lenovo',
      brandModel: 'Lenovo ThinkPad E14 Gen 4',
      specification: 'Core i5-1235U, 16GB RAM, 512GB SSD NVMe',
      quantityNeeded: 10,
      quantityAvailable: 6,
      quantityShortage: 4,
      unit: 'Unit',
      estimatedUnitPrice: 9500000,
      estimatedTotalBudget: 38000000,
      priority: 'Mendesak',
      locationId: 'loc-tu',
      locationName: 'Ruang Tata Usaha',
      targetYear: 2026,
      plannedFundSource: 'BOS Kinerja 2026',
      status: 'Dalam Proses Pengadaan',
      notes: 'Kebutuhan laptop untuk staf administrasi dan penginput e-Rapor',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Siti Rahmawati, S.Pd',
    },
    {
      id: 'need-2',
      needCode: 'KBT-2026-B-002',
      kib: 'KIB_B',
      name: 'Printer Epson L3210',
      brandModel: 'Epson / EcoTank L3210',
      specification: 'Print, Scan, Copy Ink Tank System',
      quantityNeeded: 5,
      quantityAvailable: 3,
      quantityShortage: 2,
      unit: 'Unit',
      estimatedUnitPrice: 2500000,
      estimatedTotalBudget: 5000000,
      priority: 'Sedang',
      locationId: 'loc-guru',
      locationName: 'Ruang Guru',
      targetYear: 2026,
      plannedFundSource: 'BOS Reguler 2026',
      status: 'Pengajuan',
      notes: 'Penambahan printer untuk Ruang Guru dan Kelas 1-3',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Siti Rahmawati, S.Pd',
    },
    {
      id: 'need-3',
      needCode: 'KBT-2026-E-003',
      kib: 'KIB_E',
      name: 'Buku Bahasa Indonesia Kelas 1',
      subject: 'Bahasa Indonesia',
      gradeClass: 'Kelas 1',
      author: 'Kemendikbudristek',
      publisher: 'Pusat Perbukuan',
      publishYear: 2024,
      isbn: '978-602-244-300-1',
      quantityNeeded: 30,
      quantityAvailable: 20,
      quantityShortage: 10,
      unit: 'Eksemplar',
      estimatedUnitPrice: 65000,
      estimatedTotalBudget: 650000,
      priority: 'Mendesak',
      locationId: 'loc-k1',
      locationName: 'Kelas 1',
      targetYear: 2026,
      plannedFundSource: 'BOS Reguler 2026',
      status: 'Pengajuan',
      notes: 'Kekurangan buku pegangan siswa untuk rombel baru tahun ajaran 2026/2027',
      createdAt: now,
      updatedAt: now,
      createdBy: 'Siti Rahmawati, S.Pd',
    },
  ];

  const procurements: ProcurementItem[] = [
    {
      id: 'proc-1',
      procurementNumber: 'PGD-2026-001',
      needId: 'need-1',
      needCode: 'KBT-2026-B-001',
      itemName: 'Laptop Lenovo ThinkPad E14',
      kib: 'KIB_B',
      quantityProposed: 4,
      quantityApproved: 4,
      quantityPurchased: 4,
      quantityReceived: 0,
      actualUnitPrice: 9500000,
      totalProcurementValue: 38000000,
      fundSource: 'BOS Kinerja 2026',
      submissionDate: '2026-10-10',
      approvalDate: '2026-10-15',
      supplierName: 'PT. Metro Teknologi Edukasi',
      officerName: 'Ahmad Fauzi, S.Kom',
      status: 'Dalam Proses Pengadaan',
      notes: 'Dalam proses pengiriman dari penyedia SIPLah',
      isTransferredToInventory: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const locationHistories: LocationHistory[] = [
    {
      id: 'hist-1',
      itemId: 'inv-kibb-3',
      itemCode: '02.06.02.01.003',
      itemName: 'Proyektor Epson EB-X51',
      kib: 'KIB_B',
      fromLocationId: 'loc-guru',
      fromLocationName: 'Ruang Guru',
      toLocationId: 'loc-k6',
      toLocationName: 'Kelas 6',
      quantityMoved: 1,
      transferDate: '2026-10-18',
      officerName: 'Ahmad Fauzi, S.Kom',
      notes: 'Dipindahkan untuk persiapan ujian asesmen berbasis komputer kelas 6',
      createdAt: now,
    },
  ];

  const correctionNotes: CorrectionNote[] = [
    {
      id: 'note-1',
      headmasterName: 'Drs. H. Bambang Sudarmono, M.Pd',
      targetModule: 'KEBUTUHAN',
      targetItemId: 'need-1',
      targetItemTitle: 'Laptop Lenovo (KBT-2026-B-001)',
      noteText: 'Mohon dicek ulang spesifikasi laptop agar dipastikan bergaransi resmi minimal 2 tahun dan memenuhi standar asesmen nasional.',
      urgency: 'Penting',
      status: 'Sedang Ditindaklanjuti',
      createdAt: now,
      responseNote: 'Siap Pak, sudah dikonfirmasi ke penyedia SIPLah bahwa unit bergaransi Onsite 3 Tahun.',
      respondedBy: 'Ahmad Fauzi, S.Kom',
      respondedAt: now,
    },
  ];

  const schoolSettings: SchoolSettings = {
    agencyName: 'PEMERINTAH KABUPATEN NUSANTARA',
    educationDept: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    schoolName: 'UPTD SD NEGERI 01 TELADAN NUSANTARA',
    npsn: '20108899',
    nss: '101026001001',
    address: 'Jl. Pendidikan No. 45, Kompleks Ki Hajar Dewantara',
    village: '',
    district: 'Nusantara Jaya',
    regencyCity: 'Kabupaten Nusantara',
    province: 'Jawa Barat',
    postalCode: '40123',
    phone: '(021) 8765-4321',
    email: 'sdn01teladan@disdik.sch.id',
    website: 'https://sdn01teladan.sch.id',
    logoLeft: '/assets/logo-tutwuri.svg',
    logoRight: '/assets/logo-sekolah.svg',
  };

  const letterheadSettings: LetterheadSettings = {
    showAgency: true,
    showEducationDept: true,
    showSchoolName: true,
    showAddress: true,
    showContactInfo: true,
    showLogoLeft: true,
    showLogoRight: true,
    fontFamily: 'Arial, Helvetica, sans-serif',
    titleFontSize: '16px',
    subtitleFontSize: '13px',
    bodyFontSize: '10px',
    textColor: '#000000',
    borderThickness: 3,
    logoSizePx: 75,
    spacingBottomMm: 8,
    paperSize: 'A4',
    orientation: 'portrait',
  };

  const staffSettings: StaffSettings = {
    headmasterName: 'Drs. H. Bambang Sudarmono, M.Pd',
    headmasterNip: '197003181995121001',
    headmasterTitle: 'Kepala UPTD SD Negeri 01 Teladan',
    showHeadmaster: true,

    propertyOfficerName: 'Ahmad Fauzi, S.Kom',
    propertyOfficerNip: '198304152009021003',
    propertyOfficerTitle: 'Pengurus Barang',
    showPropertyOfficer: true,

    assistantPropertyOfficerName: 'M. Rizky Pratama, A.Md',
    assistantPropertyOfficerNip: '199205102020121005',
    assistantPropertyOfficerTitle: 'Pengurus Barang Pembantu',
    showAssistantPropertyOfficer: true,

    adminStaffName: 'Siti Rahmawati, S.Pd',
    adminStaffNip: '198506122008012004',
    adminStaffTitle: 'Tenaga Administrasi Sekolah',
    showAdminStaff: true,
  };

  const activityLogs: ActivityLog[] = [
    {
      id: 'log-init',
      userId: 'usr-superadmin',
      userName: 'Administrator IT Sekolah',
      userRole: 'superadmin',
      action: 'LOGIN',
      module: 'AUTH',
      details: 'Sistem SIM-ASET Sekolah diinisialisasi dalam mode mandiri/offline',
      timestamp: now,
    },
  ];

  return {
    users,
    locations,
    inventoryItems,
    locationHistories,
    needs,
    procurements,
    correctionNotes,
    schoolSettings,
    letterheadSettings,
    staffSettings,
    activityLogs,
    backups: [],
  };
}

class LocalStoreManager {
  private db: LocalDBSchema;

  constructor() {
    this.db = this.load();
    this.recalculateAllNeeds();
  }

  private load(): LocalDBSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...getInitialLocalData(),
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Failed to parse local storage DB:', e);
    }
    const fresh = getInitialLocalData();
    this.save(fresh);
    return fresh;
  }

  private save(data = this.db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
    }
  }

  public getCurrentUser(): User {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback
    }
    return this.db.users[3]; // default superadmin
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.db.activityLogs.unshift(newLog);
    if (this.db.activityLogs.length > 500) {
      this.db.activityLogs = this.db.activityLogs.slice(0, 500);
    }
    this.save();
  }

  private calcAvailableForItem(name: string, kib: string, gradeClass?: string, isbn?: string): number {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetNorm = norm(name);

    return this.db.inventoryItems
      .filter((item) => {
        if (item.kib !== kib) return false;
        if (isbn && item.isbn && item.isbn.replace(/[^0-9]/g, '') === isbn.replace(/[^0-9]/g, '')) {
          return true;
        }
        if (gradeClass && item.gradeClass && item.gradeClass !== gradeClass) {
          return false;
        }
        const itemNorm = norm(item.name);
        return itemNorm.includes(targetNorm) || targetNorm.includes(itemNorm);
      })
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  public recalculateAllNeeds() {
    let changed = false;
    for (const need of this.db.needs) {
      const available = this.calcAvailableForItem(need.name, need.kib, need.gradeClass, need.isbn);
      const shortage = Math.max(0, need.quantityNeeded - available);
      const budget = shortage * (need.estimatedUnitPrice || 0);

      if (
        need.quantityAvailable !== available ||
        need.quantityShortage !== shortage ||
        need.estimatedTotalBudget !== budget
      ) {
        need.quantityAvailable = available;
        need.quantityShortage = shortage;
        need.estimatedTotalBudget = budget;
        need.updatedAt = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) {
      this.save();
    }
  }

  // Auth
  public login(username: string, password?: string): { token: string; user: User } {
    const rawUser = String(username || '').trim().toLowerCase();

    let user = this.db.users.find((u) => u.username.toLowerCase() === rawUser);
    if (!user) {
      if (rawUser === 'admin' || rawUser === 'admin_tu' || rawUser === 'tu' || rawUser === 'administrasi') {
        user = this.db.users.find((u) => u.role === 'admin_tu') || this.db.users.find((u) => u.role === 'superadmin');
      } else if (rawUser === 'kepsek' || rawUser === 'kepala_sekolah' || rawUser === 'kepalasekolah') {
        user = this.db.users.find((u) => u.role === 'kepala_sekolah');
      } else if (rawUser === 'pengurus' || rawUser === 'pengurus_barang' || rawUser === 'pengurusbarang') {
        user = this.db.users.find((u) => u.role === 'pengurus_barang');
      } else if (rawUser === 'superadmin' || rawUser === 'super_admin' || rawUser === 'it') {
        user = this.db.users.find((u) => u.role === 'superadmin');
      }
    }

    if (!user) {
      // Create user or fallback to superadmin for maximum usability
      user = this.db.users[3];
    }

    const token = 'simaset-local-token-' + Date.now();
    this.setCurrentUser(user);
    this.logActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      details: `Login berhasil (${user.role})`,
    });

    return { token, user };
  }

  public getMe(): { user: User } {
    return { user: this.getCurrentUser() };
  }

  public logout(): { success: boolean } {
    this.setCurrentUser(null);
    return { success: true };
  }

  // Users
  public getUsers(): User[] {
    return this.db.users;
  }

  public createUser(data: any): User {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: data.username,
      name: data.name,
      role: data.role,
      nip: data.nip || '',
      jabatan: data.jabatan || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, data: any): User {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    Object.assign(user, data);
    this.save();
    return user;
  }

  public resetUserPassword(id: string): { success: boolean } {
    return { success: true };
  }

  // Dashboard Stats
  public getDashboardStats(): DashboardStats {
    const kibBItems = this.db.inventoryItems.filter((i) => i.kib === 'KIB_B');
    const kibEItems = this.db.inventoryItems.filter((i) => i.kib === 'KIB_E');

    const totalInventory = this.db.inventoryItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalKibB = kibBItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalKibE = kibEItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

    const totalBaik = this.db.inventoryItems.filter((i) => i.condition === 'Baik').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalRusakRingan = this.db.inventoryItems.filter((i) => i.condition === 'Rusak Ringan').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
    const totalRusakBerat = this.db.inventoryItems.filter((i) => i.condition === 'Rusak Berat').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

    const totalNilaiAset = this.db.inventoryItems.reduce((acc, i) => acc + (Number(i.totalValue) || 0), 0);

    const totalKebutuhan = this.db.needs.reduce((acc, n) => acc + (Number(n.quantityNeeded) || 0), 0);
    const totalKekurangan = this.db.needs.reduce((acc, n) => acc + (Number(n.quantityShortage) || 0), 0);
    const totalEstimasiAnggaran = this.db.needs.reduce((acc, n) => acc + (Number(n.estimatedTotalBudget) || 0), 0);
    const totalSangatMendesak = this.db.needs.filter((n) => n.priority === 'Sangat Mendesak').length;

    const pengadaanBerjalan = this.db.procurements.filter((p) => p.status === 'Dalam Proses Pengadaan' || p.status === 'Disetujui').length;
    const pengadaanSelesai = this.db.procurements.filter((p) => p.status === 'Sudah Diterima' || p.status === 'Selesai').length;

    const byLocation: Record<string, number> = {};
    for (const item of this.db.inventoryItems) {
      byLocation[item.locationName] = (byLocation[item.locationName] || 0) + item.quantity;
    }

    const byYear: Record<string, number> = {};
    for (const item of this.db.inventoryItems) {
      const yr = String(item.year || 'Lainnya');
      byYear[yr] = (byYear[yr] || 0) + item.quantity;
    }

    const byFund: Record<string, number> = {};
    for (const item of this.db.inventoryItems) {
      const f = item.fundSource || 'Lainnya';
      byFund[f] = (byFund[f] || 0) + item.quantity;
    }

    return {
      totalInventory,
      totalKibB,
      totalKibE,
      totalBaik,
      totalRusakRingan,
      totalRusakBerat,
      totalNilaiAset,
      totalKebutuhan,
      totalKekurangan,
      totalEstimasiAnggaran,
      totalSangatMendesak,
      pengadaanBerjalan,
      pengadaanSelesai,
      byLocation,
      byYear,
      byFund,
      recentLogs: this.db.activityLogs.slice(0, 8),
    };
  }

  // Inventory
  public getInventoryItems(params?: Record<string, string>): InventoryItem[] {
    let items = [...this.db.inventoryItems];
    if (params?.kib) {
      items = items.filter((i) => i.kib === params.kib);
    }
    if (params?.locationId) {
      items = items.filter((i) => i.locationId === params.locationId);
    }
    if (params?.condition) {
      items = items.filter((i) => i.condition === params.condition);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.itemCode.toLowerCase().includes(q) ||
          (i.brandModel && i.brandModel.toLowerCase().includes(q))
      );
    }
    return items;
  }

  public getInventoryItem(id: string): InventoryItem {
    const item = this.db.inventoryItems.find((i) => i.id === id);
    if (!item) throw new Error('Barang tidak ditemukan.');
    return item;
  }

  public createInventoryItem(data: Partial<InventoryItem>): InventoryItem {
    const now = new Date().toISOString();
    const qty = Number(data.quantity) || 1;
    const price = Number(data.unitPrice) || 0;
    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      kib: data.kib || 'KIB_B',
      itemCode: data.itemCode || '00.00.00.' + Math.floor(Math.random() * 1000),
      name: data.name || 'Barang Baru',
      year: Number(data.year) || new Date().getFullYear(),
      quantity: qty,
      unit: data.unit || 'Unit',
      unitPrice: price,
      totalValue: qty * price,
      fundSource: data.fundSource || 'BOS Reguler',
      condition: data.condition || 'Baik',
      locationId: data.locationId || 'loc-guru',
      locationName: data.locationName || 'Ruang Guru',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: this.getCurrentUser().name,
      updatedBy: this.getCurrentUser().name,
      ...data,
    };
    this.db.inventoryItems.unshift(newItem);
    this.recalculateAllNeeds();
    this.save();
    return newItem;
  }

  public updateInventoryItem(id: string, data: Partial<InventoryItem>): InventoryItem {
    const index = this.db.inventoryItems.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Barang tidak ditemukan.');
    const current = this.db.inventoryItems[index];
    const qty = data.quantity !== undefined ? Number(data.quantity) : current.quantity;
    const price = data.unitPrice !== undefined ? Number(data.unitPrice) : current.unitPrice;
    const updated: InventoryItem = {
      ...current,
      ...data,
      quantity: qty,
      unitPrice: price,
      totalValue: qty * price,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: this.getCurrentUser().name,
    };
    this.db.inventoryItems[index] = updated;
    this.recalculateAllNeeds();
    this.save();
    return updated;
  }

  public deleteInventoryItem(id: string): { success: boolean } {
    this.db.inventoryItems = this.db.inventoryItems.filter((i) => i.id !== id);
    this.recalculateAllNeeds();
    this.save();
    return { success: true };
  }

  public transferInventoryItem(data: {
    itemId: string;
    toLocationId: string;
    toLocationName: string;
    quantityMoved: number;
    transferDate: string;
    notes: string;
  }): LocationHistory {
    const item = this.getInventoryItem(data.itemId);
    const prevLocationId = item.locationId;
    const prevLocationName = item.locationName;

    item.locationId = data.toLocationId;
    item.locationName = data.toLocationName;
    item.updatedAt = new Date().toISOString();

    const history: LocationHistory = {
      id: 'hist-' + Date.now(),
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      kib: item.kib,
      fromLocationId: prevLocationId,
      fromLocationName: prevLocationName,
      toLocationId: data.toLocationId,
      toLocationName: data.toLocationName,
      quantityMoved: data.quantityMoved || item.quantity,
      transferDate: data.transferDate || new Date().toISOString().split('T')[0],
      officerName: this.getCurrentUser().name,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.db.locationHistories.unshift(history);
    this.save();
    return history;
  }

  public getLocationHistories(): LocationHistory[] {
    return this.db.locationHistories;
  }

  public updateLocationHistory(
    id: string,
    data: Partial<LocationHistory> & { syncItemLocation?: boolean }
  ): LocationHistory {
    const hist = this.db.locationHistories.find((h) => h.id === id);
    if (!hist) throw new Error('Riwayat perpindahan tidak ditemukan.');
    Object.assign(hist, data);

    if (data.syncItemLocation && hist.toLocationId) {
      const item = this.db.inventoryItems.find((i) => i.id === hist.itemId);
      if (item) {
        item.locationId = hist.toLocationId;
        item.locationName = hist.toLocationName;
        item.updatedAt = new Date().toISOString();
      }
    }
    this.save();
    return hist;
  }

  public deleteLocationHistory(id: string, revertLocation: boolean = false): { success: boolean; message: string } {
    const index = this.db.locationHistories.findIndex((h) => h.id === id);
    if (index === -1) throw new Error('Riwayat tidak ditemukan.');
    const hist = this.db.locationHistories[index];

    if (revertLocation) {
      const item = this.db.inventoryItems.find((i) => i.id === hist.itemId);
      if (item && item.locationId === hist.toLocationId) {
        item.locationId = hist.fromLocationId;
        item.locationName = hist.fromLocationName;
        item.updatedAt = new Date().toISOString();
      }
    }

    this.db.locationHistories.splice(index, 1);
    this.save();
    return { success: true, message: 'Riwayat berhasil dihapus.' };
  }

  // Needs
  public getNeeds(params?: Record<string, string>): NeedItem[] {
    let items = [...this.db.needs];
    if (params?.kib) items = items.filter((n) => n.kib === params.kib);
    if (params?.status) items = items.filter((n) => n.status === params.status);
    return items;
  }

  public createNeed(data: Partial<NeedItem>): NeedItem {
    const now = new Date().toISOString();
    const needed = Number(data.quantityNeeded) || 1;
    const price = Number(data.estimatedUnitPrice) || 0;
    const available = this.calcAvailableForItem(data.name || '', data.kib || 'KIB_B', data.gradeClass, data.isbn);
    const shortage = Math.max(0, needed - available);

    const newNeed: NeedItem = {
      id: 'need-' + Date.now(),
      needCode: 'KBT-' + Date.now().toString().slice(-6),
      kib: data.kib || 'KIB_B',
      name: data.name || '',
      quantityNeeded: needed,
      quantityAvailable: available,
      quantityShortage: shortage,
      unit: data.unit || 'Unit',
      estimatedUnitPrice: price,
      estimatedTotalBudget: shortage * price,
      priority: data.priority || 'Sedang',
      locationId: data.locationId || 'loc-tu',
      locationName: data.locationName || 'Ruang Tata Usaha',
      targetYear: data.targetYear || new Date().getFullYear(),
      plannedFundSource: data.plannedFundSource || 'BOS Reguler',
      status: 'Pengajuan',
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
      createdBy: this.getCurrentUser().name,
      ...data,
    };
    this.db.needs.unshift(newNeed);
    this.save();
    return newNeed;
  }

  public updateNeed(id: string, data: Partial<NeedItem>): NeedItem {
    const index = this.db.needs.findIndex((n) => n.id === id);
    if (index === -1) throw new Error('Kebutuhan tidak ditemukan.');
    const current = this.db.needs[index];
    const needed = data.quantityNeeded !== undefined ? Number(data.quantityNeeded) : current.quantityNeeded;
    const price = data.estimatedUnitPrice !== undefined ? Number(data.estimatedUnitPrice) : current.estimatedUnitPrice;
    const name = data.name || current.name;
    const kib = data.kib || current.kib;

    const available = this.calcAvailableForItem(name, kib, data.gradeClass || current.gradeClass, data.isbn || current.isbn);
    const shortage = Math.max(0, needed - available);

    const updated: NeedItem = {
      ...current,
      ...data,
      quantityNeeded: needed,
      quantityAvailable: available,
      quantityShortage: shortage,
      estimatedUnitPrice: price,
      estimatedTotalBudget: shortage * price,
      updatedAt: new Date().toISOString(),
    };
    this.db.needs[index] = updated;
    this.save();
    return updated;
  }

  public deleteNeed(id: string): { success: boolean } {
    this.db.needs = this.db.needs.filter((n) => n.id !== id);
    this.save();
    return { success: true };
  }

  // Procurements
  public getProcurements(): ProcurementItem[] {
    return this.db.procurements;
  }

  public createProcurement(data: Partial<ProcurementItem>): ProcurementItem {
    const now = new Date().toISOString();
    const qty = Number(data.quantityPurchased || data.quantityProposed) || 1;
    const price = Number(data.actualUnitPrice) || 0;
    const newProc: ProcurementItem = {
      id: 'proc-' + Date.now(),
      procurementNumber: 'PGD-' + Date.now().toString().slice(-6),
      itemName: data.itemName || 'Pengadaan Barang',
      kib: data.kib || 'KIB_B',
      quantityProposed: qty,
      quantityApproved: qty,
      quantityPurchased: qty,
      quantityReceived: 0,
      actualUnitPrice: price,
      totalProcurementValue: qty * price,
      fundSource: data.fundSource || 'BOS Reguler',
      submissionDate: new Date().toISOString().split('T')[0],
      officerName: data.officerName || this.getCurrentUser().name,
      status: 'Pengajuan',
      isTransferredToInventory: false,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.db.procurements.unshift(newProc);
    this.save();
    return newProc;
  }

  public updateProcurement(id: string, data: Partial<ProcurementItem>): ProcurementItem {
    const index = this.db.procurements.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Pengadaan tidak ditemukan.');
    const updated = { ...this.db.procurements[index], ...data, updatedAt: new Date().toISOString() };
    this.db.procurements[index] = updated;
    this.save();
    return updated;
  }

  public deleteProcurement(id: string): { success: boolean } {
    this.db.procurements = this.db.procurements.filter((p) => p.id !== id);
    this.save();
    return { success: true };
  }

  public receiveProcurementToInventory(
    id: string,
    data: any
  ): { inventoryItem: InventoryItem; procurement: ProcurementItem } {
    const proc = this.db.procurements.find((p) => p.id === id);
    if (!proc) throw new Error('Pengadaan tidak ditemukan.');

    const qty = Number(data.receivedQuantity) || proc.quantityPurchased;
    const item = this.createInventoryItem({
      kib: proc.kib,
      name: proc.itemName,
      itemCode: data.itemCode,
      registerNumber: data.registerNumber,
      quantity: qty,
      unitPrice: proc.actualUnitPrice,
      fundSource: proc.fundSource,
      locationId: data.locationId,
      locationName: data.locationName,
      ...data.extraFields,
    });

    proc.quantityReceived = (proc.quantityReceived || 0) + qty;
    if (proc.quantityReceived >= proc.quantityPurchased) {
      proc.status = 'Sudah Diterima';
      proc.isTransferredToInventory = true;
    }
    this.save();

    return { inventoryItem: item, procurement: proc };
  }

  // Locations
  public getLocations(): LocationItem[] {
    return this.db.locations;
  }

  public createLocation(name: string, description: string): LocationItem {
    const newLoc: LocationItem = {
      id: 'loc-' + Date.now(),
      name,
      description,
      isActive: true,
    };
    this.db.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  public updateLocation(id: string, data: { name: string; description: string; isActive?: boolean }): LocationItem {
    const loc = this.db.locations.find((l) => l.id === id);
    if (!loc) throw new Error('Lokasi tidak ditemukan.');
    Object.assign(loc, data);
    this.save();
    return loc;
  }

  // Correction Notes
  public getCorrectionNotes(): CorrectionNote[] {
    return this.db.correctionNotes;
  }

  public createCorrectionNote(data: Partial<CorrectionNote>): CorrectionNote {
    const now = new Date().toISOString();
    const newNote: CorrectionNote = {
      id: 'note-' + Date.now(),
      headmasterName: this.getCurrentUser().name,
      targetModule: data.targetModule || 'UMUM',
      noteText: data.noteText || '',
      urgency: data.urgency || 'Biasa',
      status: 'Menunggu Tanggapan',
      createdAt: now,
      ...data,
    };
    this.db.correctionNotes.unshift(newNote);
    this.save();
    return newNote;
  }

  public respondCorrectionNote(id: string, responseNote: string, status: CorrectionNote['status']): CorrectionNote {
    const note = this.db.correctionNotes.find((n) => n.id === id);
    if (!note) throw new Error('Catatan tidak ditemukan.');
    note.responseNote = responseNote;
    note.status = status;
    note.respondedBy = this.getCurrentUser().name;
    note.respondedAt = new Date().toISOString();
    this.save();
    return note;
  }

  // Settings
  public getSchoolSettings(): SchoolSettings {
    return this.db.schoolSettings;
  }

  public updateSchoolSettings(data: SchoolSettings): SchoolSettings {
    this.db.schoolSettings = { ...data };
    this.save();
    return this.db.schoolSettings;
  }

  public getLetterheadSettings(): LetterheadSettings {
    return this.db.letterheadSettings;
  }

  public updateLetterheadSettings(data: LetterheadSettings): LetterheadSettings {
    this.db.letterheadSettings = { ...data };
    this.save();
    return this.db.letterheadSettings;
  }

  public getStaffSettings(): StaffSettings {
    return this.db.staffSettings;
  }

  public updateStaffSettings(data: StaffSettings): StaffSettings {
    this.db.staffSettings = { ...data };
    this.save();
    return this.db.staffSettings;
  }

  // Activity Logs
  public getActivityLogs(): ActivityLog[] {
    return this.db.activityLogs;
  }

  // Backups
  public getBackups(): BackupRecord[] {
    return this.db.backups;
  }

  public createBackup(notes?: string): BackupRecord {
    const now = new Date().toISOString();
    const backup: BackupRecord = {
      id: 'bk-' + Date.now(),
      filename: `simaset_backup_${new Date().toISOString().split('T')[0]}_local.json`,
      backupDate: now,
      createdBy: this.getCurrentUser().name,
      itemCount: this.db.inventoryItems.length,
      fileSizeBytes: 45000,
      notes: notes || 'Backup lokal otomatis',
    };
    this.db.backups.unshift(backup);
    this.save();
    return backup;
  }

  public restoreBackup(data: any): { success: boolean } {
    if (data && typeof data === 'object') {
      this.db = { ...getInitialLocalData(), ...data };
      this.save();
      return { success: true };
    }
    return { success: false };
  }

  public resetDemoData(): { success: boolean } {
    this.db = getInitialLocalData();
    this.save();
    return { success: true };
  }
}

export const localStore = new LocalStoreManager();
