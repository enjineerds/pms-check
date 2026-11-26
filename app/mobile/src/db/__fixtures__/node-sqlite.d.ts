// Jest runs on Node, but the app's tsconfig has no Node types.
declare module 'node:sqlite' {
  type Value = string | number | null;
  interface StatementSync {
    run(...params: Value[]): unknown;
    all(...params: Value[]): unknown[];
  }
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
