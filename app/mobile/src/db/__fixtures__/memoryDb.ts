import { DatabaseSync } from 'node:sqlite';
import type { Db } from '../repo';
import { migrate } from '../schema';

export function memoryDb(): Db {
  const sqlite = new DatabaseSync(':memory:');
  const db: Db = {
    exec: (sql) => sqlite.exec(sql),
    run: (sql, params = []) => {
      sqlite.prepare(sql).run(...params);
    },
    all: <T,>(sql: string, params: (string | number | null)[] = []) => sqlite.prepare(sql).all(...params) as T[],
    tx: (task) => {
      sqlite.exec('BEGIN');
      try {
        task();
        sqlite.exec('COMMIT');
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  };
  migrate(db);
  return db;
}
