import { UtmParams } from '@/types';

const UTM_STORAGE_KEY = 'wsa_utm_attribution';

export function captureUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const existing = getStoredUtmParams();

    const utm_source = searchParams.get('utm_source') || existing.utm_source || undefined;
    const utm_medium = searchParams.get('utm_medium') || existing.utm_medium || undefined;
    const utm_campaign = searchParams.get('utm_campaign') || existing.utm_campaign || undefined;
    const utm_term = searchParams.get('utm_term') || existing.utm_term || undefined;
    const utm_content = searchParams.get('utm_content') || existing.utm_content || undefined;
    const referrer = document.referrer ? new URL(document.referrer).hostname : (existing.referrer || undefined);

    const utms: UtmParams = {
      utm_source: utm_source || (document.referrer ? 'referrer' : 'direct'),
      utm_medium: utm_medium || (document.referrer ? 'referral' : 'organic'),
      utm_campaign,
      utm_term,
      utm_content,
      referrer,
    };

    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
    return utms;
  } catch {
    return {};
  }
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
