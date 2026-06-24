import type { APIRequestContext } from '@playwright/test';

export interface AuthResult {
  token: string;
  userId: string;
  email: string;
  rol: string;
}

const ROLE_TO_USER: Record<string, { email: string }> = {
  cliente: { email: 'cliente@cinema.com' },
  admin: { email: 'admin@cinema.com' },
};

export async function loginAs(
  request: APIRequestContext,
  rol: 'cliente' | 'admin',
): Promise<AuthResult> {
  const { email } = ROLE_TO_USER[rol];
  const res = await request.post('/auth/login', {
    data: { email, password: 'password123' },
  });
  if (!res.ok()) {
    throw new Error(`Login falló para ${email}: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return {
    token: body.access_token,
    userId: body.usuario.id,
    email: body.usuario.email,
    rol,
  };
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
