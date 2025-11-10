'use client';

import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

type RecaptchaStatus = 'idle' | 'loading' | 'ready' | 'error';

let recaptchaLoadPromise: Promise<void> | null = null;

const loadRecaptchaScript = (siteKey: string) => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.grecaptcha?.execute) {
    return Promise.resolve();
  }

  if (recaptchaLoadPromise) {
    return recaptchaLoadPromise;
  }

  recaptchaLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.google.com/recaptcha/api.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.grecaptcha?.ready(() => resolve());
      });
      existingScript.addEventListener('error', (error) => {
        recaptchaLoadPromise = null;
        reject(error);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha?.ready(() => resolve());
    };

    script.onerror = (error) => {
      recaptchaLoadPromise = null;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return recaptchaLoadPromise;
};

export const useRecaptcha = (siteKey?: string) => {
  const [status, setStatus] = useState<RecaptchaStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') {
      return;
    }

    setStatus('loading');
    loadRecaptchaScript(siteKey)
      .then(() => {
        setStatus('ready');
        setLastError(null);
      })
      .catch((error) => {
        console.error('reCAPTCHA failed to load:', error);
        setStatus('error');
        setLastError('بارگذاری reCAPTCHA با مشکل مواجه شد. لطفا دوباره تلاش کنید.');
      });
  }, [siteKey]);

  const executeRecaptcha = useCallback(
    async (action: string) => {
      if (!siteKey) {
        throw new Error('reCAPTCHA site key تعریف نشده است.');
      }

      if (typeof window === 'undefined') {
        throw new Error('reCAPTCHA فقط در مرورگر قابل اجرا است.');
      }

      if (!window.grecaptcha?.execute) {
        await loadRecaptchaScript(siteKey);
      }

      if (!window.grecaptcha?.execute) {
        throw new Error('reCAPTCHA آماده استفاده نیست.');
      }

      return window.grecaptcha.execute(siteKey, { action });
    },
    [siteKey]
  );

  return {
    status,
    executeRecaptcha,
    error: lastError,
    isReady: status === 'ready',
  };
};


