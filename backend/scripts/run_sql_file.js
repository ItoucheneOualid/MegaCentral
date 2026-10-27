// Lance un fichier SQL (avec DELIMITER) sur une base donnée, en affichant les résultats.
// Usage: node scripts\run_sql_file.js <fichier_env> <base> <fichier.sql>
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const backendDir = path.resolve(__dirname, '..');
const [envArg, dbName, sqlArg] = process.argv.slice(2);
if (!envArg || !dbName || !sqlArg) {
  console.error('Usage: node scripts\\run_sql_file.js <fichier_env> <base> <fichier.sql>');
  process.exit(1);
}
require('dotenv').config({ path: path.resolve(envArg) });

function splitStatements(text) {
  const statements = [];
  let delimiter = ';';
  let buffer = '';
  for (let rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    // Retire un commentaire de fin de ligne placé après le délimiteur (ex. "...; -- note").
    const trailing = /^(.*?)\s*--\s.*$/.exec(line);
    if (trailing && trailing[1].endsWith(delimiter) && !/'/.test(line.slice(trailing[1].length))) {
      line = trailing[1];
      rawLine = line;
    }
    if (!buffer && (line === '' || line.startsWith('--'))) continue;
    const delimMatch = /^DELIMITER\s+(\S+)$/i.exec(line);
    if (!buffer && delimMatch) {
      delimiter = delimMatch[1];
      continue;
    }
    buffer += rawLine + '\n';
    if (line.endsWith(delimiter)) {
      statements.push(buffer.trim().slice(0, -delimiter.length).trim());
      buffer = '';
    }
  }
  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}

async function main() {
  const sql = fs.readFileSync(path.resolve(sqlArg), 'utf8').replace(/^USE\s+\S+;/im, '');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: { ca: fs.readFileSync(path.resolve(backendDir, process.env.DB_CA_FILE || 'ca.pem'), 'utf8'), rejectUnauthorized: true },
  });
  let failed = false;
  try {
    for (const statement of splitStatements(sql)) {
      const label = statement.replace(/\s+/g, ' ').slice(0, 90);
      try {
        const [result] = await connection.query(statement);
        console.log('OK    ', label);
        const sets = Array.isArray(result) && Array.isArray(result[0]) ? result : [result];
        for (const set of sets) {
          if (Array.isArray(set) && set.length && typeof set[0] === 'object' && !('affectedRows' in set[0])) {
            console.table(set);
          }
        }
      } catch (error) {
        failed = true;
        console.log('ERREUR', label, '->', error.message);
        break;
      }
    }
  } finally {
    await connection.end();
  }
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error('Échec:', error.message);
  process.exit(1);
});
