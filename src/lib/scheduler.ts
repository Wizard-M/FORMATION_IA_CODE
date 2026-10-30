import type { Course, Group, Room, Session, Teacher } from '../types';
import { roomFits, teacherUnavailable } from './rules';
import { isSlotAllowed } from './time';

export interface GenerationInput {
  sessions: Session[];
  courses: Course[];
  teachers: Teacher[];
  rooms: Room[];
  groups: Group[];
  keepExisting: boolean;
  seed?: number;
}

export interface UnplacedRequirement {
  courseCode: string;
  courseTitle: string;
  groupName: string;
  reason: string;
}

export interface GenerationResult {
  sessions: Session[];
  placedCount: number;
  existingCount: number;
  requestedCount: number;
  unplaced: UnplacedRequirement[];
}

interface Task {
  course: Course;
  teacher: Teacher;
  group: Group;
  eligibleRooms: Room[];
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function occupies(session: Session, day: number, slot: number, durationSlots: number): boolean {
  return session.day === day && session.slot < slot + durationSlots && slot < session.slot + session.durationSlots;
}

/**
 * Heuristique gloutonne : place les séances les plus contraintes d'abord,
 * puis choisit le meilleur créneau/salle selon un score de confort.
 */
export function generatePlanning(input: GenerationInput): GenerationResult {
  const { courses, teachers, rooms, groups } = input;
  const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const base = input.keepExisting ? input.sessions : [];
  const random = mulberry32(input.seed ?? 2026);

  const tasks: Task[] = [];
  for (const course of courses) {
    const teacher = teacherById.get(course.teacherId);
    const group = groupById.get(course.groupId);
    if (!teacher || !group) continue;
    const alreadyPlaced = base.filter((session) => session.courseId === course.id).length;
    const missing = Math.max(0, course.sessionsPerWeek - alreadyPlaced);
    const eligibleRooms = rooms.filter((room) => roomFits(course, group, room));
    for (let index = 0; index < missing; index += 1) {
      tasks.push({ course, teacher, group, eligibleRooms });
    }
  }

  tasks.sort((a, b) => {
    if (a.eligibleRooms.length !== b.eligibleRooms.length) return a.eligibleRooms.length - b.eligibleRooms.length;
    if (a.course.durationSlots !== b.course.durationSlots) return b.course.durationSlots - a.course.durationSlots;
    return b.group.size - a.group.size;
  });

  const placed: Session[] = [];
  const unplaced: UnplacedRequirement[] = [];
  let counter = 0;

  for (const task of tasks) {
    if (task.eligibleRooms.length === 0) {
      unplaced.push({
        courseCode: task.course.code,
        courseTitle: task.course.title,
        groupName: task.group.name,
        reason: 'Aucune salle ne respecte la capacité et les équipements requis',
      });
      continue;
    }

    const plan = [...base, ...placed];
    const duration = task.course.durationSlots;
    const reasons = { availability: 0, teacher: 0, group: 0, duplicateDay: 0, room: 0 };
    let best: { day: number; slot: number; room: Room; score: number } | null = null;

    for (let day = 0; day < 5; day += 1) {
      for (let slot = 0; slot < 10; slot += 1) {
        if (!isSlotAllowed(slot, duration)) continue;
        if (teacherUnavailable(task.teacher, day, slot, duration)) {
          reasons.availability += 1;
          continue;
        }
        if (plan.some((session) => session.teacherId === task.teacher.id && occupies(session, day, slot, duration))) {
          reasons.teacher += 1;
          continue;
        }
        if (plan.some((session) => session.groupId === task.group.id && occupies(session, day, slot, duration))) {
          reasons.group += 1;
          continue;
        }
        if (plan.some((session) => session.courseId === task.course.id && session.day === day)) {
          reasons.duplicateDay += 1;
          continue;
        }

        const groupDaySessions = plan.filter((session) => session.groupId === task.group.id && session.day === day);
        const teacherDaySessions = plan.filter((session) => session.teacherId === task.teacher.id && session.day === day);

        for (const room of task.eligibleRooms) {
          if (plan.some((session) => session.roomId === room.id && occupies(session, day, slot, duration))) {
            reasons.room += 1;
            continue;
          }

          let score = 0;
          if (groupDaySessions.length > 0) score += 2.5;
          if (teacherDaySessions.length > 0) score += 1.5;
          score -= groupDaySessions.length * 0.45;
          score -= teacherDaySessions.length * 0.3;
          if (slot <= 2) score += 1.2;
          if (slot >= 7) score -= 1.5;
          if (plan.some((session) => session.roomId === room.id)) score += 0.2;
          if (plan.some((session) => session.courseId === task.course.id && session.roomId === room.id)) score += 3;
          if (
            plan.some(
              (session) =>
                session.groupId === task.group.id &&
                session.day === day &&
                (session.slot + session.durationSlots === slot || slot + duration === session.slot),
            )
          ) {
            score += 1.1;
          }
          score += random() * 0.6;

          if (!best || score > best.score) {
            best = { day, slot, room, score };
          }
        }
      }
    }

    if (best) {
      counter += 1;
      placed.push({
        id: `gen-${counter}-${Date.now().toString(36)}`,
        courseId: task.course.id,
        teacherId: task.teacher.id,
        groupId: task.group.id,
        roomId: best.room.id,
        day: best.day,
        slot: best.slot,
        durationSlots: duration,
      });
    } else {
      const entries = Object.entries(reasons) as Array<[keyof typeof reasons, number]>;
      entries.sort((a, b) => b[1] - a[1]);
      const dominant = entries[0]?.[0] ?? 'room';
      const reason =
        dominant === 'availability'
          ? 'Aucun créneau compatible avec les disponibilités de l’enseignant'
          : dominant === 'teacher'
            ? 'Emploi du temps de l’enseignant saturé'
            : dominant === 'group'
              ? 'Emploi du temps du groupe saturé'
              : dominant === 'duplicateDay'
                ? 'Impossible de répartir les séances sur des jours différents'
                : 'Aucune salle compatible libre sur les créneaux restants';
      unplaced.push({
        courseCode: task.course.code,
        courseTitle: task.course.title,
        groupName: task.group.name,
        reason,
      });
    }
  }

  return {
    sessions: [...base, ...placed],
    placedCount: placed.length,
    existingCount: base.length,
    requestedCount: tasks.length,
    unplaced,
  };
}
