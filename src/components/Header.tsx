import { Icon } from './Icons';
import type { AppTheme, Tab } from '../App';

interface HeaderProps {
  tab: Tab;
  onTab: (tab: Tab) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  conflictCount: number;
  onReset: () => void;
  onLogout: () => void;
}

const TABS: Array<{ id: Tab; label: string; icon: Parameters<typeof Icon>[0]['name'] }> = [
  { id: 'planning', label: 'Planning', icon: 'calendar' },
  { id: 'generation', label: 'Génération', icon: 'sparkles' },
  { id: 'teachers', label: 'Enseignants', icon: 'users' },
  { id: 'rooms', label: 'Salles', icon: 'door' },
  { id: 'dashboard', label: 'Synthèse', icon: 'chart' },
];

export function Header({ tab, onTab, theme, onThemeChange, conflictCount, onReset, onLogout }: HeaderProps) {
  return (
    <header className="topbar no-print">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="sparkles" size={20} />
        </div>
        <div className="brand-text">
          <span className="brand-name">PlanifIA</span>
          <span className="brand-sub">Université AI &amp; Robotics</span>
        </div>
      </div>

      <nav className="tabs" aria-label="Navigation principale">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab ${tab === item.id ? 'is-active' : ''}`}
            onClick={() => onTab(item.id)}
          >
            <Icon name={item.icon} size={16} />
            <span>{item.label}</span>
            {item.id === 'planning' && conflictCount > 0 && <span className="tab-badge">{conflictCount}</span>}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <span className="proto-pill">Prototype</span>
        <select
          className="theme-select"
          aria-label="Thème visuel"
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as AppTheme)}
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="sage">Sauge</option>
        </select>
        <button type="button" className="icon-btn" title="Réinitialiser la démonstration" onClick={onReset}>
          <Icon name="refresh" size={17} />
        </button>
        <button type="button" className="icon-btn" title="Se déconnecter" onClick={onLogout}>
          <Icon name="logout" size={17} />
        </button>
      </div>
    </header>
  );
}
