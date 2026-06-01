export async function onRequestGet(context: any) {
  const configs = [
    {
      name: 'siteConfig',
      label: '站点配置',
      file: 'src/config/siteConfig.json',
      description: '网站标题、描述、主题色等基础配置'
    },
    {
      name: 'profileConfig',
      label: '个人资料',
      file: 'src/config/profileConfig.json',
      description: '头像、昵称、简介、社交链接'
    },
    {
      name: 'sponsorConfig',
      label: '赞助配置',
      file: 'src/config/sponsorConfig.json',
      description: '赞助方式、收款码、赞助者列表'
    },
    {
      name: 'announcementConfig',
      label: '公告配置',
      file: 'src/config/announcementConfig.json',
      description: '公告内容、链接设置'
    },
    {
      name: 'musicConfig',
      label: '音乐播放器',
      file: 'src/config/musicConfig.json',
      description: '音乐源、播放模式、歌单配置'
    },
    {
      name: 'friendsConfig',
      label: '友链配置',
      file: 'src/config/friendsConfig.json',
      description: '友链列表、页面设置'
    },
    {
      name: 'footerConfig',
      label: '页脚配置',
      file: 'src/config/footerConfig.json',
      description: '页脚自定义内容'
    },
    {
      name: 'navBarLinks',
      label: '导航栏链接',
      file: 'src/config/navBarLinks.json',
      description: '自定义导航栏菜单项'
    }
  ];
  
  return new Response(JSON.stringify({ 
    success: true,
    configs,
    total: configs.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}