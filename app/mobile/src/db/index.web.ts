import type { Db } from './repo';

// v1 is mobile only (SYSTEM_DESIGN §11); the web build is a design preview that keeps data in memory.
const preview: Db = {
  exec: () => {},
  run: () => {},
  all: () => [],
  tx: (task) => task(),
};

export const db = (): Db => preview;
