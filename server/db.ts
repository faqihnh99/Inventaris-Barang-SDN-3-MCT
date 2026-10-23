import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
  RealtimeEvent,
} from './types';

export interface DatabaseSchema {
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'simaset_db.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain + 'simaset_salt_2026').digest('hex');
}

// Default initial data according to master prompt specs
export function getInitialData(): DatabaseSchema {
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
      passwordHash: hashPassword('password123'),
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
      passwordHash: hashPassword('password123'),
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
      passwordHash: hashPassword('password123'),
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
      passwordHash: hashPassword('password123'),
      name: 'Administrator IT Sekolah',
      role: 'superadmin',
      nip: '199008202015031002',
      jabatan: 'Administrator Sistem Inventaris',
      isActive: true,
      createdAt: now,
    },
  ];

  // Specific initial items from prompt requirement (Section 32)
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

  // Specific initial needs from prompt requirement (Section 32):
  // Laptop: Dibutuhkan: 10, Tersedia: 6, Kekurangan: 4
  // Printer: Dibutuhkan: 5, Tersedia: 3, Kekurangan: 2
  // Buku Bahasa Indonesia: Dibutuhkan: 30, Tersedia: 20, Kekurangan: 10
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
      estimatedTotalBudget: 38000000, // 4 * 9,500,000
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
      estimatedTotalBudget: 5000000, // 2 * 2,500,000
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
      estimatedTotalBudget: 650000, // 10 * 65,000
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
      details: 'Sistem SIM-ASET Sekolah diinisialisasi dengan data master dan akun standar',
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

class DatabaseManager {
  private data: DatabaseSchema;
  private sseClients: Set<(event: RealtimeEvent) => void> = new Set();

  constructor() {
    this.ensureDirs();
    this.data = this.loadDatabase();
    this.recalculateAllNeeds();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...getInitialData(),
          ...parsed,
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh:', err);
    }
    const initial = getInitialData();
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave = this.data) {
    try {
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database atomically:', err);
    }
  }

  // Realtime SSE subscriber management
  public subscribeRealtime(client: (event: RealtimeEvent) => void) {
    this.sseClients.add(client);
    return () => {
      this.sseClients.delete(client);
    };
  }

  public broadcast(event: Omit<RealtimeEvent, 'id' | 'timestamp'>) {
    const fullEvent: RealtimeEvent = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...event,
    };
    for (const client of this.sseClients) {
      try {
        client(fullEvent);
      } catch (e) {
        // ignore dead client
      }
    }
  }

  // Audit trail logger
  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.activityLogs.unshift(newLog);
    // Keep max 1000 activity logs
    if (this.data.activityLogs.length > 1000) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 1000);
    }
    this.saveDatabase();
  }

  // Recalculates available quantity and shortage for all needs based on live inventory
  public recalculateAllNeeds() {
    let changed = false;
    for (const need of this.data.needs) {
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
        if (shortage === 0 && need.status !== 'Selesai') {
          // If shortage reached zero, mark as Selesai if already received
          if (need.status === 'Sudah Diterima') {
            need.status = 'Selesai';
          }
        }
        need.updatedAt = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) {
      this.saveDatabase();
    }
  }

  private calcAvailableForItem(name: string, kib: string, gradeClass?: string, isbn?: string): number {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetNorm = norm(name);

    return this.data.inventoryItems
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

  // Getters
  public getUsers() {
    return this.data.users;
  }
  public getLocations() {
    return this.data.locations;
  }
  public getInventoryItems() {
    return this.data.inventoryItems;
  }
  public getLocationHistories() {
    return this.data.locationHistories;
  }
  public getNeeds() {
    return this.data.needs;
  }
  public getProcurements() {
    return this.data.procurements;
  }
  public getCorrectionNotes() {
    return this.data.correctionNotes;
  }
  public getSchoolSettings() {
    return this.data.schoolSettings;
  }
  public getLetterheadSettings() {
    return this.data.letterheadSettings;
  }
  public getStaffSettings() {
    return this.data.staffSettings;
  }
  public getActivityLogs() {
    return this.data.activityLogs;
  }
  public getBackups() {
    return this.data.backups;
  }

  // Mutations
  public updateSchoolSettings(settings: SchoolSettings, actor: User) {
    this.data.schoolSettings = { ...settings };
    this.saveDatabase();
    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'SETTINGS_UPDATE',
      module: 'PENGATURAN',
      details: 'Memperbarui identitas dan profil sekolah',
    });
    this.broadcast({
      type: 'SETTINGS_CHANGED',
      module: 'PENGATURAN',
      action: 'UPDATE',
      performedBy: actor.name,
      message: 'Pengaturan identitas sekolah telah diperbarui',
    });
    return this.data.schoolSettings;
  }

  public updateLetterheadSettings(settings: LetterheadSettings, actor: User) {
    this.data.letterheadSettings = { ...settings };
    this.saveDatabase();
    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'SETTINGS_UPDATE',
      module: 'KOP_SURAT',
      details: 'Memperbarui konfigurasi kop surat dan format cetak',
    });
    this.broadcast({
      type: 'SETTINGS_CHANGED',
      module: 'KOP_SURAT',
      action: 'UPDATE',
      performedBy: actor.name,
      message: 'Format kop surat dan margin cetak telah diperbarui',
    });
    return this.data.letterheadSettings;
  }

  public updateStaffSettings(settings: StaffSettings, actor: User) {
    const prevStaff = this.data.staffSettings.assistantPropertyOfficerName;
    this.data.staffSettings = { ...settings };
    this.saveDatabase();
    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'SETTINGS_UPDATE',
      module: 'PETUGAS',
      details: `Memperbarui data pejabat penandatangan. Pengurus Barang Pembantu: ${settings.assistantPropertyOfficerName} (sebelumnya: ${prevStaff})`,
      previousValue: prevStaff,
      newValue: settings.assistantPropertyOfficerName,
    });
    this.broadcast({
      type: 'SETTINGS_CHANGED',
      module: 'PETUGAS',
      action: 'UPDATE',
      performedBy: actor.name,
      message: `Nama Pengurus Barang Pembantu diubah menjadi: ${settings.assistantPropertyOfficerName}`,
    });
    return this.data.staffSettings;
  }

  // Inventory CRUD
  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>, actor: User): InventoryItem {
    // Check duplication of item code or register number
    if (this.data.inventoryItems.some((i) => i.itemCode === item.itemCode)) {
      throw new Error(`Kode Barang / Buku "${item.itemCode}" sudah terdaftar.`);
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      totalValue: Number(item.quantity) * Number(item.unitPrice),
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.name,
      updatedBy: actor.name,
    };

    this.data.inventoryItems.unshift(newItem);
    this.recalculateAllNeeds();
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: item.kib,
      targetId: newItem.id,
      targetTitle: newItem.name,
      details: `Menambahkan barang baru: ${newItem.name} (${newItem.itemCode}) sejumlah ${newItem.quantity} ${newItem.unit} di ${newItem.locationName}`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: item.kib,
      action: 'CREATE',
      performedBy: actor.name,
      message: `Barang baru ditambahkan: ${newItem.name} (${newItem.quantity} ${newItem.unit})`,
    });

    return newItem;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>, expectedVersion: number | undefined, actor: User): InventoryItem {
    const index = this.data.inventoryItems.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error('Barang inventaris tidak ditemukan.');
    }

    const current = this.data.inventoryItems[index];

    // Optimistic locking version check
    if (expectedVersion !== undefined && current.version !== expectedVersion) {
      throw new Error('KONFLIK_DATA: Data barang ini telah diubah oleh pengguna lain di perangkat berbeda. Silakan muat ulang data terbaru terlebih dahulu.');
    }

    const prevName = current.name;
    const prevQty = current.quantity;
    const prevLocation = current.locationName;
    const prevCondition = current.condition;

    const quantity = updates.quantity !== undefined ? Number(updates.quantity) : current.quantity;
    const unitPrice = updates.unitPrice !== undefined ? Number(updates.unitPrice) : current.unitPrice;

    const updatedItem: InventoryItem = {
      ...current,
      ...updates,
      quantity,
      unitPrice,
      totalValue: quantity * unitPrice,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.name,
    };

    this.data.inventoryItems[index] = updatedItem;
    this.recalculateAllNeeds();
    this.saveDatabase();

    const changeDetails: string[] = [];
    if (updates.quantity !== undefined && updates.quantity !== prevQty) {
      changeDetails.push(`Jumlah: ${prevQty} -> ${updates.quantity}`);
    }
    if (updates.condition && updates.condition !== prevCondition) {
      changeDetails.push(`Kondisi: ${prevCondition} -> ${updates.condition}`);
    }
    if (updates.locationName && updates.locationName !== prevLocation) {
      changeDetails.push(`Lokasi: ${prevLocation} -> ${updates.locationName}`);
    }

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: current.kib,
      targetId: current.id,
      targetTitle: current.name,
      details: `Memperbarui ${current.name}: ${changeDetails.join(', ') || 'Data atribut diperbarui'}`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: current.kib,
      action: 'UPDATE',
      performedBy: actor.name,
      message: `Data barang ${updatedItem.name} telah diperbarui`,
    });

    return updatedItem;
  }

  public deleteInventoryItem(id: string, actor: User): boolean {
    const item = this.data.inventoryItems.find((i) => i.id === id);
    if (!item) {
      throw new Error('Barang inventaris tidak ditemukan.');
    }

    this.data.inventoryItems = this.data.inventoryItems.filter((i) => i.id !== id);
    this.recalculateAllNeeds();
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'DELETE',
      module: item.kib,
      targetId: item.id,
      targetTitle: item.name,
      details: `Menghapus inventaris: ${item.name} (${item.itemCode})`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: item.kib,
      action: 'DELETE',
      performedBy: actor.name,
      message: `Barang ${item.name} telah dihapus dari inventaris`,
    });

    return true;
  }

  // Transfer item location
  public transferItem(
    itemId: string,
    toLocationId: string,
    toLocationName: string,
    quantityToMove: number,
    transferDate: string,
    notes: string,
    actor: User
  ): LocationHistory {
    const item = this.data.inventoryItems.find((i) => i.id === itemId);
    if (!item) {
      throw new Error('Barang tidak ditemukan.');
    }
    if (item.locationId === toLocationId) {
      throw new Error('Lokasi tujuan sama dengan lokasi saat ini.');
    }

    const prevLocationId = item.locationId;
    const prevLocationName = item.locationName;

    // Update item location
    item.locationId = toLocationId;
    item.locationName = toLocationName;
    item.version += 1;
    item.updatedAt = new Date().toISOString();
    item.updatedBy = actor.name;

    const history: LocationHistory = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      kib: item.kib,
      fromLocationId: prevLocationId,
      fromLocationName: prevLocationName,
      toLocationId,
      toLocationName,
      quantityMoved: quantityToMove || item.quantity,
      transferDate: transferDate || new Date().toISOString().split('T')[0],
      officerName: actor.name,
      notes: notes || 'Perpindahan penempatan barang operasional',
      createdAt: new Date().toISOString(),
    };

    this.data.locationHistories.unshift(history);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'TRANSFER',
      module: 'LOKASI',
      targetId: item.id,
      targetTitle: item.name,
      details: `Perpindahan barang: ${item.name} dari "${prevLocationName}" ke "${toLocationName}" (${history.quantityMoved} ${item.unit})`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: 'LOKASI',
      action: 'TRANSFER',
      performedBy: actor.name,
      message: `${item.name} dipindahkan dari ${prevLocationName} ke ${toLocationName}`,
    });

    return history;
  }

  public updateLocationHistory(
    id: string,
    updates: Partial<LocationHistory>,
    syncItemLocation: boolean,
    actor: User
  ): LocationHistory {
    const history = this.data.locationHistories.find((h) => h.id === id);
    if (!history) {
      throw new Error('Riwayat perpindahan tidak ditemukan.');
    }

    if (updates.transferDate) history.transferDate = updates.transferDate;
    if (updates.fromLocationId && updates.fromLocationName) {
      history.fromLocationId = updates.fromLocationId;
      history.fromLocationName = updates.fromLocationName;
    }
    if (updates.toLocationId && updates.toLocationName) {
      history.toLocationId = updates.toLocationId;
      history.toLocationName = updates.toLocationName;
    }
    if (updates.quantityMoved !== undefined && updates.quantityMoved > 0) {
      history.quantityMoved = Number(updates.quantityMoved);
    }
    if (updates.officerName) history.officerName = updates.officerName;
    if (updates.notes !== undefined) history.notes = updates.notes;

    // Optionally synchronize the current location of the item in inventory
    if (syncItemLocation && history.toLocationId) {
      const item = this.data.inventoryItems.find((i) => i.id === history.itemId);
      if (item) {
        item.locationId = history.toLocationId;
        item.locationName = history.toLocationName;
        item.version += 1;
        item.updatedAt = new Date().toISOString();
        item.updatedBy = actor.name;
      }
    }

    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'LOKASI',
      targetId: history.id,
      targetTitle: history.itemName,
      details: `Memperbarui riwayat perpindahan barang: ${history.itemName} (${history.fromLocationName} ke ${history.toLocationName})`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: 'LOKASI',
      action: 'TRANSFER_UPDATE',
      performedBy: actor.name,
      message: `Riwayat perpindahan ${history.itemName} telah diperbarui`,
    });

    return history;
  }

  public deleteLocationHistory(
    id: string,
    revertItemLocation: boolean,
    actor: User
  ): boolean {
    const index = this.data.locationHistories.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error('Riwayat perpindahan tidak ditemukan.');
    }

    const history = this.data.locationHistories[index];

    // Optionally revert the current physical location of the item back to fromLocation
    if (revertItemLocation) {
      const item = this.data.inventoryItems.find((i) => i.id === history.itemId);
      if (item && item.locationId === history.toLocationId) {
        item.locationId = history.fromLocationId;
        item.locationName = history.fromLocationName;
        item.version += 1;
        item.updatedAt = new Date().toISOString();
        item.updatedBy = actor.name;
      }
    }

    this.data.locationHistories.splice(index, 1);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'DELETE',
      module: 'LOKASI',
      targetId: history.id,
      targetTitle: history.itemName,
      details: `Menghapus riwayat perpindahan barang: ${history.itemName} (${history.fromLocationName} ke ${history.toLocationName})`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: 'LOKASI',
      action: 'TRANSFER_DELETE',
      performedBy: actor.name,
      message: `Catatan perpindahan ${history.itemName} telah dihapus`,
    });

    return true;
  }

  // Needs CRUD
  public addNeedItem(need: Omit<NeedItem, 'id' | 'createdAt' | 'updatedAt' | 'quantityAvailable' | 'quantityShortage' | 'estimatedTotalBudget'>, actor: User): NeedItem {
    const available = this.calcAvailableForItem(need.name, need.kib, need.gradeClass, need.isbn);
    const shortage = Math.max(0, need.quantityNeeded - available);
    const totalBudget = shortage * (Number(need.estimatedUnitPrice) || 0);

    const now = new Date().toISOString();
    const newNeed: NeedItem = {
      ...need,
      id: 'need-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      quantityAvailable: available,
      quantityShortage: shortage,
      estimatedTotalBudget: totalBudget,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.name,
    };

    this.data.needs.unshift(newNeed);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: 'KEBUTUHAN',
      targetId: newNeed.id,
      targetTitle: newNeed.name,
      details: `Menginput kebutuhan baru: ${newNeed.name} (Dibutuhkan: ${newNeed.quantityNeeded}, Tersedia: ${available}, Kekurangan: ${shortage})`,
    });

    this.broadcast({
      type: 'NEEDS_CHANGED',
      module: 'KEBUTUHAN',
      action: 'CREATE',
      performedBy: actor.name,
      message: `Usulan kebutuhan baru: ${newNeed.name} (Kekurangan: ${shortage} ${newNeed.unit})`,
    });

    return newNeed;
  }

  public updateNeedItem(id: string, updates: Partial<NeedItem>, actor: User): NeedItem {
    const index = this.data.needs.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error('Data kebutuhan tidak ditemukan.');
    }

    const current = this.data.needs[index];
    const targetName = updates.name || current.name;
    const targetKib = updates.kib || current.kib;
    const targetQtyNeeded = updates.quantityNeeded !== undefined ? Number(updates.quantityNeeded) : current.quantityNeeded;
    const targetUnitPrice = updates.estimatedUnitPrice !== undefined ? Number(updates.estimatedUnitPrice) : current.estimatedUnitPrice;

    const available = this.calcAvailableForItem(targetName, targetKib, updates.gradeClass || current.gradeClass, updates.isbn || current.isbn);
    const shortage = Math.max(0, targetQtyNeeded - available);
    const totalBudget = shortage * targetUnitPrice;

    const updatedNeed: NeedItem = {
      ...current,
      ...updates,
      quantityNeeded: targetQtyNeeded,
      quantityAvailable: available,
      quantityShortage: shortage,
      estimatedUnitPrice: targetUnitPrice,
      estimatedTotalBudget: totalBudget,
      updatedAt: new Date().toISOString(),
    };

    this.data.needs[index] = updatedNeed;
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'KEBUTUHAN',
      targetId: current.id,
      targetTitle: current.name,
      details: `Memperbarui kebutuhan: ${current.name} (Status: ${updatedNeed.status})`,
    });

    this.broadcast({
      type: 'NEEDS_CHANGED',
      module: 'KEBUTUHAN',
      action: 'UPDATE',
      performedBy: actor.name,
      message: `Kebutuhan ${updatedNeed.name} diperbarui (Status: ${updatedNeed.status})`,
    });

    return updatedNeed;
  }

  public deleteNeedItem(id: string, actor: User): boolean {
    const need = this.data.needs.find((n) => n.id === id);
    if (!need) {
      throw new Error('Data kebutuhan tidak ditemukan.');
    }

    this.data.needs = this.data.needs.filter((n) => n.id !== id);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'DELETE',
      module: 'KEBUTUHAN',
      targetId: need.id,
      targetTitle: need.name,
      details: `Menghapus kebutuhan: ${need.name} (${need.needCode})`,
    });

    this.broadcast({
      type: 'NEEDS_CHANGED',
      module: 'KEBUTUHAN',
      action: 'DELETE',
      performedBy: actor.name,
      message: `Kebutuhan ${need.name} telah dihapus`,
    });

    return true;
  }

  // Procurement CRUD
  public addProcurement(proc: Omit<ProcurementItem, 'id' | 'createdAt' | 'updatedAt' | 'isTransferredToInventory'>, actor: User): ProcurementItem {
    const now = new Date().toISOString();
    const newProc: ProcurementItem = {
      ...proc,
      id: 'proc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      isTransferredToInventory: false,
      createdAt: now,
      updatedAt: now,
    };

    this.data.procurements.unshift(newProc);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: 'PENGADAAN',
      targetId: newProc.id,
      targetTitle: newProc.itemName,
      details: `Membuat data pengadaan: ${newProc.itemName} (${newProc.procurementNumber}) sebanyak ${newProc.quantityPurchased}`,
    });

    this.broadcast({
      type: 'PROCUREMENT_CHANGED',
      module: 'PENGADAAN',
      action: 'CREATE',
      performedBy: actor.name,
      message: `Pengadaan baru dibuat: ${newProc.itemName} (${newProc.procurementNumber})`,
    });

    return newProc;
  }

  public updateProcurement(id: string, updates: Partial<ProcurementItem>, actor: User): ProcurementItem {
    const index = this.data.procurements.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Data pengadaan tidak ditemukan.');
    }

    const current = this.data.procurements[index];
    const updated: ProcurementItem = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.procurements[index] = updated;
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'PENGADAAN',
      targetId: current.id,
      targetTitle: current.itemName,
      details: `Memperbarui pengadaan ${current.procurementNumber}: Status ${updated.status}, Diterima: ${updated.quantityReceived}`,
    });

    this.broadcast({
      type: 'PROCUREMENT_CHANGED',
      module: 'PENGADAAN',
      action: 'UPDATE',
      performedBy: actor.name,
      message: `Pengadaan ${updated.procurementNumber} diperbarui (Status: ${updated.status})`,
    });

    return updated;
  }

  public deleteProcurement(id: string, actor: User): boolean {
    const proc = this.data.procurements.find((p) => p.id === id);
    if (!proc) {
      throw new Error('Data pengadaan tidak ditemukan.');
    }

    this.data.procurements = this.data.procurements.filter((p) => p.id !== id);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'DELETE',
      module: 'PENGADAAN',
      targetId: proc.id,
      targetTitle: proc.itemName,
      details: `Menghapus data pengadaan: ${proc.itemName} (${proc.procurementNumber})`,
    });

    this.broadcast({
      type: 'PROCUREMENT_CHANGED',
      module: 'PENGADAAN',
      action: 'DELETE',
      performedBy: actor.name,
      message: `Pengadaan ${proc.procurementNumber} telah dihapus`,
    });

    return true;
  }

  // ATOMIC INTEGRATION: Receive procurement items & insert directly into inventory!
  public receiveProcurementToInventory(
    procurementId: string,
    receivedQuantity: number,
    locationId: string,
    locationName: string,
    itemCode: string,
    registerNumber: string,
    extraFields: Partial<InventoryItem>,
    actor: User
  ): { inventoryItem: InventoryItem; procurement: ProcurementItem } {
    const proc = this.data.procurements.find((p) => p.id === procurementId);
    if (!proc) {
      throw new Error('Data pengadaan tidak ditemukan.');
    }

    if (proc.isTransferredToInventory && proc.quantityReceived >= proc.quantityPurchased) {
      throw new Error('Barang dari pengadaan ini sudah seluruhnya masuk ke inventaris.');
    }

    if (receivedQuantity <= 0) {
      throw new Error('Jumlah barang yang diterima harus lebih dari 0.');
    }

    // Auto-generate code if empty
    const finalItemCode = itemCode || (proc.kib === 'KIB_B' ? `02.06.01.${Date.now().toString().slice(-4)}` : `05.17.01.${Date.now().toString().slice(-4)}`);
    const finalRegNum = registerNumber || `REG-${new Date().getFullYear()}-${proc.kib === 'KIB_B' ? 'B' : 'E'}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create inventory item
    const now = new Date().toISOString();
    const inventoryItem: InventoryItem = {
      id: 'inv-proc-' + Date.now(),
      kib: proc.kib,
      itemCode: finalItemCode,
      name: proc.itemName,
      brandModel: extraFields.brandModel || '',
      specification: extraFields.specification || '',
      registerNumber: finalRegNum,
      year: new Date().getFullYear(),
      quantity: receivedQuantity,
      unit: extraFields.unit || 'Unit',
      unitPrice: proc.actualUnitPrice || 0,
      totalValue: receivedQuantity * (proc.actualUnitPrice || 0),
      fundSource: proc.fundSource,
      condition: 'Baik',
      locationId,
      locationName,
      notes: `Hasil pengadaan ${proc.procurementNumber}. Diterima oleh ${actor.name}`,
      subject: extraFields.subject,
      gradeClass: extraFields.gradeClass,
      author: extraFields.author,
      publisher: extraFields.publisher,
      isbn: extraFields.isbn,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.name,
      updatedBy: actor.name,
    };

    this.data.inventoryItems.unshift(inventoryItem);

    // Update procurement status
    proc.quantityReceived = (proc.quantityReceived || 0) + receivedQuantity;
    proc.receivedDate = now.split('T')[0];
    if (proc.quantityReceived >= proc.quantityPurchased) {
      proc.status = 'Sudah Diterima';
      proc.isTransferredToInventory = true;
    } else {
      proc.status = 'Dalam Proses Pengadaan';
    }
    proc.transferredItemId = inventoryItem.id;
    proc.updatedAt = now;

    // If linked to a need, update need
    if (proc.needId) {
      const need = this.data.needs.find((n) => n.id === proc.needId);
      if (need) {
        if (proc.quantityReceived >= proc.quantityPurchased) {
          need.status = 'Sudah Diterima';
        }
      }
    }

    // Recalculate shortage and budget across all needs
    this.recalculateAllNeeds();
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'PROCUREMENT_RECEIVE',
      module: proc.kib,
      targetId: inventoryItem.id,
      targetTitle: inventoryItem.name,
      details: `Penerimaan barang pengadaan: ${inventoryItem.name} (${receivedQuantity} ${inventoryItem.unit}) masuk ke inventaris ${proc.kib} di ${locationName}. Pengadaan No: ${proc.procurementNumber}`,
    });

    this.broadcast({
      type: 'INVENTORY_CHANGED',
      module: proc.kib,
      action: 'PROCUREMENT_RECEIVE',
      performedBy: actor.name,
      message: `Barang hasil pengadaan masuk ke inventaris: ${inventoryItem.name} (${receivedQuantity} ${inventoryItem.unit})`,
    });

    return { inventoryItem, procurement: proc };
  }

  // Correction Notes (Kepala Sekolah)
  public addCorrectionNote(note: Omit<CorrectionNote, 'id' | 'createdAt' | 'status'>, actor: User): CorrectionNote {
    const newNote: CorrectionNote = {
      ...note,
      id: 'cn-' + Date.now(),
      status: 'Menunggu Tanggapan',
      createdAt: new Date().toISOString(),
    };

    this.data.correctionNotes.unshift(newNote);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: 'UMUM' as any,
      targetId: newNote.targetItemId,
      targetTitle: newNote.targetItemTitle,
      details: `Kepala Sekolah mengirimkan Catatan/Koreksi Data: "${newNote.noteText.slice(0, 60)}..."`,
    });

    this.broadcast({
      type: 'NOTE_ADDED',
      module: 'CATATAN_KOREKSI',
      action: 'CREATE',
      performedBy: actor.name,
      message: `Catatan baru dari Kepala Sekolah untuk ${newNote.targetItemTitle || newNote.targetModule}`,
    });

    return newNote;
  }

  public respondCorrectionNote(id: string, responseNote: string, status: CorrectionNote['status'], actor: User): CorrectionNote {
    const note = this.data.correctionNotes.find((n) => n.id === id);
    if (!note) {
      throw new Error('Catatan koreksi tidak ditemukan.');
    }

    note.responseNote = responseNote;
    note.status = status;
    note.respondedBy = actor.name;
    note.respondedAt = new Date().toISOString();

    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'UMUM' as any,
      targetId: note.id,
      details: `Menanggapi catatan koreksi Kepala Sekolah (Status: ${status})`,
    });

    this.broadcast({
      type: 'NOTE_ADDED',
      module: 'CATATAN_KOREKSI',
      action: 'UPDATE',
      performedBy: actor.name,
      message: `Catatan koreksi telah ditanggapi oleh ${actor.name}`,
    });

    return note;
  }

  // Backup & Restore
  public createBackup(actor: User, notes = 'Backup otomatis / manual sistem SIM-ASET'): BackupRecord {
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-');
    const filename = `simaset_backup_${dateStr}.json`;
    const fullPath = path.join(BACKUPS_DIR, filename);

    const backupPayload = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(fullPath, backupPayload, 'utf-8');

    const record: BackupRecord = {
      id: 'bkp-' + Date.now(),
      filename,
      backupDate: now.toISOString(),
      createdBy: actor.name,
      itemCount: this.data.inventoryItems.length,
      fileSizeBytes: Buffer.byteLength(backupPayload, 'utf-8'),
      notes,
    };

    this.data.backups.unshift(record);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'BACKUP_RESTORE',
      module: 'DATABASE',
      details: `Membuat backup database: ${filename} (${this.data.inventoryItems.length} inventaris)`,
    });

    return record;
  }

  public restoreBackup(payload: Partial<DatabaseSchema>, actor: User): boolean {
    if (!payload.inventoryItems || !payload.schoolSettings) {
      throw new Error('Format file backup tidak valid atau tidak memiliki data inventaris / sekolah.');
    }

    // Retain backups list and current users if not provided
    this.data = {
      ...getInitialData(),
      ...payload,
      backups: this.data.backups,
    };

    this.recalculateAllNeeds();
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'BACKUP_RESTORE',
      module: 'DATABASE',
      details: `Melakukan restore database. Total inventaris dipulihkan: ${this.data.inventoryItems.length}`,
    });

    this.broadcast({
      type: 'SETTINGS_CHANGED',
      module: 'DATABASE',
      action: 'RESTORE',
      performedBy: actor.name,
      message: 'Database berhasil dipulihkan dari backup. Memuat data terbaru...',
    });

    return true;
  }

  public resetToDemoData(actor: User): void {
    const initial = getInitialData();
    this.data = {
      ...initial,
      backups: this.data.backups,
    };
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'BACKUP_RESTORE',
      module: 'DATABASE',
      details: 'Mengembalikan database ke data awal standar sekolah',
    });

    this.broadcast({
      type: 'SETTINGS_CHANGED',
      module: 'DATABASE',
      action: 'RESET',
      performedBy: actor.name,
      message: 'Database telah direset ke data awal standar sekolah',
    });
  }

  // Location CRUD
  public addLocation(name: string, description: string, actor: User): LocationItem {
    const loc: LocationItem = {
      id: 'loc-' + Date.now(),
      name,
      description,
      isActive: true,
    };
    this.data.locations.push(loc);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: 'LOKASI',
      details: `Menambahkan lokasi master baru: "${name}"`,
    });

    return loc;
  }

  public updateLocation(id: string, name: string, description: string, isActive: boolean, actor: User): LocationItem {
    const loc = this.data.locations.find((l) => l.id === id);
    if (!loc) throw new Error('Lokasi tidak ditemukan.');

    const oldName = loc.name;
    loc.name = name;
    loc.description = description;
    loc.isActive = isActive;

    // Update references in inventory if name changed
    if (oldName !== name) {
      for (const item of this.data.inventoryItems) {
        if (item.locationId === id) {
          item.locationName = name;
        }
      }
    }

    this.saveDatabase();
    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'LOKASI',
      details: `Memperbarui lokasi master: "${oldName}" -> "${name}"`,
    });

    return loc;
  }

  // User CRUD
  public addUser(userData: { username: string; password: string; name: string; role: User['role']; nip?: string; jabatan?: string }, actor: User): User {
    if (this.data.users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error(`Username "${userData.username}" sudah digunakan.`);
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: userData.username,
      passwordHash: hashPassword(userData.password),
      name: userData.name,
      role: userData.role,
      nip: userData.nip,
      jabatan: userData.jabatan,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'CREATE',
      module: 'AUTH',
      targetId: newUser.id,
      targetTitle: newUser.name,
      details: `Menambahkan pengguna baru: ${newUser.username} (${newUser.role})`,
    });

    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>, actor: User): User {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    if (updates.name) user.name = updates.name;
    if (updates.role) user.role = updates.role;
    if (updates.nip !== undefined) user.nip = updates.nip;
    if (updates.jabatan !== undefined) user.jabatan = updates.jabatan;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;

    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'AUTH',
      targetId: user.id,
      targetTitle: user.name,
      details: `Memperbarui akun pengguna: ${user.username}`,
    });

    return user;
  }

  public resetUserPassword(id: string, newPass: string, actor: User): boolean {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    user.passwordHash = hashPassword(newPass);
    this.saveDatabase();

    this.logActivity({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'UPDATE',
      module: 'AUTH',
      targetId: user.id,
      targetTitle: user.name,
      details: `Mereset password pengguna: ${user.username}`,
    });

    return true;
  }
}

export const db = new DatabaseManager();
