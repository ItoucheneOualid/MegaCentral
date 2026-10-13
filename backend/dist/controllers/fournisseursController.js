"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FournisseursController = void 0;
const databaseService_1 = __importDefault(require("../services/databaseService"));
class FournisseursController {
    // Récupérer tous les fournisseurs depuis la table existante "fournis"
    static async getAllFournisseurs(req, res) {
        try {
            // Requête pour TOUS les enregistrements, même ceux avec des champs vides
            const query = `
        SELECT 
          FRCLEUNIK as id,
          Fournis_No as code,
          Nom_Societe as nom,
          COALESCE(Adresse1, '') as adresse,
          COALESCE(Telephone, '') as telephone,
          COALESCE(Email_Adresse, '') as email,
          COALESCE(Localite, '') as ville,
          COALESCE(Code_Postal, '') as codePostal,
          COALESCE(Pays_Nom, '') as pays,
          'actif' as statut,
          COALESCE(Date_Entree, '') as dateCreation
        FROM fournis 
        ORDER BY FRCLEUNIK
      `;
            console.log('🔍 Requête SQL:', query);
            const result = await databaseService_1.default.query(query);
            console.log('✅ Fournisseurs récupérés:', result.length);
            res.json(result);
        }
        catch (error) {
            console.error('❌ Erreur lors de la récupération des fournisseurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des fournisseurs'
            });
        }
    }
    // Exporter les fournisseurs en CSV
    static async exportFournisseursCSV(req, res) {
        try {
            console.log('� Début de l\'export CSV des fournisseurs...');
            // Récupérer tous les fournisseurs
            const query = `
        SELECT 
          FRCLEUNIK as id,
          Fournis_No as code,
          Nom_Societe as nom,
          COALESCE(Adresse1, '') as adresse,
          COALESCE(Telephone, '') as telephone,
          COALESCE(Email_Adresse, '') as email,
          COALESCE(Localite, '') as ville,
          COALESCE(Code_Postal, '') as codePostal,
          COALESCE(Pays_Nom, '') as pays,
          'actif' as statut,
          COALESCE(Date_Entree, '') as dateCreation
        FROM fournis 
        ORDER BY FRCLEUNIK
      `;
            const result = await databaseService_1.default.query(query);
            // Créer le contenu CSV
            const csvHeaders = [
                'ID',
                'Code',
                'Nom Société',
                'Adresse',
                'Téléphone',
                'Email',
                'Ville',
                'Code Postal',
                'Pays',
                'Statut',
                'Date Entrée'
            ];
            const csvRows = result.map((fournisseur) => [
                fournisseur.id || '',
                fournisseur.code || '',
                `"${(fournisseur.nom || '').replace(/"/g, '""')}"`, // Échapper les guillemets
                `"${(fournisseur.adresse || '').replace(/"/g, '""')}"`,
                fournisseur.telephone || '',
                fournisseur.email || '',
                fournisseur.ville || '',
                fournisseur.codePostal || '',
                fournisseur.pays || '',
                fournisseur.statut || '',
                fournisseur.dateCreation || ''
            ]);
            // Combiner headers et rows
            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.join(','))
            ].join('\n');
            // Configurer les headers de réponse pour le téléchargement
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="fournisseurs_${new Date().toISOString().split('T')[0]}.csv"`);
            console.log('✅ Export CSV généré avec succès:', result.length, 'fournisseurs');
            res.send(csvContent);
        }
        catch (error) {
            console.error('❌ Erreur lors de l\'export CSV des fournisseurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'export CSV des fournisseurs'
            });
        }
    }
    // Récupérer un fournisseur par son ID
    static async getFournisseurById(req, res) {
        try {
            const { id } = req.params;
            const query = `
        SELECT 
          FRCLEUNIK as id,
          Fournis_No as code,
          Nom_Societe as nom,
          CONCAT(Adresse1, ' ', Adresse2) as adresse,
          Telephone as telephone,
          Email_Adresse as email,
          Localite as ville,
          Code_Postal as codePostal,
          Pays_Nom as pays,
          'actif' as statut,
          Date_Entree as dateCreation
        FROM fournis 
        WHERE FRCLEUNIK = ?
      `;
            const fournisseur = await databaseService_1.default.query(query, [id]);
            if (fournisseur.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Fournisseur non trouvé'
                });
            }
            res.json({
                success: true,
                data: fournisseur[0]
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du fournisseur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération du fournisseur'
            });
        }
    }
    // Ajouter un nouveau fournisseur
    static async addFournisseur(req, res) {
        try {
            const { code, nom, adresse, telephone, email, ville, codePostal, pays, statut, dateCreation } = req.body;
            console.log('📋 Données fournisseur reçues:', req.body);
            // Validation basique
            if (!nom || !code) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nom et le code du fournisseur sont obligatoires'
                });
            }
            // Récupérer le prochain ID
            const maxIdQuery = 'SELECT MAX(FRCLEUNIK) as maxId FROM fournis';
            const [maxIdResult] = await databaseService_1.default.query(maxIdQuery);
            const nextId = (maxIdResult.maxId || 0) + 1;
            // Requête d'insertion
            const insertQuery = `
        INSERT INTO fournis (
          FRCLEUNIK,
          Fournis_No,
          Nom_Societe,
          Adresse1,
          Telephone,
          Email_Adresse,
          Localite,
          Code_Postal,
          Pays_Nom,
          Date_Entree
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                nextId,
                code,
                nom,
                adresse || '',
                telephone || '',
                email || '',
                ville || '',
                codePostal || '',
                pays || '',
                dateCreation || new Date().toISOString().split('T')[0]
            ];
            console.log('🔍 Requête SQL:', insertQuery);
            console.log('📋 Valeurs:', values);
            await databaseService_1.default.query(insertQuery, values);
            console.log('✅ Fournisseur ajouté avec succès, ID:', nextId);
            // Récupérer le fournisseur ajouté
            const selectQuery = `
        SELECT 
          FRCLEUNIK as id,
          Fournis_No as code,
          Nom_Societe as nom,
          COALESCE(Adresse1, '') as adresse,
          COALESCE(Telephone, '') as telephone,
          COALESCE(Email_Adresse, '') as email,
          COALESCE(Localite, '') as ville,
          COALESCE(Code_Postal, '') as codePostal,
          COALESCE(Pays_Nom, '') as pays,
          'actif' as statut,
          COALESCE(Date_Entree, '') as dateCreation
        FROM fournis 
        WHERE FRCLEUNIK = ?
      `;
            const [newFournisseur] = await databaseService_1.default.query(selectQuery, [nextId]);
            res.status(201).json({
                success: true,
                data: newFournisseur,
                message: 'Fournisseur ajouté avec succès'
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de l\'ajout du fournisseur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'ajout du fournisseur'
            });
        }
    }
    // Mettre à jour un fournisseur
    static async updateFournisseur(req, res) {
        try {
            const { id } = req.params;
            const { code, nom, adresse, telephone, email, ville, codePostal, pays, statut, dateCreation } = req.body;
            console.log('📋 Données fournisseur à mettre à jour:', req.body);
            // Validation basique
            if (!nom) {
                return res.status(400).json({
                    success: false,
                    error: 'Le nom du fournisseur est obligatoire'
                });
            }
            // Requête de mise à jour
            const updateQuery = `
        UPDATE fournis SET
          Fournis_No = ?,
          Nom_Societe = ?,
          Adresse1 = ?,
          Telephone = ?,
          Email_Adresse = ?,
          Localite = ?,
          Code_Postal = ?,
          Pays_Nom = ?,
          Date_Entree = ?
        WHERE FRCLEUNIK = ?
      `;
            const values = [
                code || '',
                nom,
                adresse || '',
                telephone || '',
                email || '',
                ville || '',
                codePostal || '',
                pays || '',
                dateCreation || new Date().toISOString().split('T')[0],
                id
            ];
            console.log('🔍 Requête SQL:', updateQuery);
            console.log('📋 Valeurs:', values);
            await databaseService_1.default.query(updateQuery, values);
            console.log('✅ Fournisseur mis à jour avec succès, ID:', id);
            // Récupérer le fournisseur mis à jour
            const selectQuery = `
        SELECT 
          FRCLEUNIK as id,
          Fournis_No as code,
          Nom_Societe as nom,
          COALESCE(Adresse1, '') as adresse,
          COALESCE(Telephone, '') as telephone,
          COALESCE(Email_Adresse, '') as email,
          COALESCE(Localite, '') as ville,
          COALESCE(Code_Postal, '') as codePostal,
          COALESCE(Pays_Nom, '') as pays,
          'actif' as statut,
          COALESCE(Date_Entree, '') as dateCreation
        FROM fournis 
        WHERE FRCLEUNIK = ?
      `;
            const [updatedFournisseur] = await databaseService_1.default.query(selectQuery, [id]);
            res.json({
                success: true,
                data: updatedFournisseur,
                message: 'Fournisseur mis à jour avec succès'
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la mise à jour du fournisseur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour du fournisseur'
            });
        }
    }
    // Supprimer un fournisseur
    static async deleteFournisseur(req, res) {
        try {
            const { id } = req.params;
            console.log('🗑️ Suppression du fournisseur ID:', id);
            // Vérifier si le fournisseur existe
            const checkQuery = 'SELECT COUNT(*) as count FROM fournis WHERE FRCLEUNIK = ?';
            const [checkResult] = await databaseService_1.default.query(checkQuery, [id]);
            if (checkResult.count === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Fournisseur non trouvé'
                });
            }
            // Supprimer le fournisseur
            const deleteQuery = 'DELETE FROM fournis WHERE FRCLEUNIK = ?';
            await databaseService_1.default.query(deleteQuery, [id]);
            console.log('✅ Fournisseur supprimé avec succès, ID:', id);
            res.json({
                success: true,
                message: 'Fournisseur supprimé avec succès'
            });
        }
        catch (error) {
            console.error('❌ Erreur lors de la suppression du fournisseur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du fournisseur'
            });
        }
    }
}
exports.FournisseursController = FournisseursController;
