export const prerender = false;

import { generateToken } from '@/utils/admin-auth';

export async function POST({ request }: { request: Request }) {
  console.log('POST /api/auth called');
  
  try {
    const text = await request.text();
    console.log('Request body:', text);
    
    if (!text) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '请求体为空' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = JSON.parse(text);
    const { password } = body;
    

    if (password === 'admin123') {
      const token = await generateToken();

      return new Response(JSON.stringify({
        success: true,
        token
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    
    return new Response(JSON.stringify({ 
      success: false, 
      error: '密码错误' 
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('Error:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(e)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ valid: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}