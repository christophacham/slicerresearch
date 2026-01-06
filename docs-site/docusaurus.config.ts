import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Non-Planar Slicing Research',
  tagline: 'Comprehensive research on curved layer 3D printing algorithms',
  favicon: 'img/favicon.ico',

  url: 'https://christophacham.github.io',
  baseUrl: '/slicerresearch/',

  organizationName: 'christophacham',
  projectName: 'slicerresearch',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/christophacham/slicerresearch/tree/master/docs-site/',
          remarkPlugins: [require('remark-math')],
          rehypePlugins: [],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'Non-Planar Slicing',
      logo: {
        alt: 'Non-Planar Slicing Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/christophacham/slicerresearch',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Algorithms',
              to: '/docs/algorithms/overview',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Research Papers',
              to: '/docs/papers',
            },
            {
              label: 'Implementations',
              to: '/docs/implementations/overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/christophacham/slicerresearch',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Non-Planar Slicing Research. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'cpp', 'bash', 'json'],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;