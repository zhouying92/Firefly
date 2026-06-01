export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '请输入密码' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const adminPassword = env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '密码错误' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = await generateToken(env.JWT_SECRET || 'firefly-admin-secret');
    
    return new Response(JSON.stringify({ 
      success: true, 
      token,
      expiresIn: 24 * 60 * 60 * 1000
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_token=${token}; Path=/; Max-Age=86400; HttpOnly`
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: '请求处理失败' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context: any) {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(JSON.stringify({ valid: false }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const isValid = await verifyToken(token, env.JWT_SECRET || 'firefly-admin-secret');
  
  return new Response(JSON.stringify({ valid: isValid }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateToken(secret: string): Promise<string> {
  const timestamp = Date.now();
  const payload = `${timestamp}:${secret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}.${hashHex}`;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    
    const timestamp = parseInt(parts[0], 10);
    const hash = parts[1];
    
    if (isNaN(timestamp)) return false;
    
    const expiresAt = timestamp + 24 * 60 * 60 * 1000;
    if (Date.now() > expiresAt) return false;
    
    const payload = `${timestamp}:${secret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hash === computedHash;
  } catch {
    return false;
  }
}

export { verifyToken };