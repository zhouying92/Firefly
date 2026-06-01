import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { verifyToken } from '@/utils/admin-auth';

const validConfigs = [
  'siteConfig', 'profileConfig', 'sponsorConfig', 
  'announcementConfig', 'musicConfig', 'friendsConfig',
  'footerConfig', 'navBarLinks'
];

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
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
  
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: '请求体 JSON 格式错误' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const { configName, content, sha } = body;
  
  if (!configName || !content) {
    return new Response(JSON.stringify({ 
      error: '缺少必要参数',
      required: ['configName', 'content']
    }), { 
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
  
  try {
    const jsonContent = JSON.stringify(content, null, 2);
    
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    
    const newSha = 'file-sha-' + Buffer.from(jsonContent).length;
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '配置已更新（本地测试模式）',
      commit: {
        sha: 'mock-commit-' + Date.now(),
        message: `Update ${configName} locally`
      },
      content: {
        sha: newSha,
        path: `src/config/${configName}.json`
      },
      note: '本地测试：文件已写入本地，部署到 Cloudflare 后才会更新 GitHub'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ 
      error: '写入配置文件失败',
      details: e instanceof Error ? e.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};