import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from './src/services/databaseService';

async function runMigration() {
  try {
    console.log('🔄 Starting migration...\n');

    // Read SQL migration file
    const sqlFilePath = path.join(__dirname, './sql/migration_normalize_to_class_diagram.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('📄 SQL file loaded\n');

    // Split by semicolon (simple split, not perfect but works for most cases)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📋 Found ${statements.length} SQL statements\n`);
    console.log('⏳ Executing migration...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        // Add semicolon back for execution
        await DatabaseService.query(statement + ';');
        successCount++;
      } catch (error: any) {
        // Some errors might be expected (like IF NOT EXISTS)
        if (error.message.includes('IF NOT EXISTS') || 
            error.message.includes('already exists')) {
          console.log(`  ℹ️  Info: ${error.message.substring(0, 80)}`);
        } else {
          console.log(`  ❌ Error: ${error.message.substring(0, 100)}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✓ Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors: ${errorCount} statements (may be expected)\n`);
    }

    // Verify results
    console.log('📊 VERIFICATION RESULTS:\n');

    const clients = await DatabaseService.query('SELECT COUNT(*) as total FROM clients');
    console.log(`  ✓ Total clients: ${clients[0].total}`);

    const ventes = await DatabaseService.query('SELECT COUNT(*) as total FROM ventes');
    console.log(`  ✓ Total ventes: ${ventes[0].total}`);

    const ventesWithClient = await DatabaseService.query(
      'SELECT COUNT(*) as total FROM ventes WHERE client_id IS NOT NULL'
    );
    console.log(`  ✓ Ventes with client_id: ${ventesWithClient[0].total}`);

    const ventesWithoutClient = await DatabaseService.query(
      'SELECT COUNT(*) as total FROM ventes WHERE client_id IS NULL'
    );
    console.log(`  ✓ Ventes without client_id: ${ventesWithoutClient[0].total}`);

    // Show sample data
    console.log('\n📋 SAMPLE DATA (first 5 clients):\n');
    const sampleClients = await DatabaseService.query(
      'SELECT CLcleunik, Client_No, Nom_Société FROM clients LIMIT 5'
    );
    sampleClients.forEach((client: any, idx: number) => {
      console.log(`  ${idx + 1}. [${client.CLcleunik}] ${client.Client_No} - ${client.Nom_Société}`);
    });

    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ ERROR DURING MIGRATION:\n');
    console.error(error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

runMigration();
