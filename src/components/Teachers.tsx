import { useState } from 'react';
import { SEED_COURSES, SEED_TEACHERS } from '../data/seed';
import { teacherLoad } from '../lib/rules';
import { DAYS, fullName, type Session } from '../types';
import { slotLabel } from '../lib/time';
import { Icon } from './Icons';

interface TeachersProps {
  sessions: Session[];
  onSeePlanning: (teacherId: string) => void;
}

export function Teachers({ sessions, onSeePlanning }: TeachersProps) {
  const [query, setQuery] = useState('');

  const filtered = SEED_TEACHERS.filter((teacher) => {
    const haystack = `${teacher.firstName} ${teacher.lastName} ${teacher.department}`.toLowerCase();
    return haystack.includes(query.toLowerCase().trim());
  });

  const totalHours = SEED_TEACHERS.reduce((sum, teacher) => sum + teacherLoad(sessions, teacher.id), 0);

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Enseignants</h1>
          <p>
            {SEED_TEACHERS.length} enseignants · {totalHours} h attribuées sur la semaine · charge maximale respectée
          </p>
        </div>
        <div className="page-actions">
          <input
            className="input search"
            type="search"
            placeholder="Rechercher un enseignant ou un département…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="teacher-grid">
        {filtered.map((teacher) => {
          const load = teacherLoad(sessions, teacher.id);
          const ratio = Math.min(1, load / teacher.maxHoursPerWeek);
          const courses = SEED_COURSES.filter((course) => course.teacherId === teacher.id);
          const overload = load > teacher.maxHoursPerWeek;

          return (
            <article className="card teacher-card" key={teacher.id}>
              <div className="teacher-head">
                <span className="avatar">
                  {teacher.firstName[0]}
                  {teacher.lastName[0]}
                </span>
                <div className="teacher-id">
                  <h3>{fullName(teacher)}</h3>
                  <span>{teacher.department}</span>
                </div>
                <span className={`load-pill ${overload ? 'is-danger' : ratio > 0.85 ? 'is-warn' : ''}`}>
                  {load} / {teacher.maxHoursPerWeek} h
                </span>
              </div>

              <div className="load-bar" aria-hidden="true">
                <span
                  className={`load-fill ${overload ? 'is-danger' : ratio > 0.85 ? 'is-warn' : ''}`}
                  style={{ width: `${Math.max(3, ratio * 100)}%` }}
                />
              </div>

              <div className="teacher-courses">
                {courses.length === 0 ? (
                  <span className="muted">Aucun cours affecté</span>
                ) : (
                  courses.map((course) => (
                    <span className="chip" key={course.id}>
                      {course.code}
                    </span>
                  ))
                )}
              </div>

              <div className="teacher-unavailable">
                <span className="mini-label">Indisponibilités</span>
                {teacher.unavailable.length === 0 ? (
                  <span className="muted">Aucune</span>
                ) : (
                  teacher.unavailable.map((slot) => {
                    const [day, index] = slot.split('-').map(Number);
                    return (
                      <span className="chip subtle" key={slot}>
                        {DAYS[day]?.slice(0, 3)} {slotLabel(index)}
                      </span>
                    );
                  })
                )}
              </div>

              <button type="button" className="btn ghost block" onClick={() => onSeePlanning(teacher.id)}>
                Voir le planning
                <Icon name="arrow" size={15} />
              </button>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card empty-state">Aucun enseignant ne correspond à « {query} ».</div>
      )}
    </section>
  );
}
