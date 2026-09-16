'use client';

export interface UserSession {
  userId: string;
  username: string;
  role: 'Admin' | 'Staff';
  token: string;
}

const AUTH_COOKIE_NAME = 'bukhari_erp_auth_session';
const AUTH_STORAGE_KEY = 'bukhari_erp_user_session';

/**
 * Authenticates user through the Tauri Rust backend vault,
 * falling back to local verification for dev/web mode.
 */
export async function authenticateUser(
  username: string,
  password: string,
  role: 'Admin' | 'Staff'
): Promise<{ success: boolean; session?: UserSession; message: string }> {
  try {
    // 1. If running inside Tauri desktop wrapper
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.tauri;
      const res = await invoke('authenticate_user', { username, password, role });
      const session: UserSession = {
        userId: res.user_id,
        username: res.username,
        role: res.role,
        token: res.token,
      };

      storeSession(session);
      return { success: true, session, message: res.message };
    }

    // 2. Dev / Web Mode Fallback Verification
    const cleanUser = username.trim().toLowerCase();
    const isValid =
      (role === 'Admin' && cleanUser === 'admin' && password === 'admin123') ||
      (role === 'Admin' && cleanUser === 'owner' && password === 'bukhari2024') ||
      (role === 'Staff' && cleanUser === 'staff' && password === 'staff123') ||
      (role === 'Staff' && cleanUser === 'counter' && password === 'counter123');

    if (isValid) {
      const session: UserSession = {
        userId: `usr-${role.toLowerCase()}`,
        username,
        role,
        token: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      storeSession(session);
      return { success: true, session, message: 'Authentication successful' };
    }

    return {
      success: false,
      message: 'Invalid credentials. Default accounts: Admin (admin / admin123), Staff (staff / staff123)',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Authentication error from Rust backend' };
  }
}

export function storeSession(session: UserSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    // Set 7-day cookie for Next.js middleware
    document.cookie = `${AUTH_COOKIE_NAME}=${session.token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `bukhari_user_role=${session.role}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `bukhari_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export function getCurrentUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
