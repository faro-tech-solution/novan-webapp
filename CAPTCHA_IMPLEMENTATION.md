# CAPTCHA Implementation with Google reCAPTCHA v3

This document explains how to set up and use CAPTCHA verification using Google reCAPTCHA v3 in the Novan Webapp.

## Overview

CAPTCHA verification has been implemented to prevent bot attacks on both login and registration pages. The implementation uses Google reCAPTCHA v3 and integrates with Supabase’s bot protection through the `captchaToken` parameter.

## Setup Instructions

### 1. Get Google reCAPTCHA v3 Keys

1. Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Choose **reCAPTCHA v3**
3. Add your domain name (e.g., `yourdomain.com`)
4. Accept the terms of service and create the keys
5. Copy the **Site Key** and **Secret Key**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Google reCAPTCHA v3 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

**Important Notes:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is used on the frontend and can be public
- `RECAPTCHA_SECRET_KEY` must remain secret and is used by Supabase for server-side verification

### 3. Configure Supabase

1. In the Supabase Dashboard, navigate to **Authentication** > **Settings**
2. Under **Bot and Abuse Protection**, enable **CAPTCHA protection**
3. Select **reCAPTCHA** as the provider
4. Enter your `RECAPTCHA_SECRET_KEY` in the **Secret key** field
5. Save the configuration

## Implementation Details

### Hooks

#### `useRecaptcha` Hook

A reusable client hook (`src/hooks/useRecaptcha.ts`) manages loading the Google reCAPTCHA script and executing actions when needed.

Key features:
- Lazy-loads the reCAPTCHA script only in production
- Exposes `executeRecaptcha(action)` to obtain a token
- Provides loading/error state so forms can handle disabled buttons and toast messages

### Authentication Integration

`AuthContext` already supports passing a `captchaToken` when calling Supabase:

```typescript
const login = async (email: string, password: string, captchaToken?: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });
  return { error };
};

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

- Loads reCAPTCHA v3 when running in production
- Prevents form submission until reCAPTCHA is ready
- Executes `executeRecaptcha('login')` prior to calling Supabase
- Displays localized error messages when the token cannot be obtained

#### Register Page (`src/components/pages/auth/Register.tsx`)

- Follows the same pattern as the login page
- Uses action name `'register'` when requesting tokens
- Keeps strong-password validation and localized error handling

## User Experience

### Flow

1. User visits login/register page
2. reCAPTCHA automatically loads in the background (in production)
3. User fills out the form
4. On submit, the app executes reCAPTCHA for the relevant action
5. The returned token is sent to Supabase along with the form data
6. Supabase validates the token server-side and proceeds with authentication if valid

### Error Handling

- **reCAPTCHA loading failure**: User sees a localized toast instructing them to retry
- **reCAPTCHA not ready**: Submit button is disabled until the script signals readiness
- **Authentication failure**: Standard error handling from Supabase is shown

## Security Features

1. **Server-side validation**: Tokens are validated by Supabase using the secret key
2. **Action-based scoring**: reCAPTCHA v3 evaluates different actions (`login`, `register`) independently
3. **No visual challenge**: Users are not interrupted by a widget, keeping the flow smooth

## Testing

### Local Development

- reCAPTCHA is **automatically disabled** when not in production mode (`NODE_ENV !== 'production'`)
- Local development does not require real keys or token execution

### Production-like Testing

If you need to test reCAPTCHA locally with real tokens:

1. Expose your local server via a tool such as ngrok
2. Add the ngrok URL to the list of allowed domains in the reCAPTCHA console
3. Set `NODE_ENV=production` and provide the environment variables

### Production

Ensure your production domain is registered in the Google reCAPTCHA console and that Supabase is configured with the matching secret key.

## Troubleshooting

1. **reCAPTCHA script not loading**: Verify that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set and allowed for your domain
2. **Authentication failing**: Confirm that `RECAPTCHA_SECRET_KEY` is correctly entered in Supabase
3. **Actions not visible in Google dashboard**: Check that you are using distinct action names (`login`, `register`)

## Dependencies

- `@supabase/supabase-js`: Supabase client with CAPTCHA support

No additional npm packages are required; Google’s script is loaded directly.

## Future Enhancements

- Add reCAPTCHA checks to password reset or other sensitive flows
- Track successful vs failed scores for monitoring suspicious activity
- Consider adaptive flows based on the score returned by reCAPTCHA

