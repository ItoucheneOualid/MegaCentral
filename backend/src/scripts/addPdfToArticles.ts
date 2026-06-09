import { getPool } from '../config/db';

async function addPdfFieldToArticles() {
  try {
    console.log('Ajout du champ pdf_base64 à la table articles...');
    
    const pool = getPool();
    
    // Vérifier si le champ existe déjà
    const checkQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'idmegacentral' 
      AND TABLE_NAME = 'articles' 
      AND COLUMN_NAME = 'pdf_base64'
    `;
    
    const [result] = await pool.execute<any[]>(checkQuery);
    
    if (result.length === 0) {
      // Ajouter le champ pdf_base64
      const alterQuery = `
        ALTER TABLE articles 
        ADD COLUMN pdf_base64 LONGTEXT AFTER Gestion_Stock
      `;
      
      await pool.execute(alterQuery);
      console.log('✅ Champ pdf_base64 ajouté avec succès à la table articles');
      
      // Ajouter un index pour optimiser les recherches
      try {
        const indexQuery = `
          ALTER TABLE articles 
          ADD INDEX idx_pdf_base64 (pdf_base64(255))
        `;
        
        await pool.execute(indexQuery);
        console.log('✅ Index idx_pdf_base64 ajouté avec succès');
      } catch (indexError) {
        console.warn('⚠️ Impossible d\'ajouter l\'index (peut être normal):', indexError);
      }
      
    } else {
      console.log('ℹ️ Le champ pdf_base64 existe déjà dans la table articles');
    }
    
    // Vérifier la structure finale
    const describeQuery = 'DESCRIBE articles';
    const [structure] = await pool.execute<any[]>(describeQuery);
    
    console.log('\n📋 Structure actuelle de la table articles:');
    structure.forEach((column: any) => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? '[' + column.Key + ']' : ''}`);
    });
    
    console.log('\n🎉 Opération terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du champ pdf_base64:', error);
    throw error;
  }
}

// Exécuter le script
if (require.main === module) {
  addPdfFieldToArticles()
    .then(() => {
      console.log('Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script échoué:', error);
      process.exit(1);
    });
}

export { addPdfFieldToArticles };
