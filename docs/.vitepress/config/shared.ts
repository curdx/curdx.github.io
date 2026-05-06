import { defineConfig } from 'vitepress'

export const shared = defineConfig({
  title: 'CurdX',
  description: 'Multi-AI Developer Tools',

  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    [
      'script',
      {},
      `(function(){try{
        var p=location.pathname;
        if(p!=='/'&&p!=='/index.html')return;
        if(localStorage.getItem('curdx-auto-lang-done'))return;
        var lang=(navigator.language||navigator.userLanguage||'').toLowerCase();
        localStorage.setItem('curdx-auto-lang-done','1');
        if(lang.indexOf('zh')===0)location.replace('/zh/'+location.search+location.hash);
      }catch(e){}})();`,
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/curdx' },
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '显示详情',
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除查询',
                footer: {
                  selectText: '选择',
                  closeText: '关闭',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },
  },
})
