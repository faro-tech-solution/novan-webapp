export function getDashboardPathForRole(role: string): string {
  switch (role) {
    case 'trainer':
      return '/portal/trainer/dashboard';
    case 'trainee':
      return '/portal/trainee/all-courses';  
    case 'admin':
      return '/portal/admin/dashboard';
    case 'teammate':
      return '/portal/teammate/dashboard';
    default:
      return '/portal/login';
  }
} 

// Export Q&A helper functions
export * from './qa-helpers'; 