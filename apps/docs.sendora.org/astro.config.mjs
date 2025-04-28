import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.sendora.org',
  integrations: [
    starlight({
      title: 'SENDORA Tutorial',
      social: {
        github: 'https://github.com/sendora-org/sendora-monorepo',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', slug: 'guides/example' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
