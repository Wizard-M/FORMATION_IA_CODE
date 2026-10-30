import { useState } from 'react';
import { Icon } from './Icons';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@univ-ai.fr');
  const [password, setPassword] = useState('demo2026');

  return (
    <div className="login">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark large">
            <Icon name="sparkles" size={26} />
          </div>
          <div>
            <div className="login-brand-name">PlanifIA</div>
            <div className="login-brand-sub">Gestion des emplois du temps</div>
          </div>
        </div>

        <h1>
          Planifiez la semaine de toute l’université
          <span className="login-accent"> en quelques minutes.</span>
        </h1>
        <p className="login-lead">
          Enseignants, groupes, salles et laboratoires : construisez un planning sans conflit, puis laissez
          l’algorithme compléter ce qu’il reste à placer.
        </p>

        <ul className="login-points">
          <li>
            <Icon name="check" size={16} /> Détection automatique des conflits
          </li>
          <li>
            <Icon name="check" size={16} /> Génération assistée par contraintes
          </li>
          <li>
            <Icon name="check" size={16} /> Vue par groupe, enseignant ou salle
          </li>
        </ul>

        <div className="login-foot">Prototype de démonstration — données fictives</div>
      </section>

      <section className="login-card">
        <div className="login-card-head">
          <span className="login-lock">
            <Icon name="lock" size={18} />
          </span>
          <div>
            <h2>Espace administration</h2>
            <p>Identifiants préremplis pour la démonstration.</p>
          </div>
        </div>

        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <label className="field">
            <span>Adresse e-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn primary block">
            Se connecter
            <Icon name="arrow" size={16} />
          </button>
        </form>

        <button type="button" className="btn ghost block" onClick={onLogin}>
          Accéder directement à la démo
        </button>
      </section>
    </div>
  );
}
