# Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Yarn package manager
- Git
- Code editor (VS Code recommended)
- Supabase account

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd novan-webapp
   ```

2. **Install dependencies**
   ```bash
   sudo yarn install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env.local
   ```
   
   Configure your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup**
   ```bash
   sudo yarn migrate:sync
   ```

5. **Start development server**
   ```bash
   sudo yarn dev
   ```

## 🏗️ Project Structure

### Directory Organization

```
novan-webapp/
├── app/                    # Next.js App Router
│   ├── portal/            # Main application routes
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── trainer/       # Trainer interface pages
│   │   ├── trainee/       # Student interface pages
│   │   ├── login/         # Authentication pages
│   │   └── register/      # Registration pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/            # Base UI components (Radix UI)
│   │   ├── exercises/     # Exercise-related components
│   │   ├── courses/       # Course management components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── auth/          # Authentication components
│   │   ├── students/      # Student management components
│   │   ├── management/    # Admin management components
│   │   ├── notification/  # Notification components
│   │   ├── awards/        # Achievement system components
│   │   ├── accounting/    # Financial management components
│   │   ├── terms/         # Course terms components
│   │   ├── dialogs/       # Modal and dialog components
│   │   ├── layout/        # Layout components
│   │   └── pages/         # Page-specific components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── contexts/          # React contexts
│   ├── translations/      # Internationalization
│   └── lib/               # Library configurations
├── migrations/             # Database migrations
├── supabase/              # Supabase configuration
├── public/                # Static assets
└── docs/                  # Documentation
```

### Component Architecture

#### UI Components (`src/components/ui/`)
Base components built with Radix UI primitives and styled with Tailwind CSS:
- `Button` - Various button variants
- `Input` - Form input components
- `Dialog` - Modal dialogs
- `Select` - Dropdown selectors
- `Table` - Data table components
- `Form` - Form components with validation

#### Feature Components
Organized by feature domain:
- **Exercises**: Exercise creation, editing, submission, and grading
- **Courses**: Course management, enrollment, and term management
- **Dashboard**: Role-specific dashboards for different user types
- **Authentication**: Login, registration, and password management

## 🎨 Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes for styling
- Follow mobile-first responsive design
- Maintain consistent spacing using Tailwind's spacing scale
- Use semantic color names from the design system

### Component Styling
```tsx
// Good: Using Tailwind utilities with consistent spacing
<div className="p-4 space-y-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>

// Avoid: Inline styles or inconsistent spacing
<div style={{ padding: '16px', marginBottom: '20px' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</h2>
</div>
```

### Design System
- **Colors**: Use semantic color tokens
- **Typography**: Consistent font sizes and weights
- **Spacing**: 4px grid system (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Shadows**: Consistent elevation system

## 🔧 Development Workflow

### Code Quality Standards

#### TypeScript
- Use strict TypeScript configuration
- Define proper types for all props and state
- Avoid `any` type - use proper typing
- Use interfaces for object shapes, types for unions

```tsx
// Good: Proper TypeScript typing
interface ExerciseProps {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onEdit?: (id: string) => void;
}

// Avoid: Using any or missing types
const Exercise = (props: any) => {
  // ...
}
```

#### ESLint and Prettier
- ESLint enforces code quality rules
- Prettier maintains consistent formatting
- Pre-commit hooks run automatically
- Fix issues before committing

### Git Workflow

#### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

#### Commit Messages
- Use conventional commit format
- Be descriptive and concise
- Reference issue numbers when applicable

```bash
# Good commit messages
feat: add exercise reordering functionality
fix: resolve course enrollment validation issue
refactor: simplify authentication component logic

# Avoid
fixed stuff
updated code
wip
```

### Testing Strategy

#### Component Testing
- Test component rendering and interactions
- Mock external dependencies
- Test error states and edge cases
- Maintain good test coverage

#### Integration Testing
- Test API endpoints and data flow
- Test user workflows and scenarios
- Test authentication and authorization
- Test form validation and submission

## 🗄️ Database Development

### Migration Management

#### Creating Migrations
```bash
sudo yarn migrate:create migration_name
```

#### Migration Best Practices
- One change per migration
- Use descriptive migration names
- Test migrations on development database
- Include rollback scripts for complex changes
- Document schema changes

#### Database Functions
- Use PostgreSQL functions for complex logic
- Implement proper error handling
- Use transactions for multi-step operations
- Optimize queries with proper indexing

### Row Level Security (RLS)

#### Policy Implementation
- Enable RLS on all tables
- Implement role-based access control
- Test policies thoroughly
- Document access patterns

```sql
-- Example RLS policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## 🌐 Internationalization

### Translation Management
- Use translation keys for all user-facing text
- Support Persian (Farsi) and English
- Implement RTL layout support
- Use proper date and number formatting

### Translation Structure
```tsx
// Good: Using translation keys
import { useTranslation } from '@/hooks/useTranslation';

const Component = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t('exercises.title')}</h1>
  );
};

// Avoid: Hardcoded text
const Component = () => {
  return (
    <h1>Exercises</h1>
  );
};
```

## 🔐 Security Best Practices

### Authentication
- Use Supabase Auth for user management
- Implement proper session handling
- Validate user permissions on all endpoints
- Use secure password policies

### Data Validation
- Validate all user inputs with Zod
- Sanitize data before database operations
- Implement proper error handling
- Log security-related events

### API Security
- Use HTTPS for all communications
- Implement rate limiting
- Validate request headers and parameters
- Use proper CORS configuration

## 📱 Responsive Design

### Mobile-First Approach
- Design for mobile devices first
- Use responsive breakpoints consistently
- Test on various screen sizes
- Ensure touch-friendly interactions

### Breakpoint Strategy
```css
/* Mobile first approach */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }
}
```

## 🚀 Performance Optimization

### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components
- Optimize bundle size

### Image Optimization
- Use Next.js Image component
- Implement proper image formats
- Use responsive images
- Optimize image loading

### Caching Strategy
- Implement React Query caching
- Use browser caching for static assets
- Implement service worker for offline support
- Optimize database queries

## 🐛 Debugging and Troubleshooting

### Development Tools
- React Developer Tools
- Next.js debugging
- Database query logging
- Network request monitoring

### Common Issues
- **Build Errors**: Check TypeScript types and dependencies
- **Runtime Errors**: Check browser console and server logs
- **Database Issues**: Verify migrations and connection
- **Performance Issues**: Use React Profiler and network analysis

### Logging
- Implement structured logging
- Log errors with context
- Use different log levels
- Monitor application health

## 📚 Resources and References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)

### Tools and Libraries
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Zod Documentation](https://zod.dev)
- [ESLint Rules](https://eslint.org/docs/rules)

### Best Practices
- [React Best Practices](https://react.dev/learn)
- [Next.js Best Practices](https://nextjs.org/docs/advanced-features)
- [Database Design Best Practices](https://www.postgresql.org/docs/current)
- [Security Best Practices](https://owasp.org/www-project-top-ten)

This development guide provides comprehensive information for developers working on the Novan Webapp project. Follow these guidelines to maintain code quality, security, and performance standards.


