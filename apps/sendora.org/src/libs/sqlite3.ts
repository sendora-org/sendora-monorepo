import sqlite3InitModule, { type Database } from '@sqlite.org/sqlite-wasm';

export async function initDB() {
  // load SQLite WASM module
  const sqlite3 = await sqlite3InitModule();
  console.log('SQLite WASM loaded:', sqlite3);

  // create a db
  const db = new sqlite3.oo1.DB(':memory:');
  console.log('db init');
  return db;
}

export async function createTable(db: Database) {
  db.exec('DROP TABLE IF EXISTS example1;');
  db.exec(`
        CREATE TABLE example1 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            status TEXT,
            ensName TEXT,
            address TEXT,
            addressType TEXT,
            amount TEXT
        );
    `);
  console.log('Table `example1` created');
}

export function insertData(db: Database) {}

export async function batchInsertWithTransaction(db: Database, data: [][]) {
  console.time('batchInsertWithTransaction');

  db.exec('BEGIN TRANSACTION;');
  const stmt = db.prepare(
    'INSERT INTO example1 (id, name, status, ensName, address, addressType, amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  for (let i = 0; i < data.length; i++) {
    stmt.bind(data[i]);

    stmt.step();
    stmt.reset();
  }
  db.exec('COMMIT;');

  console.timeEnd('batchInsertWithTransaction');
}

export async function queryData(db: Database) {
  const result = db.exec({
    sql: 'SELECT count(*) FROM example1;',
    callback: (row) => {
      console.log({ row });
    },
  });
  console.time('queryData');

  const sql = `SELECT * FROM example1
  ORDER BY id DESC  
  LIMIT 100         `;
  const datas = await execAsync(db, sql, []);

  console.log('datas', datas);

  console.timeEnd('queryData');
}

function execAsync(db: Database, sql: string, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const results: unknown[] = [];
      db.exec({
        sql: sql,
        bind: params,
        callback: (row) => {
          results.push(row);
        },
      });

      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}
