import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Planning } from './components/Planning';
import { SessionModal } from './components/SessionModal';
import { Generation } from './components/Generation';
import { Teachers } from './components/Teachers';
import { Rooms } from './components/Rooms';
import { Dashboard } from './components/Dashboard';
import { SEED_COURSES, SEED_GROUPS, SEED_ROOMS, SEED_SESSIONS, SEED_TEACHERS } from './data/seed';
import { findConflicts } from './lib/conflicts';
import { clearSessions, loadSessions, saveSessions } from './lib/storage';
import { isSlotAllowed } from './lib/time';
import type { Session } from './types';

export type Tab = 'planning' | 'generation' | 'teachers' | 'rooms' | 'dashboard';
export type ViewMode = 'group' | 'teacher' | 'room';
export type AppTheme = 'light' | 'dark' | 'sage';

export type EditTarget =
  | { mode: 'create'; day: number; slot: number }
  | { mode: 'edit'; session: Session };

interface Toast {
  id: number;
  text: string;
  kind: 'ok' | 'warn';
}

const AUTH_KEY = 'planifia.auth';
const THEME_KEY = 'planifia.theme';

function loadTheme(): AppTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'sage' ? stored : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [theme, setTheme] = useState<AppTheme>(loadTheme);
  const [tab, setTab] = useState<Tab>('planning');
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions() ?? SEED_SESSIONS);
  const [view, setView] = useState<ViewMode>('group');
  const [entityId, setEntityId] = useState<string>(SEED_GROUPS[0].id);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const conflicts = useMemo(
    () => findConflicts(sessions, SEED_TEACHERS, SEED_ROOMS, SEED_GROUPS, SEED_COURSES),
    [sessions],
  );

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The selected theme still applies for this session when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(text: string, kind: 'ok' | 'warn' = 'ok') {
    setToast({ id: Date.now(), text, kind });
  }

  function changeView(next: ViewMode) {
    setView(next);
    setEntityId(next === 'group' ? SEED_GROUPS[0].id : next === 'teacher' ? SEED_TEACHERS[0].id : SEED_ROOMS[0].id);
  }

  function handleSave(session: Session) {
    setSessions((previous) =>
      previous.some((item) => item.id === session.id)
        ? previous.map((item) => (item.id === session.id ? session : item))
        : [...previous, session],
    );
    setEditing(null);
    notify('Séance enregistrée');
  }

  function handleDelete(id: string) {
    setSessions((previous) => previous.filter((item) => item.id !== id));
    setEditing(null);
    notify('Séance supprimée');
  }

  function handleMove(session: Session, day: number, slot: number) {
    if (!isSlotAllowed(slot, session.durationSlots)) {
      notify('Créneau impossible : pause déjeuner ou fin de journée', 'warn');
      return;
    }
    const moved: Session = { ...session, day, slot };
    const next = sessions.map((item) => (item.id === session.id ? moved : item));
    setSessions(next);
    const nextConflicts = findConflicts(next, SEED_TEACHERS, SEED_ROOMS, SEED_GROUPS, SEED_COURSES);
    if (nextConflicts.length > conflicts.length) {
      notify('Séance déplacée — un conflit vient d’apparaître', 'warn');
    } else {
      notify('Séance déplacée');
    }
  }

  function handleReset() {
    if (!window.confirm('Réinitialiser le planning de démonstration ?')) return;
    clearSessions();
    setSessions(SEED_SESSIONS);
    setView('group');
    setEntityId(SEED_GROUPS[0].id);
    setTab('planning');
    notify('Planning réinitialisé');
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  function focusSession(session: Session) {
    setView('group');
    setEntityId(session.groupId);
    setTab('planning');
  }

  if (!authed) {
    return (
      <Login
        onLogin={() => {
          sessionStorage.setItem(AUTH_KEY, '1');
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <Header
        tab={tab}
        onTab={setTab}
        theme={theme}
        onThemeChange={setTheme}
        conflictCount={conflicts.length}
        onReset={handleReset}
        onLogout={handleLogout}
      />

      <main className="main">
        {tab === 'planning' && (
          <Planning
            sessions={sessions}
            conflicts={conflicts}
            view={view}
            entityId={entityId}
            onView={changeView}
            onEntity={setEntityId}
            onCreate={(day, slot) => setEditing({ mode: 'create', day, slot })}
            onEdit={(session) => setEditing({ mode: 'edit', session })}
            onMove={handleMove}
            onFocusConflict={focusSession}
          />
        )}

        {tab === 'generation' && (
          <Generation
            sessions={sessions}
            onApply={(next) => {
              setSessions(next);
              setTab('planning');
              notify('Planning généré et appliqué');
            }}
            onClear={() => {
              setSessions([]);
              notify('Planning vidé');
            }}
            onGoPlanning={() => setTab('planning')}
          />
        )}

        {tab === 'teachers' && (
          <Teachers
            sessions={sessions}
            onSeePlanning={(teacherId) => {
              setView('teacher');
              setEntityId(teacherId);
              setTab('planning');
            }}
          />
        )}

        {tab === 'rooms' && (
          <Rooms
            sessions={sessions}
            onSeePlanning={(roomId) => {
              setView('room');
              setEntityId(roomId);
              setTab('planning');
            }}
          />
        )}

        {tab === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            conflicts={conflicts}
            onFocusConflict={focusSession}
            onGoGeneration={() => setTab('generation')}
          />
        )}
      </main>

      {editing && (
        <SessionModal
          key={editing.mode === 'edit' ? editing.session.id : `create-${editing.day}-${editing.slot}`}
          target={editing}
          sessions={sessions}
          view={view}
          entityId={entityId}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toast && (
        <div className={`toast ${toast.kind === 'warn' ? 'is-warn' : ''}`} key={toast.id}>
          <span className="toast-icon">
            {toast.kind === 'warn' ? <AlertIcon /> : <CheckIcon />}
          </span>
          {toast.text}
        </div>
      )}

      <footer className="app-foot no-print">
        PlanifIA · prototype de démonstration · {SEED_GROUPS.length} groupes · {SEED_TEACHERS.length} enseignants ·{' '}
        {SEED_ROOMS.length} salles · données fictives
      </footer>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L14.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
