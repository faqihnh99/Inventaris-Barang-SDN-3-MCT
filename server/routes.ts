import { Router, Response } from 'express';
import { db, hashPassword } from './db';
import {
  authenticate,
  generateToken,
  revokeToken,
  requireRoles,
  forbidReadOnly,
  AuthenticatedRequest,
} from './auth';
import { InventoryItem, NeedItem, ProcurementItem } from './types';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username dan password wajib diisi.' });
    return;
  }

  const user = db.getUsers().find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    res.status(401).json({ error: 'Username atau password salah.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Akun ini sedang dinonaktifkan oleh Administrator.' });
    return;
  }

  const incomingHash = hashPassword(password);
  if (user.passwordHash !== incomingHash) {
    res.status(401).json({ error: 'Username atau password salah.' });
    return;
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  const token = generateToken(user);

  db.logActivity({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN',
    module: 'AUTH',
    details: `Login berhasil dari perangkat (${user.role})`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const { passwordHash, ...userClean } = user;
  res.json({
    token,
    user: userClean,
  });
});

apiRouter.get('/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  const { passwordHash, ...userClean } = req.user!;
  res.json({ user: userClean });
});

apiRouter.post('/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokeToken(authHeader.substring(7));
  }

  db.logActivity({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'LOGOUT',
    module: 'AUTH',
    details: 'Pengguna melakukan logout sesi',
  });

  res.json({ success: true, message: 'Logout berhasil.' });
});

apiRouter.get('/users', authenticate, (req: AuthenticatedRequest, res) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u);
  res.json(users);
});

apiRouter.post('/users', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const { username, password, name, role, nip, jabatan } = req.body;
    if (!username || !password || !name || !role) {
      res.status(400).json({ error: 'Semua bidang wajib diisi.' });
      return;
    }
    const newUser = db.addUser({ username, password, name, role, nip, jabatan }, req.user!);
    const { passwordHash, ...clean } = newUser;
    res.status(201).json(clean);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/users/:id', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateUser(req.params.id, req.body, req.user!);
    const { passwordHash, ...clean } = updated;
    res.json(clean);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/users/:id/reset-password', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      return;
    }
    db.resetUserPassword(req.params.id, newPassword, req.user!);
    res.json({ success: true, message: 'Password pengguna berhasil direset.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. REALTIME SERVER-SENT EVENTS (SSE)
// ==========================================

apiRouter.get('/realtime/stream', (req, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Live Connection Established' })}\n\n`);

  const unsubscribe = db.subscribeRealtime((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

// ==========================================
// 3. DASHBOARD STATS
// ==========================================

apiRouter.get('/dashboard/stats', authenticate, (_req, res) => {
  const items = db.getInventoryItems();
  const needs = db.getNeeds();
  const procs = db.getProcurements();

  const totalInventory = items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const totalKibB = items.filter((i) => i.kib === 'KIB_B').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const totalKibE = items.filter((i) => i.kib === 'KIB_E').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

  const totalBaik = items.filter((i) => i.condition === 'Baik').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const totalRusakRingan = items.filter((i) => i.condition === 'Rusak Ringan').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
  const totalRusakBerat = items.filter((i) => i.condition === 'Rusak Berat').reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

  const totalNilaiAset = items.reduce((acc, i) => acc + (Number(i.totalValue) || 0), 0);

  const totalKebutuhan = needs.reduce((acc, n) => acc + (Number(n.quantityNeeded) || 0), 0);
  const totalKekurangan = needs.reduce((acc, n) => acc + (Number(n.quantityShortage) || 0), 0);
  const totalEstimasiAnggaran = needs.reduce((acc, n) => acc + (Number(n.estimatedTotalBudget) || 0), 0);
  const totalSangatMendesak = needs.filter((n) => n.priority === 'Sangat Mendesak').length;

  const pengadaanBerjalan = procs.filter((p) => p.status === 'Dalam Proses Pengadaan' || p.status === 'Disetujui').length;
  const pengadaanSelesai = procs.filter((p) => p.status === 'Sudah Diterima' || p.status === 'Selesai').length;

  // Groupings for charts
  const byLocation: Record<string, number> = {};
  for (const item of items) {
    byLocation[item.locationName] = (byLocation[item.locationName] || 0) + item.quantity;
  }

  const byYear: Record<string, number> = {};
  for (const item of items) {
    const yr = String(item.year || 'Lainnya');
    byYear[yr] = (byYear[yr] || 0) + item.quantity;
  }

  const byFund: Record<string, number> = {};
  for (const item of items) {
    const f = item.fundSource || 'Lainnya';
    byFund[f] = (byFund[f] || 0) + item.quantity;
  }

  res.json({
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
    recentLogs: db.getActivityLogs().slice(0, 8),
  });
});

// ==========================================
// 4. INVENTORY ITEMS (KIB B & KIB E)
// ==========================================

apiRouter.get('/inventory/items', authenticate, (req, res) => {
  let items = db.getInventoryItems();
  const { kib, locationId, condition, year, fundSource, search } = req.query;

  if (kib) {
    items = items.filter((i) => i.kib === kib);
  }
  if (locationId) {
    items = items.filter((i) => i.locationId === locationId);
  }
  if (condition) {
    items = items.filter((i) => i.condition === condition);
  }
  if (year) {
    items = items.filter((i) => String(i.year) === String(year));
  }
  if (fundSource) {
    items = items.filter((i) => i.fundSource === fundSource);
  }
  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.itemCode.toLowerCase().includes(term) ||
        (i.registerNumber && i.registerNumber.toLowerCase().includes(term)) ||
        (i.brandModel && i.brandModel.toLowerCase().includes(term)) ||
        (i.author && i.author.toLowerCase().includes(term)) ||
        (i.publisher && i.publisher.toLowerCase().includes(term)) ||
        (i.isbn && i.isbn.toLowerCase().includes(term)) ||
        (i.subject && i.subject.toLowerCase().includes(term))
    );
  }

  res.json(items);
});

apiRouter.get('/inventory/items/:id', authenticate, (req, res) => {
  const item = db.getInventoryItems().find((i) => i.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Barang tidak ditemukan.' });
    return;
  }
  res.json(item);
});

apiRouter.post('/inventory/items', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const newItem = db.addInventoryItem(req.body, req.user!);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/inventory/items/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const expectedVersion = req.body.version !== undefined ? Number(req.body.version) : undefined;
    const updated = db.updateInventoryItem(req.params.id, req.body, expectedVersion, req.user!);
    res.json(updated);
  } catch (err: any) {
    if (err.message?.startsWith('KONFLIK_DATA')) {
      res.status(409).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

apiRouter.delete('/inventory/items/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    db.deleteInventoryItem(req.params.id, req.user!);
    res.json({ success: true, message: 'Barang berhasil dihapus.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/inventory/transfer', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const { itemId, toLocationId, toLocationName, quantityMoved, transferDate, notes } = req.body;
    if (!itemId || !toLocationId) {
      res.status(400).json({ error: 'Barang dan lokasi tujuan wajib dipilih.' });
      return;
    }
    const history = db.transferItem(itemId, toLocationId, toLocationName, quantityMoved, transferDate, notes, req.user!);
    res.status(201).json(history);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/inventory/histories', authenticate, (_req, res) => {
  res.json(db.getLocationHistories());
});

apiRouter.put('/inventory/histories/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const syncItemLocation = req.body.syncItemLocation !== false;
    const history = db.updateLocationHistory(req.params.id, req.body, syncItemLocation, req.user!);
    res.json(history);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/inventory/histories/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const revertLocation = req.query.revertLocation === 'true';
    db.deleteLocationHistory(req.params.id, revertLocation, req.user!);
    res.json({ success: true, message: 'Riwayat perpindahan berhasil dihapus.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. NEEDS & SHORTAGE CALCULATION
// ==========================================

apiRouter.get('/needs', authenticate, (req, res) => {
  let needs = db.getNeeds();
  const { kib, priority, status } = req.query;

  if (kib) needs = needs.filter((n) => n.kib === kib);
  if (priority) needs = needs.filter((n) => n.priority === priority);
  if (status) needs = needs.filter((n) => n.status === status);

  res.json(needs);
});

apiRouter.post('/needs', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const newNeed = db.addNeedItem(req.body, req.user!);
    res.status(201).json(newNeed);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/needs/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateNeedItem(req.params.id, req.body, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/needs/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    db.deleteNeedItem(req.params.id, req.user!);
    res.json({ success: true, message: 'Kebutuhan berhasil dihapus.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. PROCUREMENT & INVENTORY INTEGRATION
// ==========================================

apiRouter.get('/procurements', authenticate, (_req, res) => {
  res.json(db.getProcurements());
});

apiRouter.post('/procurements', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const newProc = db.addProcurement(req.body, req.user!);
    res.status(201).json(newProc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/procurements/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateProcurement(req.params.id, req.body, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/procurements/:id', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    db.deleteProcurement(req.params.id, req.user!);
    res.json({ success: true, message: 'Data pengadaan berhasil dihapus.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Direct atomic integration: Receive procured goods & insert to KIB B / KIB E
apiRouter.post('/procurements/:id/receive-and-inventory', authenticate, forbidReadOnly, (req: AuthenticatedRequest, res) => {
  try {
    const { receivedQuantity, locationId, locationName, itemCode, registerNumber, ...extraFields } = req.body;
    if (!receivedQuantity || !locationId) {
      res.status(400).json({ error: 'Jumlah barang dan lokasi penempatan wajib diisi.' });
      return;
    }
    const result = db.receiveProcurementToInventory(
      req.params.id,
      Number(receivedQuantity),
      locationId,
      locationName,
      itemCode,
      registerNumber,
      extraFields,
      req.user!
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 7. CORRECTION NOTES (KEPALA SEKOLAH)
// ==========================================

apiRouter.get('/correction-notes', authenticate, (_req, res) => {
  res.json(db.getCorrectionNotes());
});

apiRouter.post('/correction-notes', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { targetModule, targetItemId, targetItemTitle, noteText, urgency } = req.body;
    if (!noteText) {
      res.status(400).json({ error: 'Isi catatan koreksi tidak boleh kosong.' });
      return;
    }
    const note = db.addCorrectionNote(
      {
        headmasterName: req.user!.name,
        targetModule: targetModule || 'UMUM',
        targetItemId,
        targetItemTitle,
        noteText,
        urgency: urgency || 'Penting',
      },
      req.user!
    );
    res.status(201).json(note);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/correction-notes/:id/respond', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { responseNote, status } = req.body;
    const updated = db.respondCorrectionNote(req.params.id, responseNote, status, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. SETTINGS & LETTERHEAD (KOP SURAT) & STAFF
// ==========================================

apiRouter.get('/settings/school', authenticate, (_req, res) => {
  res.json(db.getSchoolSettings());
});

apiRouter.put('/settings/school', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateSchoolSettings(req.body, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/settings/letterhead', authenticate, (_req, res) => {
  res.json(db.getLetterheadSettings());
});

apiRouter.put('/settings/letterhead', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateLetterheadSettings(req.body, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/settings/staff', authenticate, (_req, res) => {
  res.json(db.getStaffSettings());
});

// Allowed for superadmin AND pengurus_barang as requested in prompt section 21
apiRouter.put('/settings/staff', authenticate, requireRoles('superadmin', 'pengurus_barang'), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateStaffSettings(req.body, req.user!);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 9. MASTER LOCATIONS
// ==========================================

apiRouter.get('/master/locations', authenticate, (_req, res) => {
  res.json(db.getLocations());
});

apiRouter.post('/master/locations', authenticate, requireRoles('superadmin', 'pengurus_barang'), (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Nama lokasi wajib diisi.' });
      return;
    }
    const loc = db.addLocation(name, description, req.user!);
    res.status(201).json(loc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/master/locations/:id', authenticate, requireRoles('superadmin', 'pengurus_barang'), (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, isActive } = req.body;
    const loc = db.updateLocation(req.params.id, name, description, isActive ?? true, req.user!);
    res.json(loc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 10. AUDIT TRAIL LOGS
// ==========================================

apiRouter.get('/activity-logs', authenticate, (_req, res) => {
  res.json(db.getActivityLogs());
});

// ==========================================
// 11. BACKUP & RESTORE
// ==========================================

apiRouter.get('/backups', authenticate, requireRoles('superadmin'), (_req, res) => {
  res.json(db.getBackups());
});

apiRouter.post('/backup/create', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const record = db.createBackup(req.user!, req.body.notes);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/backup/export-full', authenticate, requireRoles('superadmin'), (_req, res) => {
  const fullData = {
    users: db.getUsers().map(({ passwordHash, ...u }) => u),
    locations: db.getLocations(),
    inventoryItems: db.getInventoryItems(),
    locationHistories: db.getLocationHistories(),
    needs: db.getNeeds(),
    procurements: db.getProcurements(),
    schoolSettings: db.getSchoolSettings(),
    letterheadSettings: db.getLetterheadSettings(),
    staffSettings: db.getStaffSettings(),
    activityLogs: db.getActivityLogs().slice(0, 500),
    exportedAt: new Date().toISOString(),
    system: 'SIM-ASET SEKOLAH v2.0',
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="simaset_export_${Date.now()}.json"`);
  res.send(JSON.stringify(fullData, null, 2));
});

apiRouter.post('/backup/restore', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    const payload = req.body;
    db.restoreBackup(payload, req.user!);
    res.json({ success: true, message: 'Database berhasil dipulihkan.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/backup/reset-demo', authenticate, requireRoles('superadmin'), (req: AuthenticatedRequest, res) => {
  try {
    db.resetToDemoData(req.user!);
    res.json({ success: true, message: 'Data demo sekolah berhasil dimuat ulang.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
