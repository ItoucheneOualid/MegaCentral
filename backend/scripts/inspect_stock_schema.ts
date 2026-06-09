import fs from 'fs/promises';
import path from 'path';
import DatabaseService from '../src/services/databaseService';

async function main() {
  const outputPath = path.resolve(__dirname, '..', 'inspect_stock_schema_output.txt');
  const lines: string[] = [];

  try {
    const ok = await DatabaseService.testConnection();
    if (!ok) {
      lines.push('Impossible de se connecter à la base de données.');
      await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
      process.exit(1);
    }

    const articlesColumns = await DatabaseService.query('SHOW COLUMNS FROM `articles`');
    lines.push('----- articles columns -----');
    articlesColumns.forEach((row: any) => {
      lines.push(`${row.Field}\t${row.Type}\t${row.Null}\t${row.Key}\t${row.Default}`);
    });

    const stockColumns = await DatabaseService.query('SHOW COLUMNS FROM `stock_magasin`');
    lines.push('\n----- stock_magasin columns -----');
    stockColumns.forEach((row: any) => {
      lines.push(`${row.Field}\t${row.Type}\t${row.Null}\t${row.Key}\t${row.Default}`);
    });

    const magasinColumns = await DatabaseService.query('SHOW COLUMNS FROM `magasin`');
    lines.push('\n----- magasin columns -----');
    magasinColumns.forEach((row: any) => {
      lines.push(`${row.Field}\t${row.Type}\t${row.Null}\t${row.Key}\t${row.Default}`);
    });

    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    await DatabaseService.closePool();
  } catch (error) {
    lines.push(`Erreur d’inspection de schéma : ${error}`);
    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    process.exit(1);
  }
}

main();