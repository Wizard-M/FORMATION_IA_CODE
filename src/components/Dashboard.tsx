import { SEED_COURSES, SEED_GROUPS, SEED_ROOMS, SEED_TEACHERS, totalRequiredSessions } from '../data/seed';
import { CONFLICT_LABEL, type Conflict } from '../lib/conflicts';
import { teacherLoad } from '../lib/rules';
import { fullName, type Session } from '../types';
import { Icon } from './Icons';

interface DashboardProps {
  sessions: Session[];
  conflicts: Conflict[];
  onFocusConflict: (session: Session) => void;
  onGoGeneration: () => void;
}

const USABLE_HOURS = 45;

export function Dashboard({ sessions, conflicts, onFocusConflict, onGoGeneration }: DashboardProps) {
  const total = totalRequiredSessions();
  const planned = sessions.length;
  const progress = Math.min(100, Math.round((planned / total) * 100));
  const hours = sessions.reduce((sum, session) => sum + session.durationSlots, 0);
  const pending = SEED_COURSES.reduce((sum, course) => {
    const placed = sessions.filter((session) => session.courseId === course.id).length;
    return sum + Math.max(0, course.sessionsPerWeek - placed);
  }, 0);
  const roomHours = sessions.reduce((sum, session) => sum + session.durationSlots, 0);
  const occupancy = Math.round((roomHours / (SEED_ROOMS.length * USABLE_HOURS)) * 100);

  const kindCounts = { CM: 0, TD: 0, TP: 0 };
  for (const session of sessions) {
    const course = SEED_COURSES.find((item) => item.id === session.courseId);
    if (course) kindCounts[course.kind] += session.durationSlots;
  }

  const teacherRows = SEED_TEACHERS.map((teacher) => ({
    teacher,
    load: teacherLoad(sessions, teacher.id),
  }))
    .sort((a, b) => b.load - a.load)
    .slice(0, 7);

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Synthèse de la semaine</h1>
          <p>
            {SEED_GROUPS.length} groupes · {SEED_TEACHERS.length} enseignants · {SEED_ROOMS.length} salles
          </p>
        </div>
        {pending > 0 && (
          <div className="page-actions">
            <button type="button" className="btn primary" onClick={onGoGeneration}>
              <Icon name="sparkles" size={16} />
              Planifier les {pending} séances restantes
            </button>
          </div>
        )}
      </div>

      <div className="kpi-grid">
        <article className="card kpi">
          <div className="kpi-head">
            <span className="kpi-icon primary">
              <Icon name="calendar" size={18} />
            </span>
            <span className="kpi-label">Séances planifiées</span>
          </div>
          <div className="kpi-value">
            {planned}
            <small> / {total}</small>
          </div>
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="kpi-foot">{progress} % de la semaine couverte</span>
        </article>

        <article className="card kpi">
          <div className="kpi-head">
            <span className="kpi-icon teal">
              <Icon name="clock" size={18} />
            </span>
            <span className="kpi-label">Heures de cours</span>
          </div>
          <div className="kpi-value">
            {hours}
            <small> h</small>
          </div>
          <div className="kpi-foot">
            CM {kindCounts.CM} h · TD {kindCounts.TD} h · TP {kindCounts.TP} h
          </div>
        </article>

        <article className={`card kpi ${conflicts.length > 0 ? 'is-danger' : 'is-ok'}`}>
          <div className="kpi-head">
            <span className={`kpi-icon ${conflicts.length > 0 ? 'red' : 'green'}`}>
              <Icon name={conflicts.length > 0 ? 'alert' : 'check'} size={18} />
            </span>
            <span className="kpi-label">Conflits</span>
          </div>
          <div className="kpi-value">
            {conflicts.length}
            <small> {conflicts.length > 1 ? 'détectés' : 'détecté'}</small>
          </div>
          <div className="kpi-foot">
            {conflicts.length === 0 ? 'Planning cohérent' : 'À corriger avant publication'}
          </div>
        </article>

        <article className="card kpi">
          <div className="kpi-head">
            <span className="kpi-icon violet">
              <Icon name="door" size={18} />
            </span>
            <span className="kpi-label">Occupation des salles</span>
          </div>
          <div className="kpi-value">
            {occupancy}
            <small> %</small>
          </div>
          <div className="progress violet">
            <span style={{ width: `${Math.max(2, occupancy)}%` }} />
          </div>
          <span className="kpi-foot">{roomHours} h utilisées</span>
        </article>
      </div>

      <div className="dash-grid">
        <article className="card">
          <div className="card-head">
            <h2>
              <Icon name="users" size={18} />
              Charge des enseignants
            </h2>
          </div>
          <ul className="load-list">
            {teacherRows.map(({ teacher, load }) => {
              const ratio = Math.min(1, load / teacher.maxHoursPerWeek);
              return (
                <li key={teacher.id}>
                  <div className="load-row-head">
                    <span>{fullName(teacher)}</span>
                    <span className="muted">
                      {load} / {teacher.maxHoursPerWeek} h
                    </span>
                  </div>
                  <div className="load-bar">
                    <span
                      className={`load-fill ${load > teacher.maxHoursPerWeek ? 'is-danger' : ratio > 0.85 ? 'is-warn' : ''}`}
                      style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="card">
          <div className="card-head">
            <h2>
              <Icon name="alert" size={18} />
              Conflits à traiter
            </h2>
          </div>
          {conflicts.length === 0 ? (
            <div className="panel-empty compact">
              <span className="panel-check">
                <Icon name="check" size={20} />
              </span>
              <p>Aucun conflit</p>
              <small>Le planning peut être publié.</small>
            </div>
          ) : (
            <ul className="conflict-list compact">
              {conflicts.slice(0, 6).map((conflict) => (
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
          {conflicts.length > 6 && <p className="hint">+ {conflicts.length - 6} autres conflits</p>}
        </article>
      </div>

      {pending > 0 && (
        <div className="dash-cta">
          <div>
            <h3>Il reste {pending} séances à planifier</h3>
            <p>Lancez la génération automatique : elle complète le planning sans toucher aux séances existantes.</p>
          </div>
          <button type="button" className="btn primary" onClick={onGoGeneration}>
            <Icon name="sparkles" size={16} />
            Ouvrir la génération
          </button>
        </div>
      )}
    </section>
  );
}
