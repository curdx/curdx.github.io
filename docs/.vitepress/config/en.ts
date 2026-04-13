import { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const en: LocaleSpecificConfig<DefaultTheme.Config> = {
  lang: 'en',
  themeConfig: {
    nav: [
      {
        text: 'Projects',
        items: [
          { text: 'CurdX Bridge', link: '/curdx-bridge/' },
        ],
      },
    ],

    sidebar: {
      '/curdx-bridge/': [
        {
          text: 'CurdX Bridge',
          items: [
            { text: 'Overview', link: '/curdx-bridge/' },
            { text: 'Getting Started', link: '/curdx-bridge/getting-started' },
            { text: 'How It Works', link: '/curdx-bridge/how-it-works' },
            { text: 'Configuration', link: '/curdx-bridge/configuration' },
            { text: 'Commands', link: '/curdx-bridge/commands' },
          ],
        },
        {
          text: 'Skills',
          items: [
            { text: 'Overview', link: '/curdx-bridge/skills/' },
            { text: 'cxb-ask', link: '/curdx-bridge/skills/cxb-ask' },
            { text: 'cxb-plan', link: '/curdx-bridge/skills/cxb-plan' },
            { text: 'cxb-review', link: '/curdx-bridge/skills/cxb-review' },
            { text: 'cxb-task-plan', link: '/curdx-bridge/skills/cxb-task-plan' },
            { text: 'cxb-task-run', link: '/curdx-bridge/skills/cxb-task-run' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/curdx-bridge/troubleshooting' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/curdx/curdx.github.io/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
}
