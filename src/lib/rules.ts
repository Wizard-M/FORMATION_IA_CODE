import type { Course, Group, Room, Session, Teacher } from '../types';

/** Une salle convient-elle à ce cours pour ce groupe ? */
export function roomFits(course: Course, group: Group, room: Room): boolean {
  if (room.capacity < group.size) return false;
  if (!kindAllowsRoom(course.kind, room.type)) return false;
  return course.requiredEquipment.every((eq) => room.equipment.includes(eq));
}

export function kindAllowsRoom(kind: Course['kind'], type: Room['type']): boolean {
  if (kind === 'CM') return type === 'AMPHI' || type === 'TD';
  if (kind === 'TD') return type === 'TD';
  return type === 'LAB_IA' || type === 'LAB_ROBO' || type === 'LAB_EMBARQ';
}

export function missingEquipment(course: Course, room: Room): string[] {
  return course.requiredEquipment.filter((eq) => !room.equipment.includes(eq));
}

export function teacherUnavailable(teacher: Teacher, day: number, slot: number, durationSlots: number): boolean {
  for (let offset = 0; offset < durationSlots; offset += 1) {
    if (teacher.unavailable.includes(`${day}-${slot + offset}`)) return true;
  }
  return false;
}

/** Les deux séances se chevauchent-elles ? */
export function overlaps(a: Session, b: Session): boolean {
  if (a.day !== b.day) return false;
  return a.slot < b.slot + b.durationSlots && b.slot < a.slot + a.durationSlots;
}

export function teacherLoad(sessions: Session[], teacherId: string): number {
  return sessions
    .filter((session) => session.teacherId === teacherId)
    .reduce((sum, session) => sum + session.durationSlots, 0);
}
