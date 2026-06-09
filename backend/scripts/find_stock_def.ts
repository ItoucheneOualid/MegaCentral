import fs from 'fs';
import path from 'path';

const filePath = path.resolve(__dirname, '..', 'db_backups', 'idmegacentral_backup_2026-05-19T11-32-54-202Z.sql');
const outputPath = path.resolve(__dirname, '..', 'find_stock_def_output.txt');
const data = fs.readFileSync(filePath, 'utf8');
const term = 'stock_magasin';
const idx = data.indexOf(term);
let output = `INDEX=${idx}\n`;
if (idx >= 0) {
  output += data.slice(Math.max(0, idx - 500), idx + 1500);
} else {
  output += 'NOT FOUND';
}
fs.writeFileSync(outputPath, output, 'utf8');
console.log('done');
