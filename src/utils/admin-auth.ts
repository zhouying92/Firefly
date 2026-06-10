const JWT_SECRET = import.meta.env.JWT_SECRET || 'firefly-admin-secret-2025';

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;

    const expiresAt = timestamp + 24 * 60 * 60 * 1000;
    if (Date.now() > expiresAt) return false;

    const payload = `${timestamp}:${JWT_SECRET}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hash === parts[1];
  } catch {
    return false;
  }
}

export async function generateToken(): Promise<string> {
  const timestamp = Date.now();
  const payload = `${timestamp}:${JWT_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}.${hash}`;
}
