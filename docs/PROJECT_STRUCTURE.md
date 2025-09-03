# Project Structure Documentation

## 🏗️ Overview

This document provides a comprehensive overview of the Novan Webapp project structure, explaining the organization of files, directories, and the reasoning behind the current architecture.

## 📁 Root Directory Structure

```
novan-webapp/
├── app/                    # Next.js 13+ App Router
├── src/                    # Source code
├── migrations/             # Database migrations
├── supabase/              # Supabase configuration
├── public/                # Static assets
├── docs/                  # Project documentation
├── scripts/               # Utility scripts
├── .husky/                # Git hooks
├── .cursor/               # Cursor IDE configuration
├── .git/                  # Git repository
├── node_modules/          # Dependencies
├── .next/                 # Next.js build output
├── package.json           # Project configuration
├── yarn.lock              # Yarn lock file
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
├── netlify.toml           # Netlify deployment configuration
└── env.example            # Environment variables template
```

## 🚀 App Directory (Next.js 13+)

### Structure
```
app/
├── layout.tsx             # Root layout component
├── page.tsx               # Home page
├── loading.tsx            # Loading component
├── error.tsx              # Error boundary
├── not-found.tsx          # 404 page
└── portal/                # Main application routes
    ├── admin/             # Admin dashboard
    ├── trainer/           # Trainer interface
    ├── trainee/           # Student interface
    ├── instructors/       # Instructor management
    ├── login/             # Authentication
    ├── register/          # User registration
    └── forget_password/   # Password recovery
```

### Purpose
- **App Router**: Modern Next.js routing system
- **Layout System**: Consistent UI across pages
- **Error Handling**: Graceful error boundaries
- **Loading States**: Better user experience

## 🔧 Source Code Directory

### Structure
```
src/
├── components/            # React components
├── hooks/                 # Custom React hooks
├── services/              # API and external services
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── contexts/              # React contexts
├── translations/          # Internationalization
├── lib/                   # Library configurations
├── _legacy/               # Legacy code (deprecated)
├── App.css                # Legacy CSS (deprecated)
└── index.css              # Global styles
```

### Components Organization

#### UI Components (`src/components/ui/`)
Base components built with Radix UI primitives:
- `Button` - Various button variants
- `Input` - Form input components
- `Dialog` - Modal dialogs
- `Select` - Dropdown selectors
- `Table` - Data table components
- `Form` - Form components with validation
- `Card` - Content containers
- `Badge` - Status indicators
- `Avatar` - User profile images
- `Tooltip` - Information tooltips

#### Feature Components
Organized by business domain:

**Exercises** (`src/components/exercises/`)
- Exercise creation and editing
- Exercise submission and grading
- Exercise reordering and management
- Exercise type-specific components

**Courses** (`src/components/courses/`)
- Course creation and management
- Course enrollment system
- Course content organization
- Course analytics and reporting

**Dashboard** (`src/components/dashboard/`)
- Role-specific dashboards
- Progress tracking
- Performance metrics
- Quick actions and shortcuts

**Authentication** (`src/components/auth/`)
- Login and registration forms
- Password management
- User profile management
- Role-based access control

**Students** (`src/components/students/`)
- Student management
- Enrollment tracking
- Progress monitoring
- Performance analytics

**Management** (`src/components/management/`)
- Admin tools and utilities
- System configuration
- User management
- System monitoring

**Notifications** (`src/components/notification/`)
- Notification display
- Notification management
- Real-time updates
- User preferences

**Awards** (`src/components/awards/`)
- Achievement system
- Badge display
- Points tracking
- Leaderboards

**Accounting** (`src/components/accounting/`)
- Financial transactions
- Payment processing
- Balance management
- Financial reporting

**Terms** (`src/components/terms/`)
- Course term management
- Session scheduling
- Enrollment periods
- Academic calendar

**Dialogs** (`src/components/dialogs/`)
- Modal components
- Confirmation dialogs
- Form dialogs
- Information displays

**Layout** (`src/components/layout/`)
- Navigation components
- Sidebar components
- Header components
- Footer components

**Pages** (`src/components/pages/`)
- Page-specific components
- Complex page layouts
- Page-level state management

### Hooks (`src/hooks/`)
Custom React hooks for common functionality:
- `useAuth` - Authentication state management
- `useSupabase` - Supabase client management
- `useLocalStorage` - Local storage utilities
- `useDebounce` - Debounced input handling
- `useMediaQuery` - Responsive design utilities

### Services (`src/services/`)
External service integrations and API calls:
- `supabase` - Database and authentication
- `api` - Custom API endpoints
- `storage` - File storage management
- `notifications` - Push notification service

### Types (`src/types/`)
TypeScript type definitions:
- Database table types
- API response types
- Component prop types
- Utility types

### Utils (`src/utils/`)
Utility functions and helpers:
- Date formatting utilities
- String manipulation
- Validation helpers
- Common calculations

### Contexts (`src/contexts/`)
React context providers:
- `AuthContext` - Authentication state
- `ThemeContext` - Theme management
- `LanguageContext` - Internationalization

### Translations (`src/translations/`)
Multi-language support:
- Persian (Farsi) translations
- English translations
- RTL layout support
- Cultural adaptations

## 🗄️ Database Migrations

### Structure
```
migrations/
├── functions/             # Database functions
├── rls/                   # Row Level Security policies
├── triggers/              # Database triggers
├── database_schema.md     # Schema documentation
├── *.sql                  # Migration files
└── README.md              # Migration guide
```

### Migration Files
- **User Management**: Profile updates, role changes
- **Exercise System**: Table structure, constraints
- **Course Management**: Enrollment system, terms
- **Achievement System**: Awards and points
- **Security**: RLS policies, functions
- **Performance**: Indexes, optimizations

## ☁️ Supabase Configuration

### Structure
```
supabase/
├── config.toml            # Supabase configuration
├── seed.sql               # Database seed data
├── migrations/            # Supabase migrations
└── .branches/             # Branch management
```

### Purpose
- **Database Configuration**: Connection settings
- **Seed Data**: Initial data population
- **Migration Management**: Version control
- **Environment Management**: Multiple environments

## 📁 Public Assets

### Structure
```
public/
├── images/                # Image assets
├── icons/                 # Icon files
├── fonts/                 # Custom fonts
├── videos/                # Video content
└── documents/             # Document files
```

### Asset Types
- **Images**: UI graphics, logos, illustrations
- **Icons**: System icons, status indicators
- **Fonts**: Custom typography
- **Videos**: Tutorial content, demonstrations
- **Documents**: PDFs, guides, templates

## 🛠️ Scripts and Utilities

### Structure
```
scripts/
├── *.sh                   # Shell scripts
├── *.js                   # Node.js scripts
├── *.sql                  # Database scripts
└── README.md              # Script documentation
```

### Script Categories
- **Database**: Migration, backup, restore
- **Build**: Build optimization, analysis
- **Deployment**: Environment setup, deployment
- **Maintenance**: Cleanup, optimization

## 🔧 Configuration Files

### Package Management
- **package.json**: Project dependencies and scripts
- **yarn.lock**: Dependency lock file
- **bun.lockb**: Alternative package manager

### Build Configuration
- **tsconfig.json**: TypeScript configuration
- **next.config.js**: Next.js configuration
- **tailwind.config.ts**: Tailwind CSS configuration
- **postcss.config.js**: PostCSS configuration

### Code Quality
- **eslint.config.js**: ESLint configuration
- **.eslintrc.json**: Legacy ESLint configuration
- **.prettierrc.json**: Prettier configuration
- **.prettierignore**: Prettier ignore patterns

### Git Configuration
- **.gitignore**: Git ignore patterns
- **.husky/**: Git hooks configuration
- **.git/**: Git repository data

## 📚 Documentation

### Structure
```
docs/
├── README.md              # Documentation index
├── PROJECT_OVERVIEW.md    # Project overview
├── DATABASE_SCHEMA.md     # Database documentation
├── DEVELOPMENT_GUIDE.md   # Development guide
├── DEPLOYMENT_GUIDE.md    # Deployment guide
├── API_DOCUMENTATION.md   # API reference
├── PROJECT_STRUCTURE.md   # This document
└── archive/               # Archived documentation
```

### Purpose
- **Onboarding**: New developer setup
- **Reference**: API and database documentation
- **Guidelines**: Development and deployment practices
- **Architecture**: System design and structure

## 🎯 Architecture Principles

### 1. Separation of Concerns
- **Components**: UI and business logic separation
- **Services**: External API integration
- **Hooks**: Reusable logic extraction
- **Types**: Type safety and documentation

### 2. Modularity
- **Feature-based Organization**: Components grouped by domain
- **Reusable Components**: Shared UI components
- **Service Layer**: Centralized external interactions
- **Utility Functions**: Common helper functions

### 3. Scalability
- **Component Composition**: Flexible component architecture
- **State Management**: Context-based state sharing
- **Performance**: Code splitting and optimization
- **Database**: Efficient querying and indexing

### 4. Maintainability
- **TypeScript**: Type safety and documentation
- **Consistent Patterns**: Standardized coding practices
- **Documentation**: Comprehensive project documentation
- **Testing**: Component and integration testing

## 🔄 Development Workflow

### 1. Feature Development
- Create feature branch
- Implement components and logic
- Add tests and documentation
- Submit pull request

### 2. Code Organization
- Follow established patterns
- Use appropriate directories
- Maintain consistent naming
- Document complex logic

### 3. Database Changes
- Create migration files
- Update schema documentation
- Test migrations locally
- Apply to staging/production

### 4. Documentation Updates
- Keep documentation current
- Add examples for new features
- Update architecture diagrams
- Maintain API documentation

## 🚀 Future Considerations

### Planned Improvements
- **Component Library**: Comprehensive UI component documentation
- **Testing Strategy**: Enhanced testing coverage
- **Performance Monitoring**: Real-time performance tracking
- **API Versioning**: Backward compatibility management

### Scalability Enhancements
- **Microservices**: Modular backend architecture
- **Caching Layer**: Advanced caching strategies
- **CDN Integration**: Global content delivery
- **Database Optimization**: Advanced query optimization

This project structure documentation provides a comprehensive understanding of how the Novan Webapp is organized and maintained. Follow these guidelines to ensure consistent development practices and maintainable code.

