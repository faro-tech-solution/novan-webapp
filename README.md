# Novan Webapp

A Next.js-based web application for course management and learning.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd novan-webapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_SPOTPLAYER_API_KEY`: Your SpotPlayer API key (optional)

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Building for Production

### Local Build
```bash
npm run build
# or
yarn build
```

### Netlify Deployment

This project is configured for Netlify deployment with server-side rendering support. To deploy:

1. **Connect to Netlify:**
   - Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
   - Connect your repository to Netlify
   - Netlify will automatically detect the Next.js configuration

2. **Environment Variables:**
   - In your Netlify dashboard, go to Site settings > Environment variables
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SPOTPLAYER_API_KEY` (if using SpotPlayer)

3. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

4. **Deploy:**
   - Netlify will automatically build and deploy your site
   - Each push to your main branch will trigger a new deployment
   - API routes will be handled by Netlify Functions

## Project Structure

- `app/` - Next.js 13+ app directory with pages and layouts
- `src/` - Source code including components, hooks, and utilities
- `components/` - Reusable React components
- `hooks/` - Custom React hooks
- `services/` - API and external service integrations
- `types/` - TypeScript type definitions
- `public/` - Static assets

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI
- React Query

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
