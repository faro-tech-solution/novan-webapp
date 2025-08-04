# Pages Directory Structure

This document describes the reorganized structure of the `src/pages` directory.

## Directory Structure

```
src/pages/
├── auth/                   # Authentication related pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgetPassword.tsx
│   └── index.ts
├── dashboard/              # Dashboard pages for different user roles
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── TraineeDashboard.tsx
│   ├── TrainerDashboard.tsx
│   └── index.ts
├── exercises/              # Exercise management and interaction pages
│   ├── Exercises.tsx
│   ├── ExerciseDetail.tsx
│   ├── MyExercises.tsx
│   ├── ReviewSubmissions.tsx
│   └── index.ts
├── courses/               # Course management and student course pages
│   ├── Courses.tsx
│   ├── StudentCourses.tsx
│   ├── CourseManagement.tsx
│   └── index.ts
├── management/            # Administrative management pages
│   ├── UserManagement.tsx
│   └── index.ts

├── users/                 # User-related pages
│   ├── Students.tsx
│   ├── Instructors.tsx
│   ├── Profile.tsx
│   ├── Progress.tsx
│   └── index.ts
├── accounting/            # Financial management pages
│   ├── Accounting.tsx
│   └── index.ts
├── shared/                # Shared/utility pages
│   ├── NotFound.tsx
│   └── index.ts
└── index.ts              # Main exports for all pages
```

## Benefits of This Structure

1. **Better Organization**: Related pages are grouped together logically
2. **Easier Navigation**: Developers can quickly find relevant pages
3. **Scalability**: Easy to add new pages to the appropriate category
4. **Clean Imports**: Use the main index.ts file for importing all pages
5. **Maintainability**: Changes to page structure are isolated to relevant directories

## How to Import

### Option 1: Import from main index (Recommended)

```typescript
import { Login, Register, AdminDashboard, Exercises } from "@/pages";
```

### Option 2: Import from specific directory

```typescript
import { Login, Register } from "@/pages/auth";
import { AdminDashboard, TrainerDashboard } from "@/pages/dashboard";
```

### Option 3: Import individual files

```typescript
import Login from "@/pages/auth/Login";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
```

## Adding New Pages

When adding new pages:

1. Place them in the appropriate directory based on their functionality
2. Update the corresponding directory's `index.ts` file
3. The main `pages/index.ts` will automatically export the new page

## Migration Notes

- All existing imports in `App.tsx` have been updated to use the new structure
- The build process has been tested and works correctly
- No breaking changes to the application functionality
