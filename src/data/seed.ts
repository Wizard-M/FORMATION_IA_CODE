import type { Course, Group, Room, Session, Teacher } from '../types';

export const SEED_TEACHERS: Teacher[] = [
  { id: 't01', firstName: 'Amine', lastName: 'Belkacem', department: 'Informatique', maxHoursPerWeek: 10, unavailable: ['4-8', '4-9'] },
  { id: 't02', firstName: 'Sarah', lastName: 'Haddad', department: 'Informatique', maxHoursPerWeek: 8, unavailable: ['0-0', '0-1'] },
  { id: 't03', firstName: 'Youssef', lastName: 'Mansouri', department: 'Informatique', maxHoursPerWeek: 10, unavailable: ['2-8', '2-9'] },
  { id: 't04', firstName: 'Lina', lastName: 'Cherif', department: 'Data Science', maxHoursPerWeek: 8, unavailable: [] },
  { id: 't05', firstName: 'Karim', lastName: 'Bensalem', department: 'Data Science', maxHoursPerWeek: 8, unavailable: ['1-8', '1-9'] },
  { id: 't06', firstName: 'Nadia', lastName: 'Rahmani', department: 'Robotique', maxHoursPerWeek: 8, unavailable: ['3-0', '3-1'] },
  { id: 't07', firstName: 'Omar', lastName: 'Ferhat', department: 'Robotique', maxHoursPerWeek: 8, unavailable: ['0-6', '0-7'] },
  { id: 't08', firstName: 'Inès', lastName: 'Bouzid', department: 'Robotique', maxHoursPerWeek: 8, unavailable: [] },
  { id: 't09', firstName: 'Malik', lastName: 'Zeroual', department: 'Robotique', maxHoursPerWeek: 6, unavailable: ['2-8', '2-9'] },
  { id: 't10', firstName: 'Sofia', lastName: 'Khelifi', department: 'Informatique', maxHoursPerWeek: 6, unavailable: ['4-0', '4-1'] },
  { id: 't11', firstName: 'Ahmed', lastName: 'Saidi', department: 'Mathématiques', maxHoursPerWeek: 6, unavailable: ['1-2', '1-3'] },
  { id: 't12', firstName: 'Meriem', lastName: 'Lounis', department: 'Mathématiques', maxHoursPerWeek: 8, unavailable: [] },
  { id: 't13', firstName: 'Rachid', lastName: 'Boumediene', department: 'Mathématiques', maxHoursPerWeek: 8, unavailable: ['3-8', '3-9'] },
  { id: 't14', firstName: 'Farid', lastName: 'Hamdi', department: 'Électronique', maxHoursPerWeek: 8, unavailable: ['0-2', '0-3'] },
  { id: 't15', firstName: 'Salma', lastName: 'Nacer', department: 'Électronique', maxHoursPerWeek: 8, unavailable: [] },
  { id: 't16', firstName: 'Hakim', lastName: 'Toumi', department: 'Électronique', maxHoursPerWeek: 8, unavailable: ['2-0', '2-1'] },
  { id: 't17', firstName: 'Claire', lastName: 'Moreau', department: 'Langues', maxHoursPerWeek: 8, unavailable: [] },
  { id: 't18', firstName: 'Julien', lastName: 'Petit', department: 'Langues', maxHoursPerWeek: 8, unavailable: ['1-0', '1-1'] },
  { id: 't19', firstName: 'Walid', lastName: 'Benali', department: 'Informatique', maxHoursPerWeek: 6, unavailable: ['3-6', '3-7'] },
  { id: 't20', firstName: 'Aïcha', lastName: 'Cherki', department: 'Informatique', maxHoursPerWeek: 6, unavailable: [] },
];

export const SEED_ROOMS: Room[] = [
  { id: 'r01', name: 'Amphi A', type: 'AMPHI', capacity: 180, equipment: ['Projecteur', 'Sonorisation'] },
  { id: 'r02', name: 'Amphi B', type: 'AMPHI', capacity: 120, equipment: ['Projecteur'] },
  { id: 'r03', name: 'Amphi C', type: 'AMPHI', capacity: 100, equipment: ['Projecteur'] },
  { id: 'r04', name: 'Salle TD-101', type: 'TD', capacity: 40, equipment: ['Tableau', 'Projecteur'] },
  { id: 'r05', name: 'Salle TD-102', type: 'TD', capacity: 36, equipment: ['Tableau'] },
  { id: 'r06', name: 'Salle TD-103', type: 'TD', capacity: 32, equipment: ['Tableau', 'Projecteur'] },
  { id: 'r07', name: 'Salle TD-104', type: 'TD', capacity: 30, equipment: ['Tableau'] },
  { id: 'r08', name: 'Lab IA-1', type: 'LAB_IA', capacity: 28, equipment: ['GPU', 'Stations de travail', 'Projecteur'] },
  { id: 'r09', name: 'Lab IA-2', type: 'LAB_IA', capacity: 24, equipment: ['GPU', 'Stations de travail'] },
  { id: 'r10', name: 'Lab Robot-1', type: 'LAB_ROBO', capacity: 26, equipment: ['Bras robotisés', 'Capteurs'] },
  { id: 'r11', name: 'Lab Robot-2', type: 'LAB_ROBO', capacity: 22, equipment: ['Bras robotisés'] },
  { id: 'r12', name: 'Lab Embarqué', type: 'LAB_EMBARQ', capacity: 24, equipment: ['Cartes embarquées', 'Oscilloscopes'] },
];

export const SEED_GROUPS: Group[] = [
  { id: 'g1', name: 'M1-IA-A', program: 'Ingénierie IA', level: 'M1', size: 24 },
  { id: 'g2', name: 'M1-IA-B', program: 'Ingénierie IA', level: 'M1', size: 22 },
  { id: 'g3', name: 'M1-ROB-A', program: 'Robotique', level: 'M1', size: 20 },
  { id: 'g4', name: 'M1-ROB-B', program: 'Robotique', level: 'M1', size: 23 },
  { id: 'g5', name: 'M2-DS-A', program: 'Data Science', level: 'M2', size: 21 },
  { id: 'g6', name: 'M2-DS-B', program: 'Data Science', level: 'M2', size: 19 },
  { id: 'g7', name: 'M2-SE-A', program: 'Systèmes Embarqués', level: 'M2', size: 24 },
  { id: 'g8', name: 'M2-SE-B', program: 'Systèmes Embarqués', level: 'M2', size: 20 },
];

const c = (
  id: string,
  code: string,
  title: string,
  groupId: string,
  teacherId: string,
  kind: Course['kind'],
  sessionsPerWeek: number,
  durationSlots: number,
  requiredEquipment: string[] = [],
): Course => ({ id, code, title, groupId, teacherId, kind, sessionsPerWeek, durationSlots, requiredEquipment });

export const SEED_COURSES: Course[] = [
  // M1-IA-A
  c('c01', 'ML-501', 'Machine Learning', 'g1', 't01', 'CM', 1, 2),
  c('c02', 'DL-502', 'Deep Learning', 'g1', 't02', 'TP', 1, 2, ['GPU']),
  c('c03', 'OPT-503', 'Optimisation convexe', 'g1', 't11', 'TD', 2, 1),
  c('c04', 'VIS-504', 'Vision par ordinateur', 'g1', 't03', 'TP', 1, 2, ['GPU']),
  c('c05', 'ANG-505', 'Anglais scientifique', 'g1', 't17', 'TD', 2, 1),
  c('c42', 'ATL-506', 'Atelier IA appliquée', 'g1', 't10', 'TP', 1, 2, ['GPU']),
  // M1-IA-B
  c('c06', 'ML-501', 'Machine Learning', 'g2', 't01', 'CM', 1, 2),
  c('c07', 'DL-502', 'Deep Learning', 'g2', 't02', 'TP', 1, 2, ['GPU']),
  c('c08', 'PRO-507', 'Probabilités', 'g2', 't12', 'TD', 2, 1),
  c('c09', 'VIS-504', 'Vision par ordinateur', 'g2', 't03', 'TP', 1, 2, ['GPU']),
  c('c10', 'ANG-505', 'Anglais scientifique', 'g2', 't18', 'TD', 2, 1),
  // M1-ROB-A
  c('c11', 'ROB-601', 'Robotique mobile', 'g3', 't06', 'CM', 1, 2),
  c('c12', 'ROB-602', 'Commande robotique', 'g3', 't07', 'TP', 1, 2, ['Bras robotisés']),
  c('c13', 'CIN-603', 'Cinématique', 'g3', 't13', 'TD', 2, 1),
  c('c14', 'PER-604', 'Perception', 'g3', 't08', 'TP', 1, 2, ['Capteurs']),
  c('c15', 'ANG-605', 'Anglais technique', 'g3', 't17', 'TD', 2, 1),
  c('c41', 'PRJ-606', 'Projet robotique', 'g3', 't09', 'TP', 1, 2, ['Bras robotisés']),
  // M1-ROB-B
  c('c16', 'ROB-601', 'Robotique mobile', 'g4', 't06', 'CM', 1, 2),
  c('c17', 'ROB-602', 'Commande robotique', 'g4', 't07', 'TP', 1, 2, ['Bras robotisés']),
  c('c18', 'CIN-603', 'Cinématique', 'g4', 't13', 'TD', 2, 1),
  c('c19', 'PER-604', 'Perception', 'g4', 't08', 'TP', 1, 2, ['Capteurs']),
  c('c20', 'ELE-607', 'Électronique embarquée', 'g4', 't14', 'TD', 2, 1),
  // M2-DS-A
  c('c21', 'STA-701', 'Statistiques inférentielles', 'g5', 't04', 'CM', 1, 2),
  c('c22', 'BIG-702', 'Big Data', 'g5', 't05', 'TP', 1, 2, ['GPU']),
  c('c23', 'VIS-703', 'Visualisation de données', 'g5', 't12', 'TD', 2, 1),
  c('c24', 'SUP-704', 'Apprentissage supervisé', 'g5', 't01', 'TP', 1, 2, ['GPU']),
  c('c25', 'COM-705', 'Communication', 'g5', 't18', 'TD', 2, 1),
  // M2-DS-B
  c('c26', 'STA-701', 'Statistiques inférentielles', 'g6', 't04', 'CM', 1, 2),
  c('c27', 'BIG-702', 'Big Data', 'g6', 't05', 'TP', 1, 2, ['GPU']),
  c('c28', 'BDD-706', 'Bases de données', 'g6', 't19', 'TD', 2, 1),
  c('c29', 'SUP-704', 'Apprentissage supervisé', 'g6', 't02', 'TP', 1, 2, ['GPU']),
  c('c30', 'ANG-707', 'Anglais', 'g6', 't17', 'TD', 2, 1),
  // M2-SE-A
  c('c31', 'STR-801', 'Systèmes temps réel', 'g7', 't14', 'CM', 1, 2),
  c('c32', 'EMB-802', 'Programmation embarquée', 'g7', 't15', 'TP', 1, 2, ['Cartes embarquées']),
  c('c33', 'ARC-803', 'Architecture processeurs', 'g7', 't16', 'TD', 2, 1),
  c('c34', 'RES-804', 'Réseaux industriels', 'g7', 't20', 'TP', 1, 2, ['Oscilloscopes']),
  c('c35', 'ANG-805', 'Anglais', 'g7', 't18', 'TD', 2, 1),
  // M2-SE-B
  c('c36', 'STR-801', 'Systèmes temps réel', 'g8', 't14', 'CM', 1, 2),
  c('c37', 'EMB-802', 'Programmation embarquée', 'g8', 't15', 'TP', 1, 2, ['Cartes embarquées']),
  c('c38', 'ARC-803', 'Architecture processeurs', 'g8', 't16', 'TD', 2, 1),
  c('c39', 'IAE-806', 'IA embarquée', 'g8', 't03', 'TP', 1, 2, ['GPU']),
  c('c40', 'COM-807', 'Communication', 'g8', 't18', 'TD', 2, 1),
];

/**
 * Planning partiel de démonstration : 8 séances déjà placées (16 h),
 * le reste sera complété par le générateur automatique.
 */
export const SEED_SESSIONS: Session[] = [
  { id: 'seed-1', courseId: 'c01', teacherId: 't01', groupId: 'g1', roomId: 'r01', day: 0, slot: 0, durationSlots: 2 },
  { id: 'seed-2', courseId: 'c06', teacherId: 't01', groupId: 'g2', roomId: 'r01', day: 1, slot: 0, durationSlots: 2 },
  { id: 'seed-3', courseId: 'c11', teacherId: 't06', groupId: 'g3', roomId: 'r02', day: 0, slot: 2, durationSlots: 2 },
  { id: 'seed-4', courseId: 'c16', teacherId: 't06', groupId: 'g4', roomId: 'r02', day: 1, slot: 2, durationSlots: 2 },
  { id: 'seed-5', courseId: 'c21', teacherId: 't04', groupId: 'g5', roomId: 'r03', day: 0, slot: 0, durationSlots: 2 },
  { id: 'seed-6', courseId: 'c26', teacherId: 't04', groupId: 'g6', roomId: 'r03', day: 1, slot: 0, durationSlots: 2 },
  { id: 'seed-7', courseId: 'c31', teacherId: 't14', groupId: 'g7', roomId: 'r04', day: 0, slot: 0, durationSlots: 2 },
  { id: 'seed-8', courseId: 'c36', teacherId: 't14', groupId: 'g8', roomId: 'r04', day: 1, slot: 0, durationSlots: 2 },
];

/** Nombre total de séances attendues sur la semaine. */
export function totalRequiredSessions(): number {
  return SEED_COURSES.reduce((sum, course) => sum + course.sessionsPerWeek, 0);
}
