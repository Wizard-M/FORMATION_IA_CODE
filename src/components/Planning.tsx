import { useRef, useState } from 'react';
import { SEED_COURSES, SEED_GROUPS, SEED_ROOMS, SEED_TEACHERS } from '../data/seed';
import { CONFLICT_LABEL, type Conflict } from '../lib/conflicts';
import { slotLabel } from '../lib/time';
import { DAYS, DAYS_SHORT, LUNCH_SLOT, SLOT_COUNT, ROOM_TYPE_LABEL, fullName, type Session } from '../types';
import { Icon } from './Icons';
import type { ViewMode } from '../App';

const ROW_HEIGHT = 56;

interface PlanningProps {
  sessions: Session[];
  conflicts: Conflict[];
  view: ViewMode;
  entityId: string;
  onView: (view: ViewMode) => void;
  onEntity: (id: string) => void;
  onCreate: (day: number, slot: number) => void;
  onEdit: (session: Session) => void;
  onMove: (session: Session, day: number, slot: number) => void;
  onFocusConflict: (session: Session) => void;
}

interface Positioned {
  session: Session;
  lane: number;
  lanes: number;
}

const VIEW_LABEL: Record<ViewMode, string> = {
  group: 'Groupe',
  teacher: 'Enseignant',
  room: 'Salle',
};

function layout(items: Session[]): Positioned[] {
  const sorted = [...items].sort((a, b) => a.slot - b.slot || b.durationSlots - a.durationSlots);
  const clusters: Array<{ items: Session[]; end: number }> = [];

  for (const session of sorted) {
    const last = clusters[clusters.length - 1];
    if (!last || session.slot >= last.end) {
      clusters.push({ items: [session], end: session.slot + session.durationSlots });
    } else {
      last.items.push(session);
      last.end = Math.max(last.end, session.slot + session.durationSlots);
    }
  }

  const positioned: Positioned[] = [];
  for (const cluster of clusters) {
    const laneEnds: number[] = [];
    const laneOf = new Map<string, number>();
    for (const session of cluster.items) {
      let lane = laneEnds.findIndex((end) => end <= session.slot);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = session.slot + session.durationSlots;
      laneOf.set(session.id, lane);
    }
    for (const session of cluster.items) {
      positioned.push({ session, lane: laneOf.get(session.id) ?? 0, lanes: laneEnds.length });
    }
  }
  return positioned;
}

export function Planning({
  sessions,
  conflicts,
  view,
  entityId,
  onView,
  onEntity,
  onCreate,
  onEdit,
  onMove,
  onFocusConflict,
}: PlanningProps) {
  const dragRef = useRef<{ id: string; offset: number } | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const visible = sessions.filter((session) =>
    view === 'group' ? session.groupId === entityId : view === 'teacher' ? session.teacherId === entityId : session.roomId === entityId,
  );

  const conflictIds = new Set(conflicts.flatMap((conflict) => conflict.sessionIds));

  const entityLabel =
    view === 'group'
      ? SEED_GROUPS.find((group) => group.id === entityId)?.name ?? ''
      : view === 'teacher'
        ? (() => {
            const teacher = SEED_TEACHERS.find((item) => item.id === entityId);
            return teacher ? fullName(teacher) : '';
          })()
        : SEED_ROOMS.find((room) => room.id === entityId)?.name ?? '';

  const options =
    view === 'group'
      ? SEED_GROUPS.map((group) => ({ id: group.id, label: `${group.name} — ${group.program}` }))
      : view === 'teacher'
        ? SEED_TEACHERS.map((teacher) => ({ id: teacher.id, label: `${fullName(teacher)} — ${teacher.department}` }))
        : SEED_ROOMS.map((room) => ({ id: room.id, label: `${room.name} — ${ROOM_TYPE_LABEL[room.type]}` }));

  return (
    <section className="page">
      <div className="page-head no-print">
        <div>
          <h1>Planning hebdomadaire</h1>
          <p>
            Semestre 1 · 2026–2027 · {visible.length} séance{visible.length > 1 ? 's' : ''} affichée
            {visible.length > 1 ? 's' : ''}
            {conflicts.length > 0 ? (
              <span className="inline-alert"> · {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''}</span>
            ) : (
              <span className="inline-ok"> · aucun conflit</span>
            )}
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn ghost" onClick={() => window.print()}>
            <Icon name="print" size={16} />
            Imprimer
          </button>
          <button type="button" className="btn primary" onClick={() => onCreate(0, 0)}>
            <Icon name="plus" size={16} />
            Nouvelle séance
          </button>
        </div>
      </div>

      <div className="planner">
        <div className="planner-main">
          <div className="planner-toolbar no-print">
            <div className="segmented" role="group" aria-label="Mode de visualisation">
              {(Object.keys(VIEW_LABEL) as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={view === mode ? 'is-active' : ''}
                  onClick={() => onView(mode)}
                >
                  {VIEW_LABEL[mode]}
                </button>
              ))}
            </div>
            <select className="select" value={entityId} onChange={(event) => onEntity(event.target.value)}>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="legend">
              <span className="legend-item">
                <i className="legend-dot kind-CM" /> CM
              </span>
              <span className="legend-item">
                <i className="legend-dot kind-TD" /> TD
              </span>
              <span className="legend-item">
                <i className="legend-dot kind-TP" /> TP
              </span>
            </div>
          </div>

          {visible.length === 0 && (
            <div className="empty-banner no-print">
              <Icon name="calendar" size={18} />
              <span>
                Aucune séance pour <strong>{entityLabel}</strong>. Cliquez sur un créneau ou lancez la génération
                automatique.
              </span>
            </div>
          )}

          <div className="timetable">
            <div className="print-header">
              <div>
                <h2>Emploi du temps — {entityLabel}</h2>
                <p>
                  Semestre 1 · 2026–2027 · vue {VIEW_LABEL[view].toLowerCase()} · généré par PlanifIA
                </p>
              </div>
              <div className="print-brand">PlanifIA</div>
            </div>

            <div className="tt-head">
              <div className="tt-corner">Heure</div>
              {DAYS.map((day, index) => (
                <div className="tt-day" key={day}>
                  <span>{day}</span>
                  <small>{DAYS_SHORT[index]}</small>
                </div>
              ))}
            </div>

            <div className="tt-body">
              <div className="tt-gutter">
                {Array.from({ length: SLOT_COUNT }).map((_, slot) => (
                  <div className={`tt-time ${slot === LUNCH_SLOT ? 'is-lunch' : ''}`} key={slot}>
                    {slotLabel(slot)}
                  </div>
                ))}
              </div>

              <div className="tt-cols">
                {DAYS.map((day, dayIndex) => {
                  const daySessions = visible.filter((session) => session.day === dayIndex);
                  const positioned = layout(daySessions);

                  return (
                    <div
                      key={day}
                      className={`tt-col ${dragOverDay === dayIndex ? 'is-dragover' : ''}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        setDragOverDay(dayIndex);
                      }}
                      onDragLeave={() => setDragOverDay((current) => (current === dayIndex ? null : current))}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragOverDay(null);
                        const id = event.dataTransfer.getData('text/plain');
                        const session = sessions.find((item) => item.id === id);
                        if (!session) return;
                        const rect = event.currentTarget.getBoundingClientRect();
                        const rawSlot = Math.floor((event.clientY - rect.top) / ROW_HEIGHT);
                        const targetSlot = rawSlot - (dragRef.current?.offset ?? 0);
                        const clamped = Math.max(0, Math.min(SLOT_COUNT - session.durationSlots, targetSlot));
                        dragRef.current = null;
                        onMove(session, dayIndex, clamped);
                      }}
                    >
                      {Array.from({ length: SLOT_COUNT }).map((_, slot) => (
                        <div
                          key={slot}
                          className={`tt-cell ${slot === LUNCH_SLOT ? 'is-lunch' : ''}`}
                          onClick={() => {
                            if (slot === LUNCH_SLOT) return;
                            onCreate(dayIndex, slot);
                          }}
                        />
                      ))}

                      <div className="lunch-tag">Pause déjeuner</div>

                      {positioned.map(({ session, lane, lanes }) => {
                        const course = SEED_COURSES.find((item) => item.id === session.courseId);
                        const room = SEED_ROOMS.find((item) => item.id === session.roomId);
                        const teacher = SEED_TEACHERS.find((item) => item.id === session.teacherId);
                        const group = SEED_GROUPS.find((item) => item.id === session.groupId);
                        const isConflict = conflictIds.has(session.id);
                        const width = 100 / lanes;

                        return (
                          <div
                            key={session.id}
                            className={`tt-block kind-${course?.kind ?? 'CM'} ${isConflict ? 'is-conflict' : ''} ${
                              session.durationSlots > 1 ? 'is-tall' : ''
                            }`}
                            style={{
                              top: session.slot * ROW_HEIGHT + 2,
                              height: session.durationSlots * ROW_HEIGHT - 4,
                              left: `calc(${lane * width}% + 2px)`,
                              width: `calc(${width}% - 4px)`,
                            }}
                            draggable
                            onDragStart={(event) => {
                              const rect = event.currentTarget.getBoundingClientRect();
                              const offset = Math.min(
                                session.durationSlots - 1,
                                Math.max(0, Math.floor((event.clientY - rect.top) / ROW_HEIGHT)),
                              );
                              dragRef.current = { id: session.id, offset };
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', session.id);
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(session);
                            }}
                            title={`${course?.code} ${course?.title} · ${group?.name} · ${
                              teacher ? fullName(teacher) : ''
                            } · ${room?.name} · ${slotLabel(session.slot)}`}
                          >
                            <div className="tt-block-top">
                              <span className="tt-code">{course?.code}</span>
                              {isConflict && <span className="tt-warn">!</span>}
                            </div>
                            <div className="tt-title">{course?.title}</div>
                            {session.durationSlots > 1 && (
                              <div className="tt-meta">
                                <span>{teacher ? `${teacher.firstName} ${teacher.lastName[0]}.` : ''}</span>
                                <span>{room?.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="conflict-panel no-print">
          <div className="panel-head">
            <h2>
              <Icon name="alert" size={16} />
              Conflits
            </h2>
            <span className={`count ${conflicts.length > 0 ? 'is-danger' : 'is-ok'}`}>{conflicts.length}</span>
          </div>

          {conflicts.length === 0 ? (
            <div className="panel-empty">
              <span className="panel-check">
                <Icon name="check" size={20} />
              </span>
              <p>Aucun conflit détecté</p>
              <small>Enseignants, groupes et salles sont compatibles.</small>
            </div>
          ) : (
            <ul className="conflict-list">
              {conflicts.map((conflict) => (
                <li key={conflict.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const session = sessions.find((item) => item.id === conflict.sessionIds[0]);
                      if (session) onFocusConflict(session);
                    }}
                  >
                    <span className={`tag ${conflict.severity}`}>{CONFLICT_LABEL[conflict.type]}</span>
                    <span className="conflict-text">{conflict.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="panel-tip">
            Glissez une séance sur un autre créneau : les conflits sont recalculés instantanément.
          </div>
        </aside>
      </div>
    </section>
  );
}
