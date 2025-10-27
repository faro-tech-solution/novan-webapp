'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

export interface TurnstileCaptchaRef {
  reset: () => void;
  getToken: () => string | undefined;
}

interface TurnstileCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}

export const TurnstileCaptcha = forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  ({ siteKey, onVerify, onError, onExpire, theme = 'auto', size = 'normal', className }, ref) => {
    const turnstileRef = useRef<any>(null);
    const currentToken = useRef<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (turnstileRef.current) {
          turnstileRef.current.reset();
          currentToken.current = undefined;
        }
      },
      getToken: () => currentToken.current,
    }));

    const handleSuccess = (token: string) => {
      currentToken.current = token;
      onVerify(token);
    };

    const handleError = (error: string) => {
      currentToken.current = undefined;
      onError?.(error);
    };

    const handleExpire = () => {
      currentToken.current = undefined;
      onExpire?.();
    };

    return (
      <div className={className}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={handleSuccess}
          onError={handleError}
          onExpire={handleExpire}
          options={{
            theme,
            size,
          }}
        />
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';
