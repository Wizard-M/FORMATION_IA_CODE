import type { Course, Group, Room, Session, Teacher } from '../types';
import { fullName } from '../types';
import { kindAllowsRoom, missingEquipment, overlaps, teacherLoad, teacherUnavailable } from './rules';

export type ConflictType =
  | 'TEACHER'
  | 'GROUP'
  | 'ROOM'
  | 'CAPACITY'
  | 'ROOM_TYPE'
  | 'EQUIPMENT'
  | 'AVAILABILITY'
  | 'LOAD';

export interface Conflict {
  id: string;
  type: ConflictType;
  sessionIds: string[];
  message: string;
  severity: 'error' | 'warning';
}

export interface ScheduleContext {
  sessions: Session[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  courses: Course[];
}

export function findConflicts(
  sessions: Session[],
  teachers: Teacher[],
  rooms: Room[],
  groups: Group[],
  courses: Course[],
): Conflict[] {
  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const courseById = new Map(courses.map((course) => [course.id, course]));

  const conflicts: Conflict[] = [];
  let counter = 0;
  const push = (type: ConflictType, sessionIds: string[], message: string, severity: 'error' | 'warning' = 'error') => {
    counter += 1;
    conflicts.push({ id: `cf-${counter}`, type, sessionIds, message, severity });
  };

  // 1. Chevauchements deux à deux
  for (let i = 0; i < sessions.length; i += 1) {
    for (let j = i + 1; j < sessions.length; j += 1) {
      const a = sessions[i];
      const b = sessions[j];
      if (!overlaps(a, b)) continue;

      if (a.teacherId === b.teacherId) {
        const teacher = teacherById.get(a.teacherId);
        push('TEACHER', [a.id, b.id], `${teacher ? fullName(teacher) : 'Enseignant'} est déjà en cours sur ce créneau`);
      }
      if (a.groupId === b.groupId) {
        const group = groupById.get(a.groupId);
        push('GROUP', [a.id, b.id], `Le groupe ${group?.name ?? ''} a déjà une séance sur ce créneau`);
      }
      if (a.roomId === b.roomId) {
        const room = roomById.get(a.roomId);
        push('ROOM', [a.id, b.id], `La salle ${room?.name ?? ''} est déjà occupée`);
      }
    }
  }

  // 2. Contraintes par séance : capacité, type de salle, équipement, disponibilité
  for (const session of sessions) {
    const course = courseById.get(session.courseId);
    const room = roomById.get(session.roomId);
    const group = groupById.get(session.groupId);
    const teacher = teacherById.get(session.teacherId);
    if (!course || !room || !group || !teacher) continue;

    if (room.capacity < group.size) {
      push(
        'CAPACITY',
        [session.id],
        `Capacité insuffisante : ${room.name} (${room.capacity} places) pour ${group.name} (${group.size} étudiants)`,
      );
    }
    if (!kindAllowsRoom(course.kind, room.type)) {
      push('ROOM_TYPE', [session.id], `Salle incompatible : ${course.code} est un ${course.kind}, ${room.name} ne convient pas`);
    }
    const missing = missingEquipment(course, room);
    if (missing.length > 0) {
      push('EQUIPMENT', [session.id], `Équipement manquant dans ${room.name} : ${missing.join(', ')}`);
    }
    if (teacherUnavailable(teacher, session.day, session.slot, session.durationSlots)) {
      push('AVAILABILITY', [session.id], `${fullName(teacher)} est indisponible sur ce créneau`);
    }
  }

  // 3. Charge hebdomadaire
  for (const teacher of teachers) {
    const load = teacherLoad(sessions, teacher.id);
    if (load > teacher.maxHoursPerWeek) {
      const ids = sessions.filter((session) => session.teacherId === teacher.id).map((session) => session.id);
      push(
        'LOAD',
        ids,
        `Charge dépassée : ${load} h / ${teacher.maxHoursPerWeek} h pour ${fullName(teacher)}`,
        'warning',
      );
    }
  }

  return conflicts;
}

export function conflictSessionIds(conflicts: Conflict[]): Set<string> {
  const set = new Set<string>();
  for (const conflict of conflicts) {
    for (const id of conflict.sessionIds) set.add(id);
  }
  return set;
}

export const CONFLICT_LABEL: Record<ConflictType, string> = {
  TEACHER: 'Enseignant',
  GROUP: 'Groupe',
  ROOM: 'Salle',
  CAPACITY: 'Capacité',
  ROOM_TYPE: 'Type de salle',
  EQUIPMENT: 'Équipement',
  AVAILABILITY: 'Disponibilité',
  LOAD: 'Charge',
};
