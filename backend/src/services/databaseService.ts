import { getPool } from "../config/db";

export class DatabaseService {
  /**
   * Tester la connexion au démarrage.
   */
  static async initializeConnection(): Promise<boolean> {
    let connection;

    try {
      console.log("Tentative de connexion à la base de données...");

      connection = await getPool().getConnection();
      await connection.ping();

      console.log("✅ Connexion sécurisée à la base de données réussie !");
      return true;
    } catch (error) {
      console.error("❌ Erreur de connexion à la base de données :", error);
      return false;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Exécuter une requête SQL.
   */
  static async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const [rows] = await getPool().query(sql, params);
      return rows as any[];
    } catch (error) {
      console.error("❌ Erreur SQL :", error);
      console.error("Requête :", sql);
      throw error;
    }
  }

  /**
   * Exécuter une requête d’insertion.
   */
  static async insert(sql: string, params: any[] = []): Promise<any> {
    try {
      const [result] = await getPool().execute(sql, params);
      return result;
    } catch (error) {
      console.error("❌ Erreur SQL lors de l’insertion :", error);
      throw error;
    }
  }

  /**
   * Exécuter une requête de mise à jour.
   */
  static async update(sql: string, params: any[] = []): Promise<any> {
    try {
      const [result] = await getPool().execute(sql, params);
      return result;
    } catch (error) {
      console.error("❌ Erreur SQL lors de la mise à jour :", error);
      throw error;
    }
  }

  /**
   * Exécuter une requête de suppression.
   */
  static async delete(sql: string, params: any[] = []): Promise<any> {
    try {
      const [result] = await getPool().execute(sql, params);
      return result;
    } catch (error) {
      console.error("❌ Erreur SQL lors de la suppression :", error);
      throw error;
    }
  }

  /**
   * Tester la connexion.
   */
  static async testConnection(): Promise<boolean> {
    let connection;

    try {
      connection = await getPool().getConnection();
      await connection.ping();
      return true;
    } catch (error) {
      console.error("❌ Erreur de connexion à la base de données :", error);
      return false;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Fermer le pool de connexions.
   */
  static async closePool(): Promise<void> {
    try {
      await getPool().end();
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture du pool :", error);
    }
  }
}

export default DatabaseService;