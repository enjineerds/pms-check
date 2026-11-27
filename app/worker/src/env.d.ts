declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
  interface GlobalProps {
    mainModule: typeof import('./index');
  }
}

interface Env extends Cloudflare.Env {}
