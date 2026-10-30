# PlanifIA — Prototype de gestion d'emploi du temps

Prototype web de planification des emplois du temps pour une université **AI & Robotics**.
Réalisé en deux jours pour présenter le projet à un formateur.

> **Nature du livrable** : prototype de démonstration, pas une version de production.
> Les données sont fictives et persistées dans le navigateur (`localStorage`).

## Démarrage

```powershell
npm.cmd install
npm.cmd run dev
```

Puis ouvrir <http://localhost:5173>.

> Sous PowerShell, `npm` peut être bloqué par la stratégie d'exécution (`npm.ps1`).
> Utilisez `npm.cmd`, ou débloquez une fois :
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

Build de production :

```powershell
npm.cmd run build
npm.cmd run preview
```

## Compte de démonstration

Écran de connexion **factice** : aucun contrôle d'accès réel.

- e-mail : `admin@univ-ai.fr`
- mot de passe : `demo2026`

Les champs sont préremplis, et un bouton « Accéder directement à la démo » est disponible.

## Scénario de démonstration (7 minutes)

1. **Connexion** — espace administration.
2. **Planning** — 8 séances déjà placées sur les 58 attendues, vue par groupe.
3. **Conflit manuel** — glisser `ML-501` du lundi 8 h vers le mardi 8 h :
   l'enseignant et la salle sont déjà pris, les deux blocs passent en rouge et le panneau latéral
   affiche les conflits.
4. **Génération** — onglet *Génération* → « Lancer la génération » : les 50 séances restantes
   sont placées, 0 conflit, 0 séance abandonnée.
5. **Application** — « Appliquer au planning », puis naviguer entre les vues groupe /
   enseignant / salle.
6. **Enseignants** — charge hebdomadaire, indisponibilités, accès au planning individuel.
7. **Salles** — capacité, équipements, taux d'occupation.
8. **Synthèse** — indicateurs, conflits, charge des enseignants, bouton de génération.
9. **Impression** — « Imprimer » produit un emploi du temps propre (A4 paysage).

Astuce : `Réinitialiser` (icône ↻ en haut à droite) remet le jeu de démonstration à zéro.

## Fonctionnalités implémentées

| Domaine | Détail |
|---|---|
| Planning | Grille 5 jours × 10 créneaux, glisser-déposer, création / édition / suppression |
| Vues | Par groupe, par enseignant, par salle |
| Conflits | Enseignant, groupe, salle, capacité, type de salle, équipement, disponibilité, charge |
| Contraintes | Pause déjeuner, durée 1 h / 2 h, une séance du même cours par jour |
| Génération | Heuristique gloutonne avec score de confort, rapport des séances non placées |
| Enseignants | Charge vs maximum, indisponibilités, cours affectés |
| Salles | Capacité, équipements, occupation hebdomadaire |
| Synthèse | Taux de planification, heures, conflits, occupation, charge |
| Impression | Feuille de style dédiée `@media print` |
| Persistance | `localStorage` + réinitialisation |

## Données de démonstration

- 8 groupes (M1/M2), 4 filières : Ingénierie IA, Robotique, Data Science, Systèmes Embarqués
- 20 enseignants, 12 salles (amphis, salles de TD, labos IA, robotique, embarqué)
- 42 cours, 58 séances hebdomadaires attendues
- 8 séances prépositionnées pour montrer un planning partiellement rempli

## Architecture

Application **React + TypeScript + Vite**, sans backend.

```
src/
├─ App.tsx                 état global, navigation, persistance
├─ components/
│  ├─ Login.tsx            écran de connexion factice
│  ├─ Header.tsx           navigation
│  ├─ Planning.tsx         grille, vues, glisser-déposer
│  ├─ SessionModal.tsx     création/édition + prévisualisation des conflits
│  ├─ Generation.tsx       assistant de génération
│  ├─ Teachers.tsx         charge et disponibilités
│  ├─ Rooms.tsx            occupation des salles
│  ├─ Dashboard.tsx        synthèse
│  └─ Icons.tsx            icônes SVG
├─ data/seed.ts            jeu de données fictif
├─ lib/
│  ├─ rules.ts             règles métier (salle, disponibilité, charge)
│  ├─ conflicts.ts         moteur de détection de conflits
│  ├─ scheduler.ts         heuristique de génération
│  ├─ storage.ts           persistance locale
│  └─ time.ts              créneaux horaires
└─ types.ts                modèle de données
```

### Choix techniques assumés

- **Pas de backend** : un prototype autonome supprime tout risque de déploiement le jour de la démonstration.
- **Grille maison** (CSS Grid + drag & drop natif) plutôt qu'une librairie de calendrier payante.
- **Heuristique gloutonne** plutôt qu'un solveur : environ 120 lignes, exécution instantanée, résultat démontrable.
- **Détection de conflits en TypeScript** : même logique réutilisable côté serveur en production.

## Limites du prototype

- Aucune authentification réelle, aucun multi-utilisateur.
- Données stockées dans le navigateur, non partagées entre postes.
- Référentiels en lecture seule (pas encore de CRUD).
- Génération gloutonne : pas d'optimum global ni de diagnostic d'infaisabilité formel.
- Pas d'export PDF serveur, pas d'e-mail, pas de portail étudiant.

## Trajectoire vers la version de production

| Étape | Contenu |
|---|---|
| 1 | Backend Fastify + Prisma + PostgreSQL, authentification et rôles |
| 2 | CRUD des référentiels et import Excel |
| 3 | Contraintes d'exclusion PostgreSQL pour interdire les chevauchements |
| 4 | Solveur OR-Tools CP-SAT avec contraintes souples pondérées |
| 5 | Exports PDF/Excel/iCal, notifications, portail enseignant |
| 6 | Tests, déploiement Docker, documentation |

Estimation : 10 à 12 semaines à temps plein pour une version exploitable.
