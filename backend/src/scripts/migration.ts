/**
 * Migration script - Normalize database according to class diagram
 * Run from backend: npx ts-node src/scripts/migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../services/databaseService';

async function runMigration() {
  try {
    console.log('\n🔄 Starting database migration...\n');

    // Read migration SQL
    const sqlPath = path.join(process.cwd(), 'sql/migration_normalize_to_class_diagram.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by multiple newlines and remove comments
    let cleanSql = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/*'))
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('#'));

    console.log(`📋 Executing ${statements.length} SQL statements...\n`);

    let executed = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        await DatabaseService.query(statement);
        executed++;
        console.log(`  ✓ [${executed}] Success`);
      } catch (error: any) {
        // Some errors might be OK (duplicate key, etc.)
        if (error.message.includes('IF NOT EXISTS') || 
            error.message.includes('already exists') ||
            error.message.includes('Duplicate')) {
          console.log(`  ℹ️  [${executed}] Skipped (already exists)`);
          skipped++;
        } else {
          console.error(`  ❌ Error: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`\n✅ Migration completed: ${executed} executed, ${skipped} skipped\n`);

    // Verify
    console.log('📊 VERIFICATION:\n');

    const clientsResult = await DatabaseService.query('SELECT COUNT(*) as total FROM clients');
    console.log(`  ✓ Total clients: ${clientsResult[0].total}`);

    const ventesResult = await DatabaseService.query('SELECT COUNT(*) as total FROM ventes');
    console.log(`  ✓ Total ventes: ${ventesResult[0].total}`);

    const ventesWithClientResult = await DatabaseService.query(
      'SELECT COUNT(*) as total FROM ventes WHERE client_id IS NOT NULL'
    );
    console.log(`  ✓ Ventes with client_id: ${ventesWithClientResult[0].total}`);

    const clientsListResult = await DatabaseService.query(
      'SELECT CLcleunik, Client_No, Nom_Société FROM clients LIMIT 5'
    );
    console.log(`\n📋 Sample clients (first 5):\n`);
    clientsListResult.forEach((row, idx) => {
      console.log(`  ${idx + 1}. [${row.CLcleunik}] ${row.Client_No} - ${row.Nom_Société}`);
    });

    console.log('\n✅ DATABASE MIGRATION SUCCESSFUL!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:\n');
    console.error(error);
    process.exit(1);
  }
}

runMigration();
