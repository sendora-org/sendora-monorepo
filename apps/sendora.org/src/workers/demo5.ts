import { initSQL } from '@/libs/sqlite/multisender';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = console.log;
const error = console.error;

const start = async (sqlite3: any) => {
  log('Running SQLite3 version', sqlite3, sqlite3.version.libVersion);

  if (sqlite3.installOpfsSAHPoolVfs) {
    try {
      await sqlite3.installOpfsSAHPoolVfs();
      console.log('OPFS SAH Pool VFS installed');
    } catch (e) {
      console.warn('OPFS SAH Pool not installed, fallback to async OPFS');
    }
  }

  const db = new sqlite3.oo1.DB('/multisender.sqlite3', 'c');

  //   const db =
  //     'opfs' in sqlite3 ? new sqlite3.oo1.OpfsDb('/multisender.sqlite3',"c") : null;

  // const db =
  //     'opfs' in sqlite3 ? new sqlite3.OpfsSAHPoolDb('/multisender.sqlite3') : null;

  if (db) {
    try {
      db.exec(initSQL);
    } catch (e) {
      console.log('init ', e);
    }
  }

  log(
    'opfs' in sqlite3
      ? `OPFS is available, created persisted database at ${db?.filename}`
      : `OPFS is not available`,
  );
  // Your SQLite code here.
};

const initializeSQLite = async () => {
  try {
    log('Loading and initializing SQLite3 module...');
    const sqlite3 = await sqlite3InitModule({ print: log, printErr: error });
    // const poolUtil = await sqlite3.installOpfsSAHPoolVfs({
    //     name: "opfs-sah-pool",

    // });

    log('Done initializing. Running demo...');
    start(sqlite3);
  } catch (err: any) {
    error('Initialization error:', err.name, err.message);
  }
};

initializeSQLite();
