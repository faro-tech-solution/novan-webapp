export function getDashboardPathForRole(role: string): string {
  switch (role) {
    case 'trainer':
      return '/trainer/dashboard';
    case 'trainee':
      return '/trainee/all-courses';  
    case 'admin':
      return '/admin/dashboard';
    case 'teammate':
      return '/teammate/dashboard';
    default:
      return '/';
  }
} 