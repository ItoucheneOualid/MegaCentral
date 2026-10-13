const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const backendDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(backendDir, '.env') });

const sourceDir = 'C:/Users/itouc/Desktop/PROJET/MegaCentral Walid';
const sourceFiles = [
  'articles.sql',
  'Art_Stat.sql',
  'barcodes.sql',
  'clients.sql',
  'familles1.sql',
  'familles2.sql',
  'fotos.sql',
  'fournis.sql',
  'BC_FRN.sql',
  'BC_Lignes.sql',
  'Magasin.sql',
  'Param.sql',
  'tickets.sql',
  'TVA.sql',
  'Users.sql',
  'ventes.sql',
  'Zreports.sql',
];

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, '``')}\``;
}

function getTableNames(sql) {
  return [...sql.matchAll(/CREATE TABLE `([^`]+)`/gi)].map(match => match[1]);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    const imports = sourceFiles.map(file => {
      const filePath = path.join(sourceDir, file);
      if (!fs.existsSync(filePath)) throw new Error(`Fichier absent: ${filePath}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      const tables = getTableNames(sql);
      if (tables.length !== 1) throw new Error(`${file}: ${tables.length} CREATE TABLE trouve(s)`);
      return { file, table: tables[0], sql };
    });

    const expectedNames = new Set(imports.map(item => item.table.toLowerCase()));
    const [objects] = await connection.query('SHOW FULL TABLES');
    const tableKey = Object.keys(objects[0] || {})[0];
    const typeKey = Object.keys(objects[0] || {})[1];
    const views = objects.filter(row => row[typeKey] === 'VIEW').map(row => row[tableKey]);
    const tables = objects.filter(row => row[typeKey] === 'BASE TABLE').map(row => row[tableKey]);

    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    for (const view of views) await connection.query(`DROP VIEW IF EXISTS ${quoteIdentifier(view)}`);
    for (const table of tables) await connection.query(`DROP TABLE IF EXISTS ${quoteIdentifier(table)}`);

    for (const item of imports) {
      console.log(`Import: ${item.file} -> ${item.table}`);
      try {
        await connection.query(item.sql);
      } catch (error) {
        error.message = `${item.file}: ${error.message} (code=${error.code || 'unknown'}, errno=${error.errno || 'unknown'})`;
        throw error;
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS=1');

    const [finalObjects] = await connection.query('SHOW FULL TABLES');
    const finalTableKey = Object.keys(finalObjects[0] || {})[0];
    const finalTypeKey = Object.keys(finalObjects[0] || {})[1];
    const finalTables = finalObjects.filter(row => row[finalTypeKey] === 'BASE TABLE').map(row => row[finalTableKey]);
    const finalViews = finalObjects.filter(row => row[finalTypeKey] === 'VIEW').map(row => row[finalTableKey]);
    const unexpected = finalTables.filter(table => !expectedNames.has(table.toLowerCase()));
    const missing = [...expectedNames].filter(table => !finalTables.some(actual => actual.toLowerCase() === table));

    console.log(JSON.stringify({ final_tables: finalTables, final_views: finalViews, unexpected_tables: unexpected, missing_tables: missing }, null, 2));
    if (unexpected.length || missing.length || finalViews.length) {
      throw new Error('Le schema final ne correspond pas exactement aux 17 tables attendues.');
    }
  } catch (error) {
    await connection.query('SET FOREIGN_KEY_CHECKS=1').catch(() => {});
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Replacement failed:', error.message);
  process.exit(1);
});
