# Password Reset Fix Documentation

## Issue Description
The password reset email links were redirecting to `novan.app` (root domain) instead of `novan.app/portal/forget_password`, causing 404 errors.

## Root Cause
1. **Incorrect redirect URL in AuthContext**: The `resetPassword` function was using a relative path that wasn't being resolved correctly by Supabase.
2. **Supabase Site URL configuration**: The Supabase project's Site URL setting was likely not configured properly.
3. **Netlify redirect configuration**: The `public/_redirects` file was interfering with Next.js routing.

## Fixes Applied

### 1. Updated AuthContext (src/contexts/AuthContext.tsx)
- **Before**: Used relative path `/portal/forget_password`
- **After**: Uses full URL with environment variable fallback
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://novan.app');
const redirectUrl = `${siteUrl}/portal/forget_password`;
```

### 2. Enhanced ForgetPassword Component (src/components/pages/auth/ForgetPassword.tsx)
- Added fallback redirect logic for users landing on root domain
- Improved error handling and logging
- Fixed URL history replacement paths

### 3. Updated Root Page (app/page.tsx)
- Added automatic redirect logic for password reset links landing on root domain
- Detects access tokens in URL hash and redirects to correct path

### 4. Fixed Netlify Configuration (public/_redirects)
- **Before**: `/* /index.html 200`
- **After**: `/* /.netlify/functions/___netlify-handler 200`

### 5. Added Environment Variable Support
- Added `NEXT_PUBLIC_SITE_URL` to `env.example`
- Created setup script: `scripts/setup_env.sh`

## Required Configuration Steps

### 1. Set Environment Variables
Run the setup script:
```bash
./scripts/setup_env.sh
```

Or manually add to your `.env` file:
```env
NEXT_PUBLIC_SITE_URL=https://novan.app
```

### 2. Configure Supabase Project Settings
In your Supabase project dashboard:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to: `https://novan.app`
3. Add to **Redirect URLs**:
   - `https://novan.app/portal/forget_password`
   - `https://novan.app/portal/login`
   - `https://novan.app/`

### 3. Deploy Changes
After making these changes:
1. Commit and push your code
2. Deploy to your hosting platform (Netlify)
3. Test the password reset flow

## Testing the Fix

1. **Request Password Reset**:
   - Go to `/portal/forget_password`
   - Enter an email address
   - Submit the form

2. **Check Email**:
   - The reset link should now point to `https://novan.app/portal/forget_password`
   - Click the link in the email

3. **Verify Redirect**:
   - Should land on the password reset form
   - No 404 errors should occur
   - Password reset should work correctly

## Fallback Mechanism
If users still land on the root domain, the application will:
1. Detect the access token in the URL hash
2. Automatically redirect to `/portal/forget_password` with the token
3. Show the password reset form

## Files Modified
- `src/contexts/AuthContext.tsx`
- `src/components/pages/auth/ForgetPassword.tsx`
- `app/page.tsx`
- `public/_redirects`
- `env.example`
- `scripts/setup_env.sh` (new)

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`: The base URL of your application (default: https://novan.app)

This fix ensures that password reset emails redirect to the correct URL and provides fallback mechanisms for edge cases.
