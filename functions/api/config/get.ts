import { verifyToken } from '../auth';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: '未授权访问' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const isValid = await verifyToken(token, env.JWT_SECRET || 'firefly-admin-secret');
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Token无效或已过期' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const configName = url.searchParams.get('name');
  
  if (!configName) {
    return new Response(JSON.stringify({ error: '缺少配置名称参数' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const validConfigs = [
    'siteConfig', 'profileConfig', 'sponsorConfig', 
    'announcementConfig', 'musicConfig', 'friendsConfig',
    'footerConfig', 'navBarLinks'
  ];
  
  if (!validConfigs.includes(configName)) {
    return new Response(JSON.stringify({ error: '无效的配置名称' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const filePath = `src/config/${configName}.json`;
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Firefly-Admin'
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: '配置文件不存在，请先创建对应的 JSON 文件',
          hint: `需要在仓库中创建 ${filePath}`
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const errorData = await response.json();
      return new Response(JSON.stringify({ 
        error: '获取配置失败',
        details: errorData.message || 'GitHub API 错误'
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    
    let content;
    try {
      content = JSON.parse(atob(data.content));
    } catch {
      return new Response(JSON.stringify({ 
        error: '配置文件 JSON 格式错误'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      content,
      sha: data.sha,
      path: data.path,
      size: data.size,
      lastModified: data.git?.lastModified || null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Get config error:', e);
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      details: e instanceof Error ? e.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}