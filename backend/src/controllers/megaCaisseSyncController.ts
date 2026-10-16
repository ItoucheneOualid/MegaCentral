import { Request, Response } from 'express';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../config/db';

const SYNC_TABLES = [
  'articles',
  'Art_Stat',
  'barcodes',
  'BC_FRN',
  'BC_Lignes',
  'clients',
  'familles1',
  'familles2',
  'fotos',
  'fournis',
  'Magasin',
  'Param',
  'tickets',
  'TVA',
  'Users',
  'ventes',
  'Zreports',
] as const;

type SyncTable = (typeof SYNC_TABLES)[number];
type SyncRow = Record<string, string | number | boolean | null>;

const PRIMARY_KEYS: Record<SyncTable, string> = {
  articles: 'ARCLEUNIK',
  Art_Stat: 'ID',
  barcodes: 'IDBarCodes',
  BC_FRN: 'CFCLEUNIK',
  BC_Lignes: 'BLCLEUNIK',
  clients: 'CLcleunik',
  familles1: 'F1cleunik',
  familles2: 'F2CLEUNIK',
  fotos: 'ARCLEUNIK',
  fournis: 'FRCLEUNIK',
  Magasin: 'id',
  Param: 'id',
  tickets: 'Numero',
  TVA: 'TVA_ID',
  Users: 'id',
  ventes: 'Numero',
  Zreports: 'id',
};

const STORE_COLUMNS: Partial<Record<SyncTable, string>> = {
  Art_Stat: 'Code_Magasin',
  tickets: 'Code_Magasin',
  ventes: 'Code_magasin',
  Zreports: 'Code_Magasin',
};

const MAX_ROWS_PER_REQUEST = 500;
const SYNC_LOCK_NAME = 'megacentral:megacaisse:sync';

const quoteIdentifier = (value: string): string =>
  `\`${value.replace(/`/g, '``')}\``;

const comparableValue = (value: unknown): string => {
  if (value instanceof Date) {
    const date = [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');
    if (
      value.getHours() === 0 &&
      value.getMinutes() === 0 &&
      value.getSeconds() === 0
    ) {
      return date;
    }
    return `${date} ${String(value.getHours()).padStart(2, '0')}:${String(
      value.getMinutes()
    ).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`;
  }
  return value == null ? '' : String(value);
};

const rowMatchesExisting = (
  row: SyncRow,
  existing: RowDataPacket
): boolean =>
  Object.entries(row).every(
    ([column, value]) =>
      comparableValue(existing[column]) === comparableValue(value)
  );

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const conflictResponse = (
  res: Response,
  table: string,
  key: unknown,
  message: string
): void => {
  res.status(409).json({
    status: 'error',
    code: 'SYNC_KEY_CONFLICT',
    table,
    key,
    message,
  });
};

async function getExistingRow(
  connection: PoolConnection,
  table: SyncTable,
  primaryKey: string,
  keyValue: string | number | boolean
): Promise<RowDataPacket | undefined> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT * FROM ${quoteIdentifier(table.toLowerCase())} WHERE ${quoteIdentifier(primaryKey)} = ? LIMIT 1 FOR UPDATE`,
    [keyValue]
  );
  return rows[0];
}

function ownerColumnsFor(
  table: SyncTable,
  row: SyncRow
): string[] {
  if (table === 'BC_FRN') {
    return ['Magasin_No', 'BC_ID'].filter(
      (column) => row[column] !== null && row[column] !== undefined && row[column] !== ''
    );
  }

  if (table === 'BC_Lignes') {
    return ['BC_ID', 'Code2'].filter(
      (column) => row[column] !== null && row[column] !== undefined && row[column] !== ''
    );
  }

  const column = STORE_COLUMNS[table];
  return column ? [column] : [];
}

export const importMegaCaisseBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  const payload: unknown = req.body;
  if (!isObject(payload)) {
    res.status(400).json({
      status: 'error',
      code: 'INVALID_SYNC_PAYLOAD',
      message: 'Le corps doit contenir storeCode et tables.',
    });
    return;
  }

  const storeCode =
    typeof payload.storeCode === 'string' ? payload.storeCode.trim() : '';
  const tables = payload.tables;

  if (!storeCode || storeCode.length > 2 || !isObject(tables)) {
    res.status(400).json({
      status: 'error',
      code: 'INVALID_SYNC_PAYLOAD',
      message: 'storeCode (1 à 2 caractères) et un objet tables sont requis.',
    });
    return;
  }

  const tableEntries = Object.entries(tables);
  if (tableEntries.length === 0) {
    res.status(400).json({
      status: 'error',
      code: 'EMPTY_SYNC_BATCH',
      message: 'Le lot doit contenir au moins une table MegaCaisse.',
    });
    return;
  }

  const invalidTable = tableEntries.find(
    ([table]) => !SYNC_TABLES.includes(table as SyncTable)
  );
  if (invalidTable) {
    res.status(400).json({
      status: 'error',
      code: 'UNKNOWN_SYNC_TABLE',
      message: `Table non autorisée : ${invalidTable[0]}`,
      allowedTables: SYNC_TABLES,
    });
    return;
  }

  let totalRows = 0;
  for (const [table, rows] of tableEntries) {
    if (!Array.isArray(rows)) {
      res.status(400).json({
        status: 'error',
        code: 'INVALID_TABLE_ROWS',
        table,
        message: `La valeur de ${table} doit être un tableau.`,
      });
      return;
    }
    totalRows += rows.length;
  }

  if (totalRows === 0 || totalRows > MAX_ROWS_PER_REQUEST) {
    res.status(413).json({
      status: 'error',
      code: 'SYNC_BATCH_SIZE_INVALID',
      message: `Un lot doit contenir de 1 à ${MAX_ROWS_PER_REQUEST} lignes.`,
      maxRows: MAX_ROWS_PER_REQUEST,
    });
    return;
  }

  const pool = getPool();
  let connection: PoolConnection | undefined;
  let locked = false;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    const [lockRows] = await connection.query<RowDataPacket[]>(
      'SELECT GET_LOCK(?, 10) AS acquired',
      [SYNC_LOCK_NAME]
    );
    if (Number(lockRows[0]?.acquired) !== 1) {
      res.status(503).json({
        status: 'error',
        code: 'SYNC_BUSY',
        message: 'Une autre synchronisation est en cours. Réessayez le lot.',
      });
      return;
    }
    locked = true;

    const [columnRows] = await connection.query<RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?)`,
      [tableEntries.map(([table]) => table.toLowerCase())]
    );
    const [primaryKeyRows] = await connection.query<RowDataPacket[]>(
      `SELECT TABLE_NAME, COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND CONSTRAINT_NAME = 'PRIMARY'
         AND TABLE_NAME IN (?)`,
      [tableEntries.map(([table]) => table.toLowerCase())]
    );
    const columnsByTable = new Map<string, Set<string>>();
    const primaryKeysByTable = new Map<string, Set<string>>();
    for (const column of columnRows) {
      const tableKey = String(column.TABLE_NAME).toLowerCase();
      const columns = columnsByTable.get(tableKey) || new Set<string>();
      columns.add(String(column.COLUMN_NAME));
      columnsByTable.set(tableKey, columns);
    }
    for (const key of primaryKeyRows) {
      const tableKey = String(key.TABLE_NAME).toLowerCase();
      const keys = primaryKeysByTable.get(tableKey) || new Set<string>();
      keys.add(String(key.COLUMN_NAME));
      primaryKeysByTable.set(tableKey, keys);
    }

    const normalizedEntries: Array<[SyncTable, SyncRow[]]> = [];
    for (const [rawTable, rawRows] of tableEntries) {
      const table = rawTable as SyncTable;
      const actualColumns = columnsByTable.get(table.toLowerCase());
      if (!actualColumns) {
        res.status(503).json({
          status: 'error',
          code: 'SYNC_SCHEMA_MISMATCH',
          table,
          message: `La table MegaCaisse ${table} est absente de la base centrale.`,
        });
        return;
      }

      const canonicalColumnNames = new Map(
        [...actualColumns].map((column) => [column.toLowerCase(), column])
      );
      const primaryKey = PRIMARY_KEYS[table];
      if (
        !actualColumns.has(primaryKey) ||
        !primaryKeysByTable.get(table.toLowerCase())?.has(primaryKey)
      ) {
        res.status(503).json({
          status: 'error',
          code: 'SYNC_SCHEMA_MISMATCH',
          table,
          message: `La clé primaire attendue ${primaryKey} est absente de ${table}.`,
        });
        return;
      }

      const normalizedRows: SyncRow[] = [];
      const seenKeys = new Set<string>();
      for (const rawRow of rawRows as unknown[]) {
        if (!isObject(rawRow)) {
          res.status(400).json({
            status: 'error',
            code: 'INVALID_SYNC_ROW',
            table,
            message: `Chaque ligne de ${table} doit être un objet.`,
          });
          return;
        }

        const row: SyncRow = {};
        for (const [column, value] of Object.entries(rawRow)) {
          const canonicalColumn = canonicalColumnNames.get(column.toLowerCase());
          if (!canonicalColumn) {
            res.status(400).json({
              status: 'error',
              code: 'UNKNOWN_SYNC_COLUMN',
              table,
              column,
              message: `Champ absent du schéma MegaCaisse : ${table}.${column}`,
            });
            return;
          }
          if (
            value !== null &&
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            typeof value !== 'boolean'
          ) {
            res.status(400).json({
              status: 'error',
              code: 'INVALID_SYNC_VALUE',
              table,
              column,
              message: 'Les valeurs de champ doivent être scalaires ou null.',
            });
            return;
          }
          row[canonicalColumn] = value as SyncRow[string];
        }

        const keyValue = row[primaryKey];
        if (keyValue === null || keyValue === undefined || keyValue === '') {
          res.status(400).json({
            status: 'error',
            code: 'SYNC_PRIMARY_KEY_REQUIRED',
            table,
            primaryKey,
            message: `La clé ${primaryKey} est requise pour chaque ligne de ${table}.`,
          });
          return;
        }

        const serializedKey = `${typeof keyValue}:${String(keyValue)}`;
        if (seenKeys.has(serializedKey)) {
          res.status(400).json({
            status: 'error',
            code: 'DUPLICATE_SYNC_KEY',
            table,
            primaryKey,
            key: keyValue,
            message: `La clé ${String(keyValue)} apparaît plusieurs fois dans le lot ${table}.`,
          });
          return;
        }
        seenKeys.add(serializedKey);

        const storeColumn = STORE_COLUMNS[table];
        if (storeColumn && String(row[storeColumn] ?? '') !== storeCode) {
          res.status(400).json({
            status: 'error',
            code: 'SYNC_STORE_MISMATCH',
            table,
            primaryKey,
            key: keyValue,
            message: `${table}.${storeColumn} doit correspondre au magasin ${storeCode}.`,
          });
          return;
        }

        normalizedRows.push(row);
      }
      normalizedEntries.push([table, normalizedRows]);
    }

    await connection.beginTransaction();
    transactionStarted = true;
    const acceptedByTable: Record<string, number> = {};

    for (const [table, rows] of normalizedEntries) {
      const primaryKey = PRIMARY_KEYS[table];
      const storeColumn = STORE_COLUMNS[table];
      const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      if (columns.length === 0) {
        acceptedByTable[table] = 0;
        continue;
      }

      for (const row of rows) {
        const keyValue = row[primaryKey] as string | number | boolean;
        const existing = await getExistingRow(
          connection,
          table,
          primaryKey,
          keyValue
        );
        if (existing) {
          if (storeColumn && String(existing[storeColumn] ?? '') !== storeCode) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              `La clé existe déjà pour le magasin ${String(existing[storeColumn] ?? 'inconnu')}. Aucune donnée n’a été écrasée.`
            );
            return;
          }
          const ownerColumns = ownerColumnsFor(table, row);
          if (
            (table === 'BC_FRN' || table === 'BC_Lignes') &&
            (row.BC_ID === null || row.BC_ID === undefined || row.BC_ID === '')
          ) {
            if (rowMatchesExisting(row, existing)) {
              continue;
            }
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              'La commande ne possède pas de BC_ID stable et diffère de la ligne déjà reçue ; aucun écrasement n’a été effectué.'
            );
            return;
          }
          for (const ownerColumn of ownerColumns) {
            if (
              String(existing[ownerColumn] ?? '') !==
              String(row[ownerColumn] ?? '')
            ) {
              await connection.rollback();
              transactionStarted = false;
              conflictResponse(
                res,
                table,
                keyValue,
                `La clé existe déjà avec une autre valeur de ${ownerColumn}. Aucune donnée n’a été écrasée.`
              );
              return;
            }
          }
          if (table === 'Magasin' && existing.Code_Magasin !== row.Code_Magasin) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              'L’identifiant du magasin est déjà utilisé par un autre code magasin.'
            );
            return;
          }
        }

        if (table === 'Magasin' && row.Code_Magasin) {
          const [storeRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM magasin WHERE Code_Magasin = ? LIMIT 1 FOR UPDATE',
            [row.Code_Magasin]
          );
          if (
            storeRows[0] &&
            String(storeRows[0].id) !== String(keyValue)
          ) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              `Le code magasin ${String(row.Code_Magasin)} est déjà lié à un autre identifiant.`
            );
            return;
          }
        }

        if (table === 'Users' && row.Login) {
          const [userRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE Login = ? LIMIT 1 FOR UPDATE',
            [row.Login]
          );
          if (userRows[0] && String(userRows[0].id) !== String(keyValue)) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              `Le login ${String(row.Login)} est déjà lié à un autre identifiant.`
            );
            return;
          }
        }

        if (table === 'fournis' && row.Fournis_No) {
          const [supplierRows] = await connection.execute<RowDataPacket[]>(
            'SELECT FRCLEUNIK FROM fournis WHERE Fournis_No = ? LIMIT 1 FOR UPDATE',
            [row.Fournis_No]
          );
          if (
            supplierRows[0] &&
            String(supplierRows[0].FRCLEUNIK) !== String(keyValue)
          ) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              `Le code fournisseur ${String(row.Fournis_No)} est déjà lié à une autre clé centrale.`
            );
            return;
          }
        }

        const rowColumns = Object.keys(row);
        const updateColumns = rowColumns.filter((column) => column !== primaryKey);
        const updateClause = updateColumns.length
          ? updateColumns
              .map((column) =>
                `${quoteIdentifier(column)} = VALUES(${quoteIdentifier(column)})`
              )
              .join(', ')
          : `${quoteIdentifier(primaryKey)} = VALUES(${quoteIdentifier(primaryKey)})`;
        const insertSql = `
          INSERT INTO ${quoteIdentifier(table.toLowerCase())}
            (${rowColumns.map(quoteIdentifier).join(', ')})
          VALUES (${rowColumns.map(() => '?').join(', ')})
          ON DUPLICATE KEY UPDATE ${updateClause}
        `;

        try {
          await connection.execute(insertSql, rowColumns.map((column) => row[column]));
        } catch (error) {
          if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ER_DUP_ENTRY'
          ) {
            await connection.rollback();
            transactionStarted = false;
            conflictResponse(
              res,
              table,
              keyValue,
              'Une autre clé unique MegaCaisse est déjà utilisée. Aucune donnée n’a été écrasée.'
            );
            return;
          }
          throw error;
        }
      }

      acceptedByTable[table] = rows.length;
    }

    await connection.commit();
    transactionStarted = false;
    res.status(200).json({
      status: 'ok',
      message: 'Lot MegaCaisse importé.',
      storeCode,
      acceptedRows: totalRows,
      tables: acceptedByTable,
      repeatSafe: true,
    });
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Échec du rollback de synchronisation MegaCaisse:', rollbackError);
      }
    }
    console.error('Erreur d’import MegaCaisse:', error);
    res.status(500).json({
      status: 'error',
      code: 'MEGACAISSE_SYNC_FAILED',
      message: 'Le lot MegaCaisse n’a pas été importé.',
    });
  } finally {
    if (locked && connection) {
      try {
        await connection.query('SELECT RELEASE_LOCK(?)', [SYNC_LOCK_NAME]);
      } catch (error) {
        console.error('Échec de la libération du verrou de synchronisation:', error);
      }
    }
    connection?.release();
  }
};
