import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateFirestoreId, sanitizeStr } from './utils';
import type { AnalyticsEvent, SiteSettings } from '../types';

export interface UtmParams {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
  }
  const params = new URLSearchParams(window.location.search);
  const current: UtmParams = {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
  };

  if (current.utmSource || current.utmMedium || current.utmCampaign) {
    try {
      sessionStorage.setItem('bd_utm_params', JSON.stringify(current));
    } catch {
      // Ignore storage failures
    }
    return current;
  }

  try {
    const saved = sessionStorage.getItem('bd_utm_params');
    if (saved) {
      return JSON.parse(saved) as UtmParams;
    }
  } catch {
    // Ignore storage failures
  }
  return current;
}

export async function logAnalyticsEvent(params: {
  eventType: AnalyticsEvent['eventType'];
  path: string;
  targetId?: string;
  source?: string;
}): Promise<void> {
  try {
    const utm = getStoredUtmParams();
    const id = generateFirestoreId('evt');
    await setDoc(doc(db, 'analytics', id), {
      eventType: params.eventType,
      path: sanitizeStr(params.path || '/', 240),
      ...(params.targetId ? { targetId: sanitizeStr(params.targetId, 128) } : {}),
      ...(params.source ? { source: sanitizeStr(params.source, 80) } : {}),
      ...(utm.utmSource ? { utmSource: sanitizeStr(utm.utmSource, 100) } : {}),
      createdAt: serverTimestamp(),
    });

    if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', params.eventType, {
        page_path: params.path,
        target_id: params.targetId,
        source: params.source,
      });
    }
  } catch {
    // Analytics should never interrupt user navigation
  }
}

export function injectExternalTracking(settings: SiteSettings): void {
  if (typeof document === 'undefined') return;

  if (settings.ga4Id && /^G-[A-Z0-9]+$/i.test(settings.ga4Id.trim())) {
    const gaId = settings.ga4Id.trim();
    if (!document.getElementById('bd-ga4-script')) {
      const s = document.createElement('script');
      s.id = 'bd-ga4-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);

      const inline = document.createElement('script');
      inline.id = 'bd-ga4-init';
      inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(inline);
    }
  }

  if (settings.gtmId && /^GTM-[A-Z0-9]+$/i.test(settings.gtmId.trim())) {
    const gtmId = settings.gtmId.trim();
    if (!document.getElementById('bd-gtm-script')) {
      const s = document.createElement('script');
      s.id = 'bd-gtm-script';
      s.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(s);
    }
  }

  if (settings.searchConsoleVerification) {
    let meta = document.querySelector('meta[name="google-site-verification"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'google-site-verification');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', settings.searchConsoleVerification.trim());
  }
}

export function updateDocumentMeta(params: { title: string; description: string }): void {
  if (typeof document === 'undefined') return;
  document.title = params.title;
  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  };
  setMeta('meta[name="description"]', params.description);
  setMeta('meta[property="og:title"]', params.title);
  setMeta('meta[property="og:description"]', params.description);
  setMeta('meta[name="twitter:title"]', params.title);
  setMeta('meta[name="twitter:description"]', params.description);
}
