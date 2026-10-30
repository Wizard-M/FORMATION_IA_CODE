import { useState } from 'react';
import { SEED_COURSES, SEED_GROUPS, SEED_ROOMS, SEED_TEACHERS, totalRequiredSessions } from '../data/seed';
import { findConflicts } from '../lib/conflicts';
import { generatePlanning, type GenerationResult } from '../lib/scheduler';
import type { Session } from '../types';
import { Icon } from './Icons';

interface GenerationProps {
  sessions: Session[];
  onApply: (sessions: Session[]) => void;
  onClear: () => void;
  onGoPlanning: () => void;
}

function pendingCount(sessions: Session[]): number {
  return SEED_COURSES.reduce((sum, course) => {
    const placed = sessions.filter((session) => session.courseId === course.id).length;
    return sum + Math.max(0, course.sessionsPerWeek - placed);
  }, 0);
}

export function Generation({ sessions, onApply, onClear, onGoPlanning }: GenerationProps) {
  const [keepExisting, setKeepExisting] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const pending = pendingCount(sessions);
  const total = totalRequiredSessions();
  const resultConflicts = result
    ? findConflicts(result.sessions, SEED_TEACHERS, SEED_ROOMS, SEED_GROUPS, SEED_COURSES)
    : [];

  function run() {
    setRunning(true);
    setResult(null);
    window.setTimeout(() => {
      const generated = generatePlanning({
        sessions,
        courses: SEED_COURSES,
        teachers: SEED_TEACHERS,
        rooms: SEED_ROOMS,
        groups: SEED_GROUPS,
        keepExisting,
        seed: 2026,
      });
      setResult(generated);
      setRunning(false);
    }, 700);
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Génération automatique</h1>
          <p>L’algorithme complète le planning en respectant les contraintes dures et en optimisant le confort.</p>
        </div>
      </div>

      <div className="gen-layout">
        <div className="card gen-config">
          <div className="card-head">
            <h2>
              <Icon name="sparkles" size={18} />
              Paramètres
            </h2>
          </div>

          <div className="gen-stats">
            <div className="stat">
              <span className="stat-value">{total}</span>
              <span className="stat-label">séances requises</span>
            </div>
            <div className="stat">
              <span className="stat-value">{sessions.length}</span>
              <span className="stat-label">déjà planifiées</span>
            </div>
            <div className={`stat ${pending > 0 ? 'is-accent' : ''}`}>
              <span className="stat-value">{pending}</span>
              <span className="stat-label">restantes</span>
            </div>
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={keepExisting}
              onChange={(event) => setKeepExisting(event.target.checked)}
            />
            <span>
              Conserver les séances déjà planifiées
              <small>Décochez pour reconstruire toute la semaine depuis zéro.</small>
            </span>
          </label>

          <div className="gen-constraints">
            <div className="constraint-title">Contraintes appliquées</div>
            <ul>
              <li>
                <Icon name="check" size={14} /> Disponibilités des enseignants
              </li>
              <li>
                <Icon name="check" size={14} /> Capacité et équipement des salles
              </li>
              <li>
                <Icon name="check" size={14} /> Un seul cours par groupe et par créneau
              </li>
              <li>
                <Icon name="check" size={14} /> Une seule séance du même cours par jour
              </li>
              <li>
                <Icon name="check" size={14} /> Pause déjeuner préservée
              </li>
            </ul>
          </div>

          <button type="button" className="btn primary block" onClick={run} disabled={running || pending === 0}>
            {running ? (
              <>
                <span className="spinner" /> Résolution des contraintes…
              </>
            ) : (
              <>
                <Icon name="wand" size={16} /> Lancer la génération
              </>
            )}
          </button>

          {pending === 0 && (
            <p className="hint">
              Toutes les séances sont planifiées. Décochez « conserver » pour tester une reconstruction complète.
            </p>
          )}

          <button
            type="button"
            className="btn danger ghost block"
            onClick={() => {
              if (window.confirm('Vider complètement le planning ?')) {
                setResult(null);
                onClear();
              }
            }}
          >
            <Icon name="trash" size={16} /> Vider le planning
          </button>
        </div>

        <div className="card gen-result">
          <div className="card-head">
            <h2>
              <Icon name="chart" size={18} />
              Résultat
            </h2>
          </div>

          {!result && !running && (
            <div className="result-placeholder">
              <span className="result-orb">
                <Icon name="sparkles" size={26} />
              </span>
              <h3>Aucune génération lancée</h3>
              <p>
                Lancez l’algorithme pour placer les {pending} séances restantes. Vous pourrez ensuite ajuster le
                planning à la main.
              </p>
            </div>
          )}

          {running && (
            <div className="result-placeholder">
              <span className="result-orb is-spinning">
                <Icon name="refresh" size={26} />
              </span>
              <h3>Calcul en cours…</h3>
              <p>Évaluation des créneaux, des salles et des disponibilités enseignantes.</p>
            </div>
          )}

          {result && (
            <div className="result-body">
              <div className="result-banner">
                <span className="result-icon">
                  <Icon name="check" size={20} />
                </span>
                <div>
                  <strong>
                    {result.placedCount} séance{result.placedCount > 1 ? 's' : ''} placée
                    {result.placedCount > 1 ? 's' : ''}
                  </strong>
                  <span>
                    {result.unplaced.length === 0
                      ? 'Toutes les contraintes sont satisfaites.'
                      : `${result.unplaced.length} séance(s) n’ont pas pu être placées.`}
                  </span>
                </div>
              </div>

              <div className="result-kpis">
                <div>
                  <span className="kpi-value">{result.sessions.length}</span>
                  <span className="kpi-label">séances au total</span>
                </div>
                <div>
                  <span className="kpi-value">{resultConflicts.length}</span>
                  <span className="kpi-label">conflits restants</span>
                </div>
                <div>
                  <span className="kpi-value">{result.requestedCount - result.placedCount}</span>
                  <span className="kpi-label">non placées</span>
                </div>
              </div>

              {result.unplaced.length > 0 && (
                <div className="unplaced">
                  <div className="constraint-title">Séances non placées</div>
                  <ul>
                    {result.unplaced.map((item, index) => (
                      <li key={`${item.courseCode}-${index}`}>
                        <span className="unplaced-code">{item.courseCode}</span>
                        <span>
                          <strong>{item.courseTitle}</strong> · {item.groupName}
                          <small>{item.reason}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-actions">
                <button type="button" className="btn ghost" onClick={run}>
                  <Icon name="refresh" size={16} /> Relancer
                </button>
                <button type="button" className="btn primary" onClick={() => onApply(result.sessions)}>
                  <Icon name="check" size={16} /> Appliquer au planning
                </button>
              </div>

              <button type="button" className="link-btn" onClick={onGoPlanning}>
                Revenir au planning sans appliquer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="gen-note">
        <Icon name="alert" size={16} />
        <div>
          <strong>Note technique.</strong> Cette version utilise une heuristique gloutonne (placement des séances les
          plus contraintes, puis score de confort). La version de production remplacera ce module par un solveur
          OR-Tools CP-SAT avec contraintes souples pondérées et diagnostic d’infaisabilité.
        </div>
      </div>
    </section>
  );
}
