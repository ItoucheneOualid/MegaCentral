const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const mysqlDriver = require('mysql2');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const outputPath = path.resolve(
  __dirname,
  '..',
  'db_backups',
  `pre_megacaisse_replace_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`,
);

function quoteIdentifier(value) {
  return `\`${String(value).replace(/`/g, '``')}\``;
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const lines = [
      '-- Backup before MegaCaisse schema replacement',
      `-- Database: ${process.env.DB_NAME}`,
      `-- Generated at: ${new Date().toISOString()}`,
      'SET FOREIGN_KEY_CHECKS=0;',
      'SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";',
      '',
    ];

    const [objects] = await connection.query('SHOW FULL TABLES');
    const tableKey = Object.keys(objects[0] || {})[0];
    const typeKey = Object.keys(objects[0] || {})[1];
    const tables = objects.filter(row => row[typeKey] === 'BASE TABLE').map(row => row[tableKey]);
    const views = objects.filter(row => row[typeKey] === 'VIEW').map(row => row[tableKey]);

    for (const view of views) {
      lines.push(`DROP VIEW IF EXISTS ${quoteIdentifier(view)};`);
    }
    for (const table of tables) {
      lines.push(`DROP TABLE IF EXISTS ${quoteIdentifier(table)};`);
    }
    lines.push('');

    for (const table of tables) {
      const [definitionRows] = await connection.query(`SHOW CREATE TABLE ${quoteIdentifier(table)}`);
      const definition = definitionRows[0]['Create Table'];
      lines.push(`${definition};`, '');

      const [rows] = await connection.query(`SELECT * FROM ${quoteIdentifier(table)}`);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(quoteIdentifier).join(', ');
        for (let offset = 0; offset < rows.length; offset += 200) {
          const batch = rows.slice(offset, offset + 200);
          const values = batch.map(row => `(${Object.keys(row).map(column => mysqlDriver.escape(row[column])).join(', ')})`).join(',\n');
          lines.push(`INSERT INTO ${quoteIdentifier(table)} (${columns}) VALUES\n${values};`, '');
        }
      }
    }

    for (const view of views) {
      const [definitionRows] = await connection.query(`SHOW CREATE VIEW ${quoteIdentifier(view)}`);
      const definition = definitionRows[0]['Create View'];
      lines.push(`${definition};`, '');
    }

    lines.push('SET FOREIGN_KEY_CHECKS=1;', '');
    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    console.log(`Backup created: ${outputPath}`);
    console.log(`Tables: ${tables.length}; views: ${views.length}`);
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error('Backup failed:', error.message);
  process.exit(1);
});
