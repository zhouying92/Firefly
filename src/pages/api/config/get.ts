import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { verifyToken } from '@/utils/admin-auth';

const validConfigs = [
  'siteConfig', 'profileConfig', 'sponsorConfig', 
  'announcementConfig', 'musicConfig', 'friendsConfig',
  'footerConfig', 'navBarLinks'
];

const mockConfigs: Record<string, any> = {
  siteConfig: {
    title: "Firefly",
    subtitle: "Demo site",
    site_url: "https://firefly.cuteleaf.cn",
    description: "Firefly 是一款基于 Astro 框架开发的博客主题",
    keywords: ["Firefly", "Fuwari", "Astro", "博客"],
    lang: "zh_CN",
    themeColor: { hue: 165, fixed: false, defaultMode: "system" },
    pageWidth: 100,
    card: { border: true, followTheme: false }
  },
  profileConfig: {
    avatar: "assets/images/avatar.avif",
    name: "Firefly",
    bio: "Hello, I'm Firefly.",
    links: []
  },
  sponsorConfig: {
    title: "",
    description: "",
    usage: "您的赞助将用于服务器维护",
    showSponsorsList: true,
    showComment: true,
    showButtonInPost: true,
    methods: [],
    sponsors: []
  },
  announcementConfig: {
    title: "公告",
    content: "欢迎来到我的博客！",
    closable: true,
    link: { enable: false }
  },
  musicConfig: {
    showInNavbar: true,
    mode: "meting",
    volume: 0.7,
    playMode: "list",
    showLyrics: true
  },
  friendsConfig: {
    pageConfig: {
      title: "",
      description: "",
      showCustomContent: true,
      showComment: true,
      randomizeSort: false
    },
    friends: []
  },
  footerConfig: {
    enable: false
  },
  navBarLinks: {
    customLinks: []
  }
};

export const prerender = false;
export const GET: APIRoute = async ({ request, url }) => {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: '未授权访问' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const isValid = await verifyToken(token);
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Token无效或已过期' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const configName = url.searchParams.get('name');
  
  if (!configName) {
    return new Response(JSON.stringify({ error: '缺少配置名称参数' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!validConfigs.includes(configName)) {
    return new Response(JSON.stringify({ error: '无效的配置名称' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const configDir = path.join(process.cwd(), 'src/config');
  const filePath = path.join(configDir, `${configName}.json`);
  
  let content;
  let sha = 'mock-sha-' + Date.now();
  
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      content = JSON.parse(fileContent);
      sha = 'file-sha-' + Buffer.from(fileContent).length;
    } else {
      content = mockConfigs[configName] || {};
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      content,
      sha,
      path: `src/config/${configName}.json`,
      isMock: !fs.existsSync(filePath)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ 
      error: '读取配置文件失败',
      details: e instanceof Error ? e.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

