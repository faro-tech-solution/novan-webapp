# SpotPlayer API Key Setup

## Where to Set the SpotPlayer API Key

The SpotPlayer API key should be set in your environment variables. The application looks for the API key in the following order:

1. `NEXT_PUBLIC_SPOTPLAYER_API_KEY` (for client-side access)
2. `SPOTPLAYER_API_KEY` (for server-side access)

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in your project root (if it doesn't exist already) and add your SpotPlayer API key:

```bash
# SpotPlayer Configuration
NEXT_PUBLIC_SPOTPLAYER_API_KEY=your_spotplayer_api_key_here
SPOTPLAYER_API_KEY=your_spotplayer_api_key_here
```

### 2. Get Your SpotPlayer API Key

To obtain your SpotPlayer API key:

1. Log in to your SpotPlayer panel at https://panel.spotplayer.ir
2. Navigate to the API section
3. Generate a new API key or copy your existing one
4. Make sure the API key has the necessary permissions for:
   - Creating licenses
   - Managing course access
   - User authentication

### 3. Environment Variable Usage

The API key is used in the `SpotPlayerService` class:

```typescript
// src/services/spotPlayerService.ts
private static API_KEY = process.env.NEXT_PUBLIC_SPOTPLAYER_API_KEY || process.env.SPOTPLAYER_API_KEY;
```

### 4. Security Considerations

- **Never commit your API key to version control**
- The `.env.local` file is already in `.gitignore` to prevent accidental commits
- Use `NEXT_PUBLIC_` prefix only if you need client-side access (not recommended for API keys)
- For production, set the environment variables in your hosting platform (Vercel, Netlify, etc.)

### 5. Testing the Configuration

After setting up the API key, you can test it by:

1. Creating a SpotPlayer exercise
2. Attempting to view the exercise as a student
3. Checking the browser console for any API-related errors

### 6. Fallback Behavior

If the API key is not configured or the API call fails, the system will:

1. Show an error message: "SpotPlayer API key is not configured"
2. Use temporary license keys for testing purposes
3. Log stream access to the console instead of a database

## Current Implementation

The current implementation:

- ✅ Checks for API key configuration
- ✅ Makes API calls to SpotPlayer when key is available
- ✅ Provides fallback behavior when API is unavailable
- ✅ Logs stream access (currently to console)
- ❌ Does not persist licenses/cookies to database (tables not created yet)

## Next Steps

To complete the SpotPlayer integration, you may want to:

1. Create the SpotPlayer database tables (`spotplayer_cookies`, `spotplayer_licenses`, `spotplayer_stream_logs`)
2. Update the database types to include these tables
3. Implement proper license and cookie persistence
4. Add proper error handling and retry logic 