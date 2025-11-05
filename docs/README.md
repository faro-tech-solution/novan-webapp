# Novan Webapp

A modern Next.js-based learning management system built with TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based access control (Admin, Trainer, Trainee)
- **Course Management**: Create, manage, and enroll students in courses
- **Exercise System**: Multiple exercise types with submission tracking
- **Achievement System**: Gamified learning with points and awards
- **Notification System**: Real-time notifications for users
- **Accounting**: Financial transaction tracking
- **Multi-language Support**: Persian and English interface

### Exercise Types
- **Form-based**: Structured questionnaires with auto-grading
- **Video**: Video content with progress tracking
- **Audio**: Audio-based exercises
- **Simple**: Basic text-based exercises
- **Iframe**: Embedded content exercises

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI, Lucide React icons
- **Deployment**: Docker-based deployment to VPS

## 📋 Prerequisites

- Node.js 18 or higher
- Yarn package manager
- Supabase account and project

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd novan-webapp
sudo yarn install
```

### 2. Environment Setup

```bash
cp env.example .env.local
```

Configure your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Apply all migrations to set up your database schema:

```bash
sudo yarn migrate:sync
```

### 4. Development

```bash
sudo yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
novan-webapp/
├── app/                    # Next.js 13+ app directory
│   ├── portal/            # Main application routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── trainer/       # Trainer interface
│   │   ├── trainee/       # Student interface
│   │   └── auth/          # Authentication pages
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/            # Base UI components
│   │   ├── exercises/     # Exercise-related components
│   │   ├── courses/       # Course management
│   │   ├── dashboard/     # Dashboard components
│   │   └── auth/          # Authentication components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── contexts/          # React contexts
├── migrations/             # Database migrations
├── supabase/              # Supabase configuration
└── public/                # Static assets
```

## 🗄️ Database Schema

### Core Tables

- **`profiles`**: User profiles with comprehensive information
- **`courses`**: Course definitions and metadata
- **`course_terms`**: Course sessions and terms
- **`course_enrollments`**: Student course enrollments
- **`exercises`**: Exercise definitions and content
- **`exercise_submissions`**: Student exercise submissions
- **`awards`**: Achievement definitions
- **`student_awards`**: Student achievement tracking
- **`notifications`**: User notification system
- **`accounting`**: Financial transaction tracking

### Key Features

- **Row Level Security (RLS)**: Comprehensive security policies
- **Triggers**: Automated achievement checking and notifications
- **Functions**: Database functions for business logic
- **Indexes**: Optimized query performance

## 🚀 Deployment

### Docker Deployment (VPS)

The project is fully dockerized and can be deployed to any VPS (e.g., Hostinger) using Docker.

**Quick Start:**
```bash
# Build the image
docker build -t novan-webapp:latest .

# Run with docker-compose
docker-compose up -d

# Or run directly
docker run -d \
  --name novan-webapp \
  -p 3000:3000 \
  --env-file .env \
  novan-webapp:latest
```

**Automated Deployment:**
- Configure GitHub Actions secrets (see `docs/DOCKER_DEPLOYMENT.md`)
- Push to `main` branch for production deployment
- Push to `staging` branch for staging deployment (development mode)
- The workflow automatically builds and deploys to your VPS

**Environments:**
- **Production**: Deploys when merging to `main` branch (port 3000)
- **Staging**: Deploys when merging to `staging` branch (port 3001, development mode)

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md).
For staging/production workflow, see [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md).

## 📚 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn migrate:sync` - Apply database migrations
- `yarn migrate:create` - Create new migration
- `yarn migrate:list` - List available migrations

## 🔐 Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security (RLS) policies
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries

## 🌐 Internationalization

- **Languages**: Persian (Farsi) and English
- **RTL Support**: Full right-to-left language support
- **Localization**: Date formatting, number formatting
- **Translations**: Centralized translation management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For technical support or questions, please contact the development team.


