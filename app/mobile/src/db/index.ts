import { openDatabaseSync } from 'expo-sqlite';
import type { Db } from './repo';
import { migrate } from './schema';

let conn: Db | null = null;

export function db(): Db {
  if (conn) return conn;
  const sqlite = openDatabaseSync('pms-check.db');
  conn = {
    exec: (sql) => sqlite.execSync(sql),
    run: (sql, params = []) => {
      sqlite.runSync(sql, params);
    },
    all: (sql, params = []) => sqlite.getAllSync(sql, params),
    tx: (task) => sqlite.withTransactionSync(task),
  };
  migrate(conn);
  return conn;
}
