// Sauvegarde logique (structure + données) d'une base. Lecture seule.
// Usage: node scripts\backup_logical.js <fichier_env> <base> <fichier_sortie.sql>
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const backendDir = path.resolve(__dirname, '..');
const [envArg, dbName, outArg] = process.argv.slice(2);
if (!envArg || !dbName || !outArg) {
  console.error('Usage: node scripts\\backup_logical.js <fichier_env> <base> <fichier_sortie.sql>');
  process.exit(1);
}
require('dotenv').config({ path: path.resolve(envArg) });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: { ca: fs.readFileSync(path.resolve(backendDir, process.env.DB_CA_FILE || 'ca.pem'), 'utf8'), rejectUnauthorized: true },
  });
  const out = fs.createWriteStream(path.resolve(outArg), { encoding: 'utf8' });
  const write = (text) => out.write(text + '\n');
  try {
    await connection.query('SET SESSION TRANSACTION READ ONLY');
    await connection.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
    write(`-- Sauvegarde logique de ${dbName} - ${new Date().toISOString()}`);
    write('SET FOREIGN_KEY_CHECKS=0;');
    const [objects] = await connection.query('SHOW FULL TABLES');
    for (const object of objects) {
      const name = Object.values(object)[0];
      const type = Object.values(object)[1];
      if (type !== 'BASE TABLE') continue;
      const [[create]] = await connection.query(`SHOW CREATE TABLE \`${name}\``);
      write(`\nDROP TABLE IF EXISTS \`${name}\`;`);
      write(create['Create Table'] + ';');
      const [rows] = await connection.query(`SELECT * FROM \`${name}\``);
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const columns = Object.keys(chunk[0]).map((c) => `\`${c}\``).join(', ');
        const values = chunk
          .map((row) => '(' + Object.values(row).map((v) => connection.escape(v)).join(', ') + ')')
          .join(',\n');
        write(`INSERT INTO \`${name}\` (${columns}) VALUES\n${values};`);
      }
      console.log(`${name}: ${rows.length} lignes`);
    }
    write('SET FOREIGN_KEY_CHECKS=1;');
    await connection.query('ROLLBACK');
  } finally {
    await new Promise((resolve) => out.end(resolve));
    await connection.end();
  }
  console.log('Sauvegarde écrite dans', path.resolve(outArg));
}

main().catch((error) => {
  console.error('Échec:', error.message);
  process.exit(1);
});
