// execute_migration.js - Simple migration runner
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'idmegacentral',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
  
  console.log('✓ Connected to MySQL\n');
  
  // Read SQL file
  const sqlFile = path.join(__dirname, 'backend/sql/migration_normalize_to_class_diagram.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('⏳ Executing migration...\n');
  
  // Execute all SQL
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('❌ Migration error:', error.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('✓ Migration SQL executed\n');
    
    // Verify
    console.log('📊 Verification:\n');
    
    connection.query('SELECT COUNT(*) as total FROM clients', (err, results) => {
      console.log(`  ✓ Total clients: ${results[0].total}`);
      
      connection.query('SELECT COUNT(*) as total FROM ventes', (err, results) => {
        console.log(`  ✓ Total ventes: ${results[0].total}`);
        
        connection.query('SELECT COUNT(*) as total FROM ventes WHERE client_id IS NOT NULL', (err, results) => {
          console.log(`  ✓ Ventes with client_id: ${results[0].total}`);
          
          connection.query('SELECT CLcleunik, Client_No, Nom_Société FROM clients LIMIT 3', (err, results) => {
            console.log('\n📋 Sample clients:\n');
            results.forEach((row, i) => {
              console.log(`  ${i+1}. ${row.Nom_Société}`);
            });
            
            console.log('\n✅ DONE! Migration successful.\n');
            connection.end();
            process.exit(0);
          });
        });
      });
    });
  });
});
