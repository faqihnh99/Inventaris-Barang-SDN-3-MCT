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

function getToken(): string | null {
  return localStorage.getItem('simaset_token');
}

export function setToken(token: string) {
  localStorage.setItem('simaset_token', token);
}

export function clearToken() {
  localStorage.removeItem('simaset_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) {
        errMsg = errData.error;
      }
    } catch (e) {
      // fallback
    }
    throw new Error(errMsg);
  }

  return response.json();
}

// API methods
export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/api/auth/me');
  },

  async logout(): Promise<{ success: boolean }> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  // Users
  async getUsers(): Promise<User[]> {
    return request('/api/users');
  },

  async createUser(data: any): Promise<User> {
    return request('/api/users', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateUser(id: string, data: any): Promise<User> {
    return request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean }> {
    return request(`/api/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return request('/api/dashboard/stats');
  },

  // Inventory
  async getInventoryItems(params?: Record<string, string>): Promise<InventoryItem[]> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/api/inventory/items${qs}`);
  },

  async getInventoryItem(id: string): Promise<InventoryItem> {
    return request(`/api/inventory/items/${id}`);
  },

  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    return request('/api/inventory/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    return request(`/api/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteInventoryItem(id: string): Promise<{ success: boolean }> {
    return request(`/api/inventory/items/${id}`, { method: 'DELETE' });
  },

  async transferInventoryItem(data: {
    itemId: string;
    toLocationId: string;
    toLocationName: string;
    quantityMoved: number;
    transferDate: string;
    notes: string;
  }): Promise<LocationHistory> {
    return request('/api/inventory/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getLocationHistories(): Promise<LocationHistory[]> {
    return request('/api/inventory/histories');
  },

  async updateLocationHistory(
    id: string,
    data: Partial<LocationHistory> & { syncItemLocation?: boolean }
  ): Promise<LocationHistory> {
    return request(`/api/inventory/histories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLocationHistory(id: string, revertLocation: boolean = false): Promise<{ success: boolean; message: string }> {
    return request(`/api/inventory/histories/${id}?revertLocation=${revertLocation}`, {
      method: 'DELETE',
    });
  },

  // Needs
  async getNeeds(params?: Record<string, string>): Promise<NeedItem[]> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/api/needs${qs}`);
  },

  async createNeed(data: Partial<NeedItem>): Promise<NeedItem> {
    return request('/api/needs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNeed(id: string, data: Partial<NeedItem>): Promise<NeedItem> {
    return request(`/api/needs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteNeed(id: string): Promise<{ success: boolean }> {
    return request(`/api/needs/${id}`, { method: 'DELETE' });
  },

  // Procurement
  async getProcurements(): Promise<ProcurementItem[]> {
    return request('/api/procurements');
  },

  async createProcurement(data: Partial<ProcurementItem>): Promise<ProcurementItem> {
    return request('/api/procurements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProcurement(id: string, data: Partial<ProcurementItem>): Promise<ProcurementItem> {
    return request(`/api/procurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async receiveProcurementToInventory(id: string, data: any): Promise<{ inventoryItem: InventoryItem; procurement: ProcurementItem }> {
    return request(`/api/procurements/${id}/receive-and-inventory`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteProcurement(id: string): Promise<{ success: boolean }> {
    return request(`/api/procurements/${id}`, { method: 'DELETE' });
  },

  // Locations
  async getLocations(): Promise<LocationItem[]> {
    return request('/api/master/locations');
  },

  async createLocation(name: string, description: string): Promise<LocationItem> {
    return request('/api/master/locations', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async updateLocation(id: string, data: { name: string; description: string; isActive?: boolean }): Promise<LocationItem> {
    return request(`/api/master/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Correction Notes (Kepala Sekolah)
  async getCorrectionNotes(): Promise<CorrectionNote[]> {
    return request('/api/correction-notes');
  },

  async createCorrectionNote(data: Partial<CorrectionNote>): Promise<CorrectionNote> {
    return request('/api/correction-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async respondCorrectionNote(id: string, responseNote: string, status: CorrectionNote['status']): Promise<CorrectionNote> {
    return request(`/api/correction-notes/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ responseNote, status }),
    });
  },

  // Settings
  async getSchoolSettings(): Promise<SchoolSettings> {
    return request('/api/settings/school');
  },

  async updateSchoolSettings(data: SchoolSettings): Promise<SchoolSettings> {
    return request('/api/settings/school', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getLetterheadSettings(): Promise<LetterheadSettings> {
    return request('/api/settings/letterhead');
  },

  async updateLetterheadSettings(data: LetterheadSettings): Promise<LetterheadSettings> {
    return request('/api/settings/letterhead', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getStaffSettings(): Promise<StaffSettings> {
    return request('/api/settings/staff');
  },

  async updateStaffSettings(data: StaffSettings): Promise<StaffSettings> {
    return request('/api/settings/staff', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    return request('/api/activity-logs');
  },

  // Backup & Restore
  async getBackups(): Promise<BackupRecord[]> {
    return request('/api/backups');
  },

  async createBackup(notes?: string): Promise<BackupRecord> {
    return request('/api/backup/create', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async restoreBackup(data: any): Promise<{ success: boolean }> {
    return request('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetDemoData(): Promise<{ success: boolean }> {
    return request('/api/backup/reset-demo', {
      method: 'POST',
    });
  },
};
