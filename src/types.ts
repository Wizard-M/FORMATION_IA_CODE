export type RoomType = 'AMPHI' | 'TD' | 'LAB_IA' | 'LAB_ROBO' | 'LAB_EMBARQ';
export type CourseKind = 'CM' | 'TD' | 'TP';

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;
export const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'] as const;
export const SLOT_COUNT = 10; // 08:00 -> 18:00
export const START_HOUR = 8;
export const LUNCH_SLOT = 4; // 12:00 -> 13:00

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  maxHoursPerWeek: number;
  /** Créneaux indisponibles au format `${dayIndex}-${slotIndex}` */
  unavailable: string[];
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  equipment: string[];
}

export interface Group {
  id: string;
  name: string;
  program: string;
  level: string;
  size: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  teacherId: string;
  groupId: string;
  kind: CourseKind;
  sessionsPerWeek: number;
  durationSlots: number;
  requiredEquipment: string[];
}

export interface Session {
  id: string;
  courseId: string;
  teacherId: string;
  groupId: string;
  roomId: string;
  day: number;
  slot: number;
  durationSlots: number;
}

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  AMPHI: 'Amphithéâtre',
  TD: 'Salle de TD',
  LAB_IA: 'Labo IA',
  LAB_ROBO: 'Labo robotique',
  LAB_EMBARQ: 'Labo embarqué',
};

export const KIND_LABEL: Record<CourseKind, string> = {
  CM: 'Cours magistral',
  TD: 'Travaux dirigés',
  TP: 'Travaux pratiques',
};

export function fullName(teacher: Teacher): string {
  return `${teacher.firstName} ${teacher.lastName}`;
}
