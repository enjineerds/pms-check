import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canonical origin. Social previews (og:image, og:url) and the canonical tag are built
  // from it, so update it when the site moves to its own domain.
  site: 'https://pms-check.kowdstudio.workers.dev',
});
