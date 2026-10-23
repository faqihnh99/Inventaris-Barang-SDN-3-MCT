import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, hashPassword } from './db';
import { User, UserRole } from './types';

// Simple signed session token storage
interface SessionData {
  token: string;
  userId: string;
  createdAt: number;
}

const activeSessions: Map<string, SessionData> = new Map();

export function generateToken(user: User): string {
  const token = 'simaset_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    userId: user.id,
    createdAt: Date.now(),
  });
  return token;
}

export function revokeToken(token: string): void {
  activeSessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    res.status(401).json({ error: 'Akses ditolak: Autentikasi diperlukan. Silakan login.' });
    return;
  }

  const session = activeSessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login kembali.' });
    return;
  }

  const user = db.getUsers().find((u) => u.id === session.userId);
  if (!user || !user.isActive) {
    activeSessions.delete(token);
    res.status(403).json({ error: 'Akun dinonaktifkan atau tidak ditemukan.' });
    return;
  }

  req.user = user;
  next();
}

// Role guards
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Autentikasi diperlukan.' });
      return;
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      error: `Akses ditolak: Peran Anda (${req.user.role}) tidak memiliki izin untuk tindakan ini.`,
    });
  };
}

// Block Kepala Sekolah from mutating source data (Strict Read-Only Enforcement)
export function forbidReadOnly(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autentikasi diperlukan.' });
    return;
  }

  if (req.user.role === 'kepala_sekolah') {
    res.status(403).json({
      error: 'Akun Kepala Sekolah berada dalam mode MONITORING / READ-ONLY. Tidak diizinkan menambah, mengubah, atau menghapus data sumber inventaris.',
    });
    return;
  }

  next();
}
