import DatabaseService from '../src/services/databaseService';

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const magasinArg = args.find(a => a.startsWith('--magasinId='));
  const magasinId = magasinArg ? parseInt(magasinArg.split('=')[1], 10) : undefined;

  console.log('Migration stock consolidation');
  console.log('Mode:', apply ? 'APPLY' : 'DRY-RUN');
  if (!magasinId) console.log('Attention: aucun magasinId fourni ; utilisez --magasinId=<id> pour les opérations dépendantes du magasin.');

  const ok = await DatabaseService.testConnection();
  if (!ok) {
    console.error('Impossible de se connecter à la base. Vérifiez la configuration avant de continuer.');
    process.exit(1);
  }

  const articlesColumns: any[] = await DatabaseService.query('SHOW COLUMNS FROM `articles`');
  const articleFields = articlesColumns.map(row => row.Field);
  const hasManageStock = articleFields.includes('manage_stock');
  const hasGestionStock = articleFields.includes('Gestion_Stock');
  const hasQuantiteStockArticle = articleFields.includes('quantite_stock') || articleFields.includes('quantite_actuelle') || articleFields.includes('quantite');

  const stockTableExists = (await DatabaseService.query("SHOW TABLES LIKE 'stock_magasin'"))?.length > 0;
  const stockTableCount = stockTableExists ? (await DatabaseService.query('SELECT COUNT(*) AS cnt FROM `stock_magasin`'))[0]?.cnt || 0 : 0;

  console.log(`Table stock_magasin existante: ${stockTableExists}`);
  console.log(`Nombre de lignes dans stock_magasin: ${stockTableCount}`);
  console.log(`Table articles a manage_stock: ${hasManageStock}`);
  console.log(`Table articles a Gestion_Stock: ${hasGestionStock}`);
  console.log(`Table articles a colonne quantité interne: ${hasQuantiteStockArticle}`);

  if (!apply) {
    if (hasGestionStock && !hasManageStock) {
      const gestionCount = (await DatabaseService.query('SELECT COUNT(*) AS cnt FROM `articles` WHERE COALESCE(`Gestion_Stock`,0) > 0'))[0]?.cnt || 0;
      console.log(`Articles avec Gestion_Stock > 0: ${gestionCount}`);
    }
    console.log('\n=== DRY-RUN COMPLETE ===');
    console.log('Pour appliquer la migration exécutez:');
    console.log('  npx ts-node-dev --transpile-only scripts/migrate_stock_consolidation.ts --magasinId=1 --apply');
    process.exit(0);
  }

  if (!magasinId) {
    console.error('--magasinId est obligatoire en mode --apply');
    process.exit(1);
  }

  try {
    if (!stockTableExists) {
      console.log('Création de la table stock_magasin...');
      await DatabaseService.query(`CREATE TABLE IF NOT EXISTS stock_magasin (
        id INT NOT NULL AUTO_INCREMENT,
        magasin_id INT NOT NULL,
        article_id INT UNSIGNED NOT NULL,
        quantite_stock DECIMAL(12,2) NOT NULL DEFAULT '0.00',
        seuil_min DECIMAL(12,2) DEFAULT NULL,
        seuil_max DECIMAL(12,2) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uk_magasin_article (magasin_id, article_id),
        KEY fk_stock_magasin_article (article_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    } else {
      console.log('La table stock_magasin existe déjà, aucune création nécessaire.');
    }

    if (!hasManageStock) {
      console.log('Ajout du champ manage_stock dans articles...');
      await DatabaseService.query('ALTER TABLE `articles` ADD COLUMN `manage_stock` TINYINT(1) NOT NULL DEFAULT 1');
    } else {
      console.log('Le champ manage_stock existe déjà dans articles.');
    }

    if (hasGestionStock) {
      console.log('Remplissage de manage_stock à partir de Gestion_Stock...');
      await DatabaseService.query('UPDATE `articles` SET `manage_stock` = COALESCE(`Gestion_Stock`, 1)');
    } else {
      console.log('Aucune colonne Gestion_Stock trouvée dans articles, manage_stock reste à sa valeur par défaut.');
    }

    const finalManageStockCount = (await DatabaseService.query('SELECT COUNT(*) AS cnt FROM `articles` WHERE `manage_stock` = 1'))[0]?.cnt || 0;
    console.log(`Articles avec manage_stock=1: ${finalManageStockCount}`);

    console.log('Migration APPLY terminée avec succès.');
  } catch (error: any) {
    console.error('Erreur pendant la migration:', error.message || error);
    process.exit(1);
  } finally {
    await DatabaseService.closePool();
  }
}

main();
