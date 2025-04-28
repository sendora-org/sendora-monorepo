import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.sendora.org',
  integrations: [
    starlight({
      title: 'SENDORA docs',
      social: {
        github: 'https://github.com/sendora-org/sendora-monorepo',
      },
      sidebar: [
        {
          label: 'Why We Built SENDORA',
          autogenerate: { directory: 'why-we-built-sendora' },
        },
        {
          label: 'Getting started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Advanced',
          autogenerate: { directory: 'advanced' },
        },

        {
          label: '',
          autogenerate: { directory: 'advanced' },
        },

        {
          label: 'SNDRA.LINK',
          autogenerate: { directory: 'sndra-link' },
        },

        {
          label: 'SENDORA Wallet',
          autogenerate: { directory: 'sendora-wallet' },
        },
        {
          label: 'SENDORA Vault',
          autogenerate: { directory: 'sendora-vault' },
        },

        {
          label: 'FAQs',
          autogenerate: { directory: 'faqs' },
        },
        {
          label: 'Help',
          autogenerate: { directory: 'help' },
        },
      ],
    }),
  ],
});
