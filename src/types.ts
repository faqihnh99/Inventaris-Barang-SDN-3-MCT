export type UserRole = 'admin_tu' | 'pengurus_barang' | 'kepala_sekolah' | 'superadmin';

export interface User {
  id: string;
  username: string;
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
  itemCode: string;
  name: string;
  brandModel?: string;
  specification?: string;
  registerNumber?: string;
  year: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  fundSource: string;
  condition: ItemCondition;
  locationId: string;
  locationName: string;
  notes?: string;
  photoUrl?: string;

  // Specific to KIB E (Buku)
  subject?: string;
  gradeClass?: string;
  author?: string;
  publisher?: string;
  isbn?: string;

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
  name: string;
  brandModel?: string;
  specification?: string;
  quantityNeeded: number;
  quantityAvailable: number;
  quantityShortage: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotalBudget: number;
  priority: NeedPriority;
  locationId: string;
  locationName: string;
  targetYear: number;
  plannedFundSource: string;
  status: NeedStatus;
  notes?: string;

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
  quantityProposed: number;
  quantityApproved: number;
  quantityPurchased: number;
  quantityReceived: number;
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
  agencyName: string;
  educationDept: string;
  schoolName: string;
  npsn: string;
  nss?: string;
  address: string;
  village: string;
  district: string;
  regencyCity: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoLeft: string;
  logoRight: string;
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
  titleFontSize: string;
  subtitleFontSize: string;
  bodyFontSize: string;
  textColor: string;
  borderThickness: number;
  logoSizePx: number;
  spacingBottomMm: number;
  paperSize: 'A4' | 'F4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface StaffSettings {
  headmasterName: string;
  headmasterNip: string;
  headmasterTitle: string;
  showHeadmaster: boolean;

  propertyOfficerName: string;
  propertyOfficerNip: string;
  propertyOfficerTitle: string;
  showPropertyOfficer: boolean;

  assistantPropertyOfficerName: string;
  assistantPropertyOfficerNip: string;
  assistantPropertyOfficerTitle: string;
  showAssistantPropertyOfficer: boolean;

  adminStaffName: string;
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

export interface DashboardStats {
  totalInventory: number;
  totalKibB: number;
  totalKibE: number;
  totalBaik: number;
  totalRusakRingan: number;
  totalRusakBerat: number;
  totalNilaiAset: number;
  totalKebutuhan: number;
  totalKekurangan: number;
  totalEstimasiAnggaran: number;
  totalSangatMendesak: number;
  pengadaanBerjalan: number;
  pengadaanSelesai: number;
  byLocation: Record<string, number>;
  byYear: Record<string, number>;
  byFund: Record<string, number>;
  recentLogs: ActivityLog[];
}
