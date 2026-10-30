import type { Course, Group, Room, Session, Teacher } from '../types';
import { fullName } from '../types';
import { missingEquipment, overlaps, teacherUnavailable } from './rules';

const KEY = 'planifia.sessions.v1';

export function loadSessions(): Session[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Session[];
  } catch {
    return null;
  }
}

export function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // stockage indisponible : le prototype continue de fonctionner en mémoire
  }
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
