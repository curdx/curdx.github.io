import { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const en: LocaleSpecificConfig<DefaultTheme.Config> = {
  lang: 'en',
  themeConfig: {
    nav: [
      {
        text: 'Projects',
        items: [
          { text: 'CurdX Bridge', link: '/curdx-bridge/' },
          { text: 'CurdX Flow', link: '/curdx-flow/' },
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

      '/curdx-flow/': [
        {
          text: 'CurdX Flow',
          items: [
            { text: 'Overview', link: '/curdx-flow/' },
            { text: 'Getting Started', link: '/curdx-flow/getting-started' },
            { text: 'How It Works', link: '/curdx-flow/how-it-works' },
            { text: 'Configuration', link: '/curdx-flow/configuration' },
            { text: 'Commands', link: '/curdx-flow/commands' },
          ],
        },
        {
          text: 'Subagents',
          items: [
            { text: 'Overview', link: '/curdx-flow/agents/' },
            { text: 'research-analyst', link: '/curdx-flow/agents/research-analyst' },
            { text: 'product-manager', link: '/curdx-flow/agents/product-manager' },
            { text: 'architect-reviewer', link: '/curdx-flow/agents/architect-reviewer' },
            { text: 'task-planner', link: '/curdx-flow/agents/task-planner' },
            { text: 'spec-executor', link: '/curdx-flow/agents/spec-executor' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/curdx-flow/troubleshooting' },
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
