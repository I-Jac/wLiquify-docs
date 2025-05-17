/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'wLiquify Protocol Documentation',
  tagline: 'Understand, build, and use the wLiquify ecosystem. Your entry point to transparency and decentralized liquidity.',
  favicon: 'img/favicon.ico', // We'll add a placeholder favicon later

  // Set the production url of your site here
  url: 'https://your-org.github.io', // CHANGE THIS LATER to your GitHub Pages URL
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/wLiquify-docs/', // CHANGE THIS LATER if your repo name is different or using custom domain

  // GitHub pages deployment config.
  organizationName: 'your-org', // CHANGE THIS to your GitHub org/user name.
  projectName: 'wLiquify-docs', // CHANGE THIS to your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/your-org/wLiquify-docs/tree/main/', // CHANGE THIS
        },
        blog: false, // We are not using the blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg', // Placeholder, replace with actual social card
      navbar: {
        title: 'wLiquify Protocol',
        // logo: { // Uncomment and set logo if you have one
        //   alt: 'wLiquify Logo',
        //   src: 'img/logo.svg', // Placeholder
        // },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar', // Matches the ID in sidebars.js
            position: 'left',
            label: 'Documentation',
          },
          // {to: '/blog', label: 'Blog', position: 'left'}, // Blog disabled by default
          {
            href: 'https://github.com/your-github-org/wliquify-project', // Replace with actual GitHub repo
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
                label: 'User Guide',
                to: '/docs/user-guides/dapp-guide',
              },
              {
                label: 'Developer Docs',
                to: '/docs/developer-docs/overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow', // Replace/add actual links
                href: '#',
              },
              {
                label: 'Discord',
                href: '#',
              },
              {
                label: 'Twitter',
                href: '#',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // { // Blog disabled
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/your-github-org/wliquify-project', // Replace
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} wLiquify Protocol. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['rust', 'typescript', 'json', 'bash', 'solidity'], // Solidity might be useful for context or future
      },
    }),
};

export default config; 