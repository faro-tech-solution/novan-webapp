# CAPTCHA Implementation with Cloudflare Turnstile

This document explains how to set up and use CAPTCHA verification using Cloudflare Turnstile in the Novan Webapp.

## Overview

CAPTCHA verification has been implemented to prevent bot attacks on both login and registration pages. The implementation uses Cloudflare Turnstile, which provides a privacy-focused alternative to traditional CAPTCHA solutions.

## Setup Instructions

### 1. Get Cloudflare Turnstile Keys

1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Sign up or log in to your Cloudflare account
3. Create a new site:
   - Enter your domain name (e.g., `yourdomain.com`)
   - Choose the appropriate widget mode
   - Copy the **Site Key** and **Secret Key**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

**Important Notes:**
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is used on the frontend and can be public
- `TURNSTILE_SECRET_KEY` should be kept secret and used for server-side verification

### 3. Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Settings**
3. Under **Bot and Abuse Protection**, enable **CAPTCHA protection**
4. Select **Turnstile** as the provider
5. Enter your `TURNSTILE_SECRET_KEY` in the **Secret key** field
6. Save the configuration

## Implementation Details

### Components

#### TurnstileCaptcha Component

A reusable React component (`src/components/auth/TurnstileCaptcha.tsx`) that wraps the Cloudflare Turnstile widget:

```typescript
interface TurnstileCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  className?: string;
}
```

**Features:**
- Automatic token management
- Error handling
- Expiration handling
- Reset functionality
- Theme and size customization

### Authentication Integration

#### AuthContext Updates

The `AuthContext` has been updated to support CAPTCHA tokens:

```typescript
// Login function
const login = async (email: string, password: string, captchaToken?: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });
  return { error };
};

// Register function
const register = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  role: UserRole,
  captchaToken?: string
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { first_name, last_name, role },
      ...(captchaToken && { captchaToken }),
    },
  });
  return { error };
};
```

### Page Updates

#### Login Page (`src/components/pages/auth/Login.tsx`)

- Added CAPTCHA verification before form submission
- Disabled submit button until CAPTCHA is completed
- Reset CAPTCHA on authentication errors
- Persian error messages for CAPTCHA-related issues

#### Register Page (`src/components/pages/auth/Register.tsx`)

- Added CAPTCHA verification before form submission
- Disabled submit button until CAPTCHA is completed
- Reset CAPTCHA on registration errors
- Persian error messages for CAPTCHA-related issues

## User Experience

### Flow

1. User visits login/register page
2. User fills out the form
3. User completes CAPTCHA challenge
4. Submit button becomes enabled
5. Form submission includes CAPTCHA token
6. Supabase validates the token server-side
7. Authentication proceeds if token is valid

### Error Handling

- **CAPTCHA not completed**: Form submission is blocked with a Persian error message
- **CAPTCHA error**: Error message displayed, CAPTCHA resets automatically
- **CAPTCHA expired**: User notified to complete CAPTCHA again
- **Authentication failure**: CAPTCHA resets for retry

## Security Features

1. **Server-side validation**: CAPTCHA tokens are validated by Supabase using the secret key
2. **Token expiration**: Tokens expire automatically for security
3. **Reset on errors**: CAPTCHA resets after failed authentication attempts
4. **Privacy-focused**: Turnstile is privacy-focused and doesn't track users

## Testing

### Local Development

For local testing, you may need to:

1. Use a tool like ngrok to expose your local development server
2. Add your ngrok URL to the Turnstile site configuration
3. Or add `localhost` to your Turnstile site's allowed domains

### Production

Ensure your production domain is properly configured in the Turnstile dashboard.

## Troubleshooting

### Common Issues

1. **CAPTCHA not loading**: Check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
2. **Authentication failing**: Verify that `TURNSTILE_SECRET_KEY` is configured in Supabase
3. **Domain issues**: Ensure your domain is added to the Turnstile site configuration

### Debug Mode

Enable debug mode in Turnstile for development by adding `?turnstile=debug` to your URL.

## Dependencies

- `@marsidev/react-turnstile`: React wrapper for Cloudflare Turnstile
- `@supabase/supabase-js`: Supabase client with CAPTCHA support

## Future Enhancements

- Add CAPTCHA to password reset functionality
- Implement CAPTCHA for other sensitive operations
- Add analytics for CAPTCHA completion rates
- Consider implementing CAPTCHA bypass for trusted users

