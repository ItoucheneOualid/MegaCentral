import { User } from '../types/auth';

// Base de données utilisateurs simplifiée - Admin uniquement avec domaine belge
export const USERS_DATABASE: User[] = [
  {
    id: 1,
    login: 'admin',
    email: 'admin@megacentral.be',
    nom: 'Administrateur',
    prenom: 'MEGA',
    role: 'admin',
    voirPrixAchat: 1,
  },
];

// Simuler les mots de passe (en production, utiliser bcrypt)
export const PASSWORDS = {
  'admin': 'admin2026',
};
