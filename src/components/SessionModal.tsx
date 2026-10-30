import { useMemo, useState } from 'react';
import { SEED_COURSES, SEED_GROUPS, SEED_ROOMS, SEED_TEACHERS } from '../data/seed';
import { findConflicts } from '../lib/conflicts';
import { roomFits } from '../lib/rules';
import { isSlotAllowed, nextAllowedSlot, slotLabel, slotRangeLabel } from '../lib/time';
import { DAYS, LUNCH_SLOT, SLOT_COUNT, fullName, type Course, type Session } from '../types';
import type { EditTarget, ViewMode } from '../App';
import { Icon } from './Icons';

interface SessionModalProps {
  target: EditTarget;
  sessions: Session[];
  view: ViewMode;
  entityId: string;
  onClose: () => void;
  onSave: (session: Session) => void;
  onDelete: (id: string) => void;
}

function firstCourseOfGroup(groupId: string): Course {
  return SEED_COURSES.find((course) => course.groupId === groupId) ?? SEED_COURSES[0];
}

function firstSuitableRoom(course: Course, groupId: string): string {
  const group = SEED_GROUPS.find((item) => item.id === groupId);
  if (!group) return SEED_ROOMS[0].id;
  return SEED_ROOMS.find((room) => roomFits(course, group, room))?.id ?? SEED_ROOMS[0].id;
}

export function SessionModal({ target, sessions, view, entityId, onClose, onSave, onDelete }: SessionModalProps) {
  const initial = useMemo(() => {
    if (target.mode === 'edit') {
      const session = target.session;
      return {
        groupId: session.groupId,
        courseId: session.courseId,
        roomId: session.roomId,
        day: session.day,
        slot: session.slot,
        duration: session.durationSlots,
        id: session.id,
      };
    }

    let groupId = SEED_GROUPS[0].id;
    if (view === 'group') groupId = entityId;

    let course = firstCourseOfGroup(groupId);
    if (view === 'teacher') {
      const found = SEED_COURSES.find((item) => item.teacherId === entityId);
      if (found) {
        course = found;
        groupId = found.groupId;
      }
    }

    let roomId = '';
    if (view === 'room') {
      const room = SEED_ROOMS.find((item) => item.id === entityId);
      const group = SEED_GROUPS.find((item) => item.id === groupId);
      if (room && group && roomFits(course, group, room)) roomId = room.id;
    }
    if (!roomId) roomId = firstSuitableRoom(course, groupId);

    const duration = course.durationSlots;
    const slot = isSlotAllowed(target.slot, duration) ? target.slot : nextAllowedSlot(target.slot, duration);

    return {
      groupId,
      courseId: course.id,
      roomId,
      day: target.day,
      slot,
      duration,
      id: `s-${Date.now()}`,
    };
  }, [target, view, entityId]);

  const [groupId, setGroupId] = useState(initial.groupId);
  const [courseId, setCourseId] = useState(initial.courseId);
  const [roomId, setRoomId] = useState(initial.roomId);
  const [day, setDay] = useState(initial.day);
  const [slot, setSlot] = useState(initial.slot);
  const [duration, setDuration] = useState(initial.duration);

  const course = SEED_COURSES.find((item) => item.id === courseId) ?? SEED_COURSES[0];
  const group = SEED_GROUPS.find((item) => item.id === groupId) ?? SEED_GROUPS[0];
  const teacher = SEED_TEACHERS.find((item) => item.id === course.teacherId);
  const room = SEED_ROOMS.find((item) => item.id === roomId);

  const groupCourses = SEED_COURSES.filter((item) => item.groupId === groupId);
  const roomOptions = SEED_ROOMS.filter((item) => roomFits(course, group, item));
  if (room && !roomOptions.some((item) => item.id === room.id)) roomOptions.unshift(room);

  const draft: Session = {
    id: initial.id,
    courseId,
    teacherId: course.teacherId,
    groupId,
    roomId,
    day,
    slot,
    durationSlots: duration,
  };

  const otherSessions = sessions.filter((item) => item.id !== draft.id);
  const previewConflicts = findConflicts(
    [...otherSessions, draft],
    SEED_TEACHERS,
    SEED_ROOMS,
    SEED_GROUPS,
    SEED_COURSES,
  ).filter((conflict) => conflict.sessionIds.includes(draft.id));

  const placedForCourse = sessions.filter((item) => item.courseId === courseId && item.id !== draft.id).length;
  const overQuota = target.mode === 'create' && placedForCourse >= course.sessionsPerWeek;

  function applyCourse(nextCourseId: string) {
    const nextCourse = SEED_COURSES.find((item) => item.id === nextCourseId);
    if (!nextCourse) return;
    setCourseId(nextCourse.id);
    setDuration(nextCourse.durationSlots);
    if (!isSlotAllowed(slot, nextCourse.durationSlots)) {
      setSlot(nextAllowedSlot(slot, nextCourse.durationSlots));
    }
    const nextRoom = SEED_ROOMS.find((item) => item.id === roomId);
    if (!nextRoom || !roomFits(nextCourse, group, nextRoom)) {
      setRoomId(firstSuitableRoom(nextCourse, groupId));
    }
  }

  function applyGroup(nextGroupId: string) {
    setGroupId(nextGroupId);
    const nextCourse = firstCourseOfGroup(nextGroupId);
    setCourseId(nextCourse.id);
    setDuration(nextCourse.durationSlots);
    if (!isSlotAllowed(slot, nextCourse.durationSlots)) {
      setSlot(nextAllowedSlot(slot, nextCourse.durationSlots));
    }
    setRoomId(firstSuitableRoom(nextCourse, nextGroupId));
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h2>{target.mode === 'edit' ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
            <p>
              {slotRangeLabel(slot, duration)} · {DAYS[day]}
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <label className="field">
              <span>Groupe</span>
              <select value={groupId} onChange={(event) => applyGroup(event.target.value)}>
                {SEED_GROUPS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.program} ({item.size} étudiants)
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Cours</span>
              <select value={courseId} onChange={(event) => applyCourse(event.target.value)}>
                {groupCourses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.title} ({item.kind})
                  </option>
                ))}
              </select>
            </label>

            <div className="field">
              <span>Enseignant</span>
              <div className="readonly">{teacher ? `${fullName(teacher)} · ${teacher.department}` : '—'}</div>
            </div>

            <label className="field">
              <span>Salle</span>
              <select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                {roomOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.capacity} places
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Jour</span>
              <select value={day} onChange={(event) => setDay(Number(event.target.value))}>
                {DAYS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Créneau</span>
              <select value={slot} onChange={(event) => setSlot(Number(event.target.value))}>
                {Array.from({ length: SLOT_COUNT }).map((_, index) => (
                  <option key={index} value={index} disabled={!isSlotAllowed(index, duration)}>
                    {slotLabel(index)} {index === LUNCH_SLOT ? '— pause' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Durée</span>
              <select
                value={duration}
                onChange={(event) => {
                  const nextDuration = Number(event.target.value);
                  setDuration(nextDuration);
                  if (!isSlotAllowed(slot, nextDuration)) setSlot(nextAllowedSlot(slot, nextDuration));
                }}
              >
                <option value={1}>1 h</option>
                <option value={2}>2 h</option>
              </select>
            </label>

            <div className="field">
              <span>Type</span>
              <div className="readonly">
                {course.kind} · {course.sessionsPerWeek} séance{course.sessionsPerWeek > 1 ? 's' : ''}/semaine
              </div>
            </div>
          </div>

          {overQuota && (
            <div className="notice warn">
              <Icon name="alert" size={16} />
              Le quota hebdomadaire de ce cours est déjà atteint ({placedForCourse}/{course.sessionsPerWeek}) : cette
              séance sera une séance supplémentaire.
            </div>
          )}

          {previewConflicts.length === 0 ? (
            <div className="notice ok">
              <Icon name="check" size={16} />
              Aucun conflit détecté pour cette séance.
            </div>
          ) : (
            <div className="notice error">
              <Icon name="alert" size={16} />
              <div>
                <strong>{previewConflicts.length} conflit(s) détecté(s)</strong>
                <ul>
                  {previewConflicts.map((conflict) => (
                    <li key={conflict.id}>{conflict.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {target.mode === 'edit' && (
            <button type="button" className="btn danger ghost" onClick={() => onDelete(draft.id)}>
              <Icon name="trash" size={16} />
              Supprimer
            </button>
          )}
          <div className="modal-foot-right">
            <button type="button" className="btn ghost" onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => onSave(draft)}
              disabled={!roomId || !courseId}
            >
              <Icon name="check" size={16} />
              {previewConflicts.length > 0 ? 'Enregistrer malgré tout' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
