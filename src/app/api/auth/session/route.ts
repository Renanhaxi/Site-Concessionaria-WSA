import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseConfig, verifyAdminRequest } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { isConfigured } = getSupabaseConfig();
  const session = await verifyAdminRequest(request);

  return NextResponse.json({
    authenticated: session.authorized,
    email: session.email || null,
    supabaseConnected: isConfigured,
    mode: session.mode,
  });
}
