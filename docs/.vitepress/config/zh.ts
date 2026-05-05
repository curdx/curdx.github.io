import { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const zh: LocaleSpecificConfig<DefaultTheme.Config> = {
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      {
        text: '项目',
        items: [
          { text: 'CurdX Bridge', link: '/zh/curdx-bridge/' },
          { text: 'CurdX Flow', link: '/zh/curdx-flow/' },
        ],
      },
    ],

    sidebar: {
      '/zh/curdx-bridge/': [
        {
          text: 'CurdX Bridge',
          items: [
            { text: '概览', link: '/zh/curdx-bridge/' },
            { text: '快速开始', link: '/zh/curdx-bridge/getting-started' },
            { text: '工作原理', link: '/zh/curdx-bridge/how-it-works' },
            { text: '配置', link: '/zh/curdx-bridge/configuration' },
            { text: '命令参考', link: '/zh/curdx-bridge/commands' },
          ],
        },
        {
          text: 'Skills',
          items: [
            { text: '总览', link: '/zh/curdx-bridge/skills/' },
            { text: 'cxb-ask', link: '/zh/curdx-bridge/skills/cxb-ask' },
            { text: 'cxb-plan', link: '/zh/curdx-bridge/skills/cxb-plan' },
            { text: 'cxb-review', link: '/zh/curdx-bridge/skills/cxb-review' },
            { text: 'cxb-task-plan', link: '/zh/curdx-bridge/skills/cxb-task-plan' },
            { text: 'cxb-task-run', link: '/zh/curdx-bridge/skills/cxb-task-run' },
          ],
        },
        {
          text: '帮助',
          items: [
            { text: '故障排除', link: '/zh/curdx-bridge/troubleshooting' },
          ],
        },
      ],

      '/zh/curdx-flow/': [
        {
          text: 'CurdX Flow',
          items: [
            { text: '概览', link: '/zh/curdx-flow/' },
            { text: '快速开始', link: '/zh/curdx-flow/getting-started' },
            { text: '工作原理', link: '/zh/curdx-flow/how-it-works' },
            { text: '配置', link: '/zh/curdx-flow/configuration' },
            { text: '命令参考', link: '/zh/curdx-flow/commands' },
          ],
        },
        {
          text: '子 Agent',
          items: [
            { text: '总览', link: '/zh/curdx-flow/agents/' },
            { text: 'research-analyst', link: '/zh/curdx-flow/agents/research-analyst' },
            { text: 'product-manager', link: '/zh/curdx-flow/agents/product-manager' },
            { text: 'architect-reviewer', link: '/zh/curdx-flow/agents/architect-reviewer' },
            { text: 'task-planner', link: '/zh/curdx-flow/agents/task-planner' },
            { text: 'spec-executor', link: '/zh/curdx-flow/agents/spec-executor' },
          ],
        },
        {
          text: '帮助',
          items: [
            { text: '故障排除', link: '/zh/curdx-flow/troubleshooting' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/curdx/curdx.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: { label: '本页目录' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
  },
}
