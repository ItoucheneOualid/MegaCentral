import axios from 'axios';
import { apiConfig } from '../config/apiConfig';

// Configuration de base pour se connecter aux vraies bases de données
const API_BASE_URL = apiConfig.baseURL;

// Service pour se connecter aux vraies tables MySQL du cahier des charges
export class DatabaseService {
  
  // ==================== FOURNISSEURS (FRN) ====================
  static async getFournisseurs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/fournisseurs`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      throw error;
    }
  }

  static async addFournisseur(fournisseur: any) {
    try {
      const response = await axios.post(`${API_BASE_URL}/fournisseurs`, fournisseur);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
      throw error;
    }
  }

  static async updateFournisseur(fournisseur: any) {
    try {
      const response = await axios.put(`${API_BASE_URL}/fournisseurs/${fournisseur.id}`, fournisseur);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      throw error;
    }
  }

  static async deleteFournisseur(id: number) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/fournisseurs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      throw error;
    }
  }

  // ==================== COMMANDES (BC_FRN, BC_LINE) ====================
  static async getCommandes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/commandes`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }

  static async getCommandeById(id: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/commandes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      throw error;
    }
  }

  // ==================== RAPPORTS Z ====================
  static async getRapportsZ() {
    try {
      const response = await axios.get(`${API_BASE_URL}/rapports-z`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports Z:', error);
      throw error;
    }
  }

  static async getRapportsZByMagasin(codeMagasin: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/rapports-z/magasin/${codeMagasin}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports Z du magasin:', error);
      throw error;
    }
  }

  static async getRapportsZByDateRange(dateDebut: string, dateFin: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/rapports-z/periode`, {
        params: { dateDebut, dateFin }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports Z par période:', error);
      throw error;
    }
  }

  // ==================== ARTICLES (ART) ====================
  static async getArticles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      throw error;
    }
  }

  // ==================== FAMILLES (FAM1, FAM2) ====================
  static async getFamilles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/familles`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des familles:', error);
      throw error;
    }
  }

  // ==================== TICKETS (TC) ====================
  static async getTickets() {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      throw error;
    }
  }

  // ==================== FACTURES (FV) ====================
  static async getFactures() {
    try {
      const response = await axios.get(`${API_BASE_URL}/factures`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    }
  }

  // ==================== UTILISATEURS (USER) ====================
  static async getUtilisateurs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/utilisateurs`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // ==================== TVA ====================
  static async getTVA() {
    try {
      const response = await axios.get(`${API_BASE_URL}/tva`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des TVA:', error);
      throw error;
    }
  }

  // ==================== PARAMÈTRES (PARAM) ====================
  static async getParametres() {
    try {
      const response = await axios.get(`${API_BASE_URL}/parametres`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  // ==================== EXPORTS ====================
  static async exportToCSV(table: string, filters?: any) {
    try {
      // Corriger l'URL pour correspondre aux routes du backend
      const exportUrl = table === 'fournisseurs' ? 
        `${API_BASE_URL}/fournisseurs/export/csv` : 
        `${API_BASE_URL}/${table}/export/csv`;
        
      const response = await axios.get(exportUrl, {
        params: filters,
        responseType: 'blob'
      });
      
      // Créer le fichier CSV
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${table}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      throw error;
    }
  }

  static async exportToPDF(table: string, filters?: any) {
    try {
      const response = await axios.get(`${API_BASE_URL}/export/pdf/${table}`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Créer le fichier PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${table}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }
}

export default DatabaseService;
