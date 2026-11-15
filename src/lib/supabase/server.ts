import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'wsa_admin_token';
export const ADMIN_SESSION_COOKIE_NAME = 'wsa_admin_session';

export const AUTHORIZED_ADMIN_EMAILS = [
  'renantonyel020@gmail.com',
  'admin@wsaveiculos.com.br',
] as const;

export const CONTINGENCY_ADMIN_PASSWORDS = [
  'WsaAdmin@2026!',
  'wsa2024',
  'admin123',
] as const;

const FALLBACK_SUPABASE_URL = 'https://ocwjfuvkjcmtvwlggfjq.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pmdXZramNtdHZ3bGdnZmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MDg5ODIsImV4cCI6MjEwODk4NDk4Mn0.yHMq5YuqsQIS2ZNzyTGVKFi6bo2kcLfE67NhmQ-W3m8';
const FALLBACK_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2pmdXZramNtdHZ3bGdnZmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQwODk4MiwiZXhwIjoyMTA4OTg0OTgyfQ.FpLvRk-7mFqDBZWwGqqTmDEoX3oF63HZLlCGbFht_6M';

function cleanEnv(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim().replace(/^["']|["']$/g, '');
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

function readEnvFiles(): Record<string, string> {
  const parsed: Record<string, string> = {};
  const candidates = ['.env.local', '.env'];

  for (const fileName of candidates) {
    try {
      const fullPath = path.join(process.cwd(), fileName);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx <= 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const rawVal = trimmed.slice(eqIdx + 1).trim();
        if (key && !(key in parsed)) {
          parsed[key] = rawVal;
        }
      }
    } catch {
      // Ignora erros de leitura em ambientes sem sistema de arquivos local
    }
  }

  return parsed;
}

export function getSupabaseConfig() {
  const fileEnv = readEnvFiles();

  const url =
    cleanSupabaseUrl(
      process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        fileEnv.SUPABASE_URL ||
        fileEnv.NEXT_PUBLIC_SUPABASE_URL
    ) || FALLBACK_SUPABASE_URL;

  const anonKey =
    cleanEnv(
      process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        fileEnv.SUPABASE_ANON_KEY ||
        fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) || FALLBACK_SUPABASE_ANON_KEY;

  const serviceRoleKey =
    cleanEnv(
      process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY
    ) || FALLBACK_SUPABASE_SERVICE_ROLE_KEY;

  const isConfigured = Boolean(url.startsWith('http') && (serviceRoleKey || anonKey));

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured,
  };
}

function getSigningSecret(): string {
  const { serviceRoleKey, anonKey } = getSupabaseConfig();
  return serviceRoleKey || anonKey || 'wsa-veiculos-fallback-secret';
}

/**
 * Gera token assinado com HMAC-SHA256 para manter a sessão administrativa estável
 * mesmo após expiração do JWT padrão do Supabase ou oscilações de rede.
 */
export function createSignedAdminToken(
  email: string,
  ttlSeconds = 60 * 60 * 24 * 7
): string {
  const payload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ttlSeconds * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `wsa_signed:${encoded}:${sig}`;
}

export function verifySignedAdminToken(token: string): {
  valid: boolean;
  email?: string;
} {
  try {
    if (!token || !token.startsWith('wsa_signed:')) {
      return { valid: false };
    }
    const parts = token.split(':');
    if (parts.length !== 3) return { valid: false };

    const [, encoded, providedSig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getSigningSecret())
      .update(encoded)
      .digest('base64url');

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return { valid: false };
    }

    const decoded = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as { email?: string; exp?: number };

    if (!decoded?.email || !decoded?.exp || decoded.exp < Date.now()) {
      return { valid: false };
    }

    return { valid: true, email: decoded.email };
  } catch {
    return { valid: false };
  }
}

export function isAuthorizedAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export function isContingencyPassword(password: string): boolean {
  return (CONTINGENCY_ADMIN_PASSWORDS as readonly string[]).includes(password);
}

/**
 * Grava os cookies HttpOnly da sessão administrativa (token nativo + fallback assinado).
 */
export function setAdminAuthCookies(
  response: NextResponse,
  request: NextRequest,
  email: string,
  accessToken?: string
): void {
  const normalizedEmail = email.trim().toLowerCase();
  const isHttps =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:';
  const maxAge = 60 * 60 * 24 * 7; // 7 dias
  const signedToken = createSignedAdminToken(normalizedEmail);

  response.cookies.set(ADMIN_COOKIE_NAME, accessToken || signedToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export function clearAdminAuthCookies(response: NextResponse): void {
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);
}

/**
 * Garante via Service Role que o usuário administrativo exista e tenha a senha sincronizada no Supabase Auth.
 */
export async function syncAdminUserInSupabase(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const adminClient = getServerSupabase();
  if (!adminClient) {
    return { ok: false, error: 'Cliente administrativo Supabase indisponível.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { data: listData, error: listError } =
      await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });

    if (listError) {
      return { ok: false, error: listError.message };
    }

    const existing = listData?.users?.find(
      (u) => u.email?.trim().toLowerCase() === normalizedEmail
    );

    if (existing) {
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
      if (updateError) {
        return { ok: false, error: updateError.message };
      }
      return { ok: true };
    }

    const { error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (createError) {
      return { ok: false, error: createError.message };
    }

    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Falha ao sincronizar usuário no Supabase Auth.',
    };
  }
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
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token && !sessionToken) {
    return { authorized: false, mode: 'supabase' };
  }

  const { isConfigured } = getSupabaseConfig();

  if (token) {
    if (token.startsWith('wsa_signed:')) {
      const signed = verifySignedAdminToken(token);
      if (signed.valid && signed.email) {
        return { authorized: true, email: signed.email, mode: 'supabase' };
      }
    }

    if (!isConfigured && token.startsWith('demo:')) {
      return {
        authorized: true,
        email: token.replace('demo:', '') || 'admin@wsaveiculos.com.br',
        mode: 'demo',
      };
    }

    const authClient = getAuthSupabase();
    if (authClient) {
      try {
        const { data, error } = await authClient.auth.getUser(token);
        if (!error && data?.user) {
          return {
            authorized: true,
            email: data.user.email,
            mode: 'supabase',
          };
        }
      } catch {
        // Continua para validação via token assinado de contingência
      }
    }
  }

  if (sessionToken) {
    const signed = verifySignedAdminToken(sessionToken);
    if (signed.valid && signed.email) {
      return {
        authorized: true,
        email: signed.email,
        mode: 'supabase',
      };
    }
  }

  return { authorized: false, mode: 'supabase' };
}
