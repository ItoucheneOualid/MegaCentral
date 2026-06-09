const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'Walid@19960',
      database: 'idmegacentral'
    });

    const [tables] = await conn.query('SHOW TABLES');
    console.log('TABLES:', tables.map(r => Object.values(r)[0]).join(', '));

    const names = ['bc_frn', 'BC_FRN', 'bc_lignes', 'bc_line', 'BC_LINE', 'ventes', 'ligne_vente', 'clients', 'fournis', 'articles'];
    for (const name of names) {
      try {
        const [cols] = await conn.query(`SHOW COLUMNS FROM ${name}`);
        console.log('---', name, 'columns---');
        console.log(cols.map(c => c.Field).join(', '));
      } catch (err) {
        console.log('NO TABLE', name, err.message);
      }
    }

    await conn.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
