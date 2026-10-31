import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'wsa_admin_token';

function cleanEnv(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed.includes('SEU-PROJETO') ||
    trimmed.includes('seu-projeto') ||
    trimmed.includes('cole-sua-chave') ||
    trimmed.includes('sua-anon-key')
  ) {
    return '';
  }
  return trimmed;
}

function cleanSupabaseUrl(val?: string): string {
  const cleaned = cleanEnv(val);
  if (!cleaned) return '';
  return cleaned
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

export function getSupabaseConfig() {
  const url = cleanSupabaseUrl(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const anonKey = cleanEnv(
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const isConfigured = Boolean(url.startsWith('http') && (serviceRoleKey || anonKey));

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured,
  };
}

/**
 * Cliente Supabase exclusivo de servidor (Backend-for-Frontend).
 * Utiliza a Service Role Key (quando disponível) para operações atômicas
 * validadas pelo próprio servidor Next.js, sem jamais expor chaves ao navegador.
 */
export function getServerSupabase(): SupabaseClient | null {
  const { url, anonKey, serviceRoleKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const key = serviceRoleKey || anonKey;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Cliente Supabase de autenticação (para validar login e JWT de administradores).
 */
export function getAuthSupabase(): SupabaseClient | null {
  const { url, anonKey, serviceRoleKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const key = anonKey || serviceRoleKey;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Valida se a requisição possui sessão administrativa legítima via Cookie HttpOnly.
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ authorized: boolean; email?: string; mode: 'supabase' | 'demo' }> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return { authorized: false, mode: 'supabase' };
  }

  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    if (token.startsWith('demo:')) {
      return {
        authorized: true,
        email: token.replace('demo:', '') || 'admin@wsaveiculos.com.br',
        mode: 'demo',
      };
    }
    return { authorized: false, mode: 'demo' };
  }

  const authClient = getAuthSupabase();
  if (!authClient) {
    return { authorized: false, mode: 'supabase' };
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    return { authorized: false, mode: 'supabase' };
  }

  return {
    authorized: true,
    email: data.user.email,
    mode: 'supabase',
  };
}
