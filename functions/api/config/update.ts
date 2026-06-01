import { verifyToken } from '../auth';

export async function onRequestPost(context: any) {
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
  
  let jsonContent;
  try {
    jsonContent = JSON.stringify(content, null, 2);
  } catch {
    return new Response(JSON.stringify({ error: '内容无法转换为 JSON' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const encodedContent = btoa(jsonContent);
  
  try {
    let currentSha = sha;
    
    if (!currentSha) {
      const getResponse = await fetch(
        `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Firefly-Admin'
          }
        }
      );
      
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentSha = fileData.sha;
      } else if (getResponse.status === 404) {
        return new Response(JSON.stringify({ 
          error: '配置文件不存在，请先创建'
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const updateResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Firefly-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update ${configName} via Firefly Admin Panel`,
          content: encodedContent,
          sha: currentSha,
          branch: 'main'
        })
      }
    );
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      
      if (updateResponse.status === 409) {
        return new Response(JSON.stringify({ 
          error: '文件已被修改，请重新获取最新版本',
          hint: 'SHA 不匹配，可能需要刷新页面'
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: '更新失败',
        details: errorData.message || 'GitHub API 错误'
      }), { 
        status: updateResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await updateResponse.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      message: '配置已更新，网站将自动重新部署',
      commit: {
        sha: result.commit.sha,
        html_url: result.commit.html_url,
        message: result.commit.message
      },
      content: {
        sha: result.content.sha,
        path: result.content.path,
        size: result.content.size
      },
      deployHint: 'Cloudflare Pages 将在几分钟内自动完成重新部署'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Update config error:', e);
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      details: e instanceof Error ? e.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}