'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function SupabaseAuthListener() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return;

    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const type = params.get('type') || 'magiclink';

    if (!accessToken) return;

    let cancelled = false;
    setProcessing(true);

    async function exchangeHashToken() {
      try {
        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, type }),
        });

        const data = await res.json();
        if (cancelled) return;

        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );

        if (res.ok && data.authenticated) {
          if (type === 'recovery') {
            router.replace(
              `/admin/login?recovery=1&email=${encodeURIComponent(data.email || '')}`
            );
          } else {
            router.replace('/admin');
            router.refresh();
          }
          return;
        }

        router.replace('/admin/login?expired=1');
      } catch {
        if (!cancelled) {
          router.replace('/admin/login?expired=1');
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    }

    exchangeHashToken();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090B]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-machined rounded-3xl p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-display font-bold text-white">
            Autenticando link seguro do Supabase...
          </h2>
          <p className="text-xs text-zinc-400">
            Validando sua sessão administrativa no servidor.
          </p>
        </div>
        <div className="flex justify-center pt-1">
          <Loader2 className="w-5 h-5 text-wsa-red animate-spin" />
        </div>
      </div>
    </div>
  );
}
