// Lance sql/megacaisse_compat/00_diagnostic_readonly.sql en LECTURE SEULE
// et écrit les résultats dans backend/diagnostic_result.json
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const backendDir = path.resolve(__dirname, '..');
// Usage: node scripts\run_diagnostic.js [fichier_env]   (par défaut backend\.env)
const envFile = process.argv[2] ? path.resolve(process.argv[2]) : path.join(backendDir, '.env');
require('dotenv').config({ path: envFile });

const sqlFile = path.join(backendDir, 'sql', 'megacaisse_compat', '00_diagnostic_readonly.sql');
const outFile = path.join(backendDir, 'diagnostic_result.json');

const statements = fs
  .readFileSync(sqlFile, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.replace(/--.*$/, ''))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      String(process.env.DB_SSL).toLowerCase() === 'true'
        ? {
            ca: process.env.DB_CA_FILE
              ? fs.readFileSync(path.resolve(backendDir, process.env.DB_CA_FILE), 'utf8')
              : (process.env.DB_CA_CERT || '').replace(/\\n/g, '\n'),
            rejectUnauthorized: true,
          }
        : undefined,
  });

  const results = [];
  try {
    await connection.query('SET SESSION TRANSACTION READ ONLY');
    for (const sql of statements) {
      if (!/^(SELECT|SHOW)\b/i.test(sql)) {
        throw new Error('Requête non autorisée (lecture seule uniquement): ' + sql.slice(0, 60));
      }
      try {
        const [rows] = await connection.query(sql);
        results.push({ sql: sql.slice(0, 200), rows });
        console.log('OK    ', sql.slice(0, 70).replace(/\s+/g, ' '));
      } catch (error) {
        results.push({ sql: sql.slice(0, 200), error: error.message });
        console.log('ERREUR', sql.slice(0, 70).replace(/\s+/g, ' '), '->', error.message);
      }
    }
  } finally {
    await connection.end();
  }
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
  console.log('\nRésultats écrits dans', outFile);
}

main().catch((e) => {
  console.error('Échec:', e.message);
  process.exit(1);
});
