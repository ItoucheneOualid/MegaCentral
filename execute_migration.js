// Migration script for idmegacentral database
// Run: node execute_migration.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting migration...\n');

    // Read SQL migration file
    const sqlFilePath = path.join(__dirname, 'backend/sql/migration_normalize_to_class_diagram.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'idmegacentral',
      multipleStatements: true
    });

    console.log('✓ Connected to idmegacentral database\n');

    // Execute migration SQL
    console.log('⏳ Executing migration SQL...\n');
    const result = await connection.query(sqlContent);
    
    console.log('✓ Migration SQL executed successfully\n');

    // Verify results
    console.log('📊 VERIFICATION RESULTS:\n');

    const [clients] = await connection.query('SELECT COUNT(*) as total FROM clients');
    console.log(`  ✓ Total clients: ${clients[0].total}`);

    const [ventes] = await connection.query('SELECT COUNT(*) as total FROM ventes');
    console.log(`  ✓ Total ventes: ${ventes[0].total}`);

    const [ventesWithClient] = await connection.query(
      'SELECT COUNT(*) as total FROM ventes WHERE client_id IS NOT NULL'
    );
    console.log(`  ✓ Ventes with client_id: ${ventesWithClient[0].total}`);

    const [ventesWithoutClient] = await connection.query(
      'SELECT COUNT(*) as total FROM ventes WHERE client_id IS NULL'
    );
    console.log(`  ✓ Ventes without client_id: ${ventesWithoutClient[0].total}`);

    // Show sample data
    console.log('\n📋 SAMPLE DATA (first 5 clients):\n');
    const [sampleClients] = await connection.query(
      'SELECT CLcleunik, Client_No, Nom_Société FROM clients LIMIT 5'
    );
    sampleClients.forEach((client, idx) => {
      console.log(`  ${idx + 1}. [${client.CLcleunik}] ${client.Client_No} - ${client.Nom_Société}`);
    });

    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR DURING MIGRATION:\n');
    console.error(error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

runMigration();
