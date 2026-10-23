export type UserRole = 'admin_tu' | 'pengurus_barang' | 'kepala_sekolah' | 'superadmin';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  nip?: string;
  jabatan?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export type InventoryKIB = 'KIB_B' | 'KIB_E';
export type ItemCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export interface InventoryItem {
  id: string;
  kib: InventoryKIB;
  itemCode: string; // Kode Barang / Kode Buku
  name: string; // Nama Barang / Judul Buku
  brandModel?: string; // Merk/Type (KIB B)
  specification?: string; // Spesifikasi (KIB B)
  registerNumber?: string; // Nomor Register
  year: number; // Tahun Perolehan / Tahun Terbit
  quantity: number; // Jumlah
  unit: string; // Satuan (Unit, Buah, Set, Eksemplar)
  unitPrice: number; // Harga Satuan (Rp)
  totalValue: number; // Nilai Total (quantity * unitPrice)
  fundSource: string; // Sumber Dana (BOS, BOP, Komite, Hibah)
  condition: ItemCondition;
  locationId: string; // Lokasi Penempatan
  locationName: string;
  notes?: string;
  photoUrl?: string; // Foto barang / buku (Base64 atau data URI)
  
  // Specific to KIB E (Buku)
  subject?: string; // Mata Pelajaran
  gradeClass?: string; // Kelas
  author?: string; // Pengarang
  publisher?: string; // Penerbit
  isbn?: string; // ISBN
  
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface LocationItem {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  isActive: boolean;
}

export interface LocationHistory {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  kib: InventoryKIB;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantityMoved: number;
  transferDate: string;
  officerName: string;
  notes: string;
  createdAt: string;
}

export type NeedPriority = 'Sangat Mendesak' | 'Mendesak' | 'Sedang' | 'Rendah';
export type NeedStatus =
  | 'Belum Diajukan'
  | 'Pengajuan'
  | 'Menunggu Persetujuan'
  | 'Disetujui'
  | 'Dalam Proses Pengadaan'
  | 'Sudah Dibeli'
  | 'Sudah Diterima'
  | 'Ditolak'
  | 'Ditunda'
  | 'Selesai';

export interface NeedItem {
  id: string;
  needCode: string;
  kib: InventoryKIB;
  name: string; // Nama Barang / Judul Buku
  brandModel?: string;
  specification?: string;
  quantityNeeded: number; // Jumlah Dibutuhkan
  quantityAvailable: number; // Jumlah Tersedia (auto-calculated)
  quantityShortage: number; // Jumlah Kekurangan = Max(0, Dibutuhkan - Tersedia)
  unit: string;
  estimatedUnitPrice: number; // Perkiraan Harga Satuan
  estimatedTotalBudget: number; // Perkiraan Total Anggaran = Kekurangan * Harga Satuan
  priority: NeedPriority;
  locationId: string;
  locationName: string;
  targetYear: number;
  plannedFundSource: string;
  status: NeedStatus;
  notes?: string;

  // Specific to KIB E
  subject?: string;
  gradeClass?: string;
  author?: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProcurementItem {
  id: string;
  procurementNumber: string;
  needId?: string;
  needCode?: string;
  itemName: string;
  kib: InventoryKIB;
  quantityProposed: number; // Jumlah Diajukan
  quantityApproved: number; // Jumlah Disetujui
  quantityPurchased: number; // Jumlah Dibeli
  quantityReceived: number; // Jumlah Diterima
  actualUnitPrice: number;
  totalProcurementValue: number;
  fundSource: string;
  submissionDate: string;
  approvalDate?: string;
  receivedDate?: string;
  supplierName?: string;
  officerName: string;
  status: NeedStatus;
  notes?: string;
  isTransferredToInventory: boolean;
  transferredItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionNote {
  id: string;
  headmasterName: string;
  targetModule: 'KIB_B' | 'KIB_E' | 'KEBUTUHAN' | 'PENGADAAN' | 'UMUM';
  targetItemId?: string;
  targetItemTitle?: string;
  noteText: string;
  urgency: 'Biasa' | 'Penting' | 'Segera Tindaklanjuti';
  status: 'Menunggu Tanggapan' | 'Sedang Ditindaklanjuti' | 'Selesai Diluruskan';
  createdAt: string;
  responseNote?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface SchoolSettings {
  agencyName: string; // Pemerintah Kabupaten/Kota
  educationDept: string; // Dinas Pendidikan dan Kebudayaan
  schoolName: string; // Nama Sekolah
  npsn: string;
  nss?: string;
  address: string;
  village: string; // Desa/Kelurahan
  district: string; // Kecamatan
  regencyCity: string; // Kabupaten/Kota
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoLeft: string; // Tut Wuri Handayani / Pemda
  logoRight: string; // School Logo
}

export interface LetterheadSettings {
  showAgency: boolean;
  showEducationDept: boolean;
  showSchoolName: boolean;
  showAddress: boolean;
  showContactInfo: boolean;
  showLogoLeft: boolean;
  showLogoRight: boolean;
  fontFamily: string;
  titleFontSize: string; // e.g. '18px'
  subtitleFontSize: string; // e.g. '14px'
  bodyFontSize: string; // e.g. '11px'
  textColor: string;
  borderThickness: number; // e.g. 2 or 3
  logoSizePx: number; // e.g. 70
  spacingBottomMm: number;
  paperSize: 'A4' | 'F4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface StaffSettings {
  headmasterName: string;
  headmasterNip: string;
  headmasterTitle: string;
  showHeadmaster: boolean;

  propertyOfficerName: string; // Pengurus Barang
  propertyOfficerNip: string;
  propertyOfficerTitle: string;
  showPropertyOfficer: boolean;

  assistantPropertyOfficerName: string; // Pengurus Barang Pembantu
  assistantPropertyOfficerNip: string;
  assistantPropertyOfficerTitle: string;
  showAssistantPropertyOfficer: boolean;

  adminStaffName: string; // Tenaga Administrasi
  adminStaffNip: string;
  adminStaffTitle: string;
  showAdminStaff: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'PROCUREMENT_RECEIVE' | 'IMPORT' | 'EXPORT' | 'SETTINGS_UPDATE' | 'BACKUP_RESTORE';
  module: 'AUTH' | 'KIB_B' | 'KIB_E' | 'LOKASI' | 'KEBUTUHAN' | 'PENGADAAN' | 'PENGATURAN' | 'KOP_SURAT' | 'PETUGAS' | 'DATABASE';
  targetId?: string;
  targetTitle?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  backupDate: string;
  createdBy: string;
  itemCount: number;
  fileSizeBytes: number;
  notes: string;
}

export interface RealtimeEvent {
  id: string;
  type: 'INVENTORY_CHANGED' | 'NEEDS_CHANGED' | 'PROCUREMENT_CHANGED' | 'SETTINGS_CHANGED' | 'NOTE_ADDED' | 'USER_ACTION';
  module: string;
  action: string;
  performedBy: string;
  message: string;
  timestamp: string;
}
