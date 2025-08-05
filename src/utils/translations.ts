import { useLanguage } from '@/contexts/LanguageContext';

// Dictionary of translations
const translations = {
  // Common UI elements
  common: {
    portalName: {
      fa: 'نووان وب‌اپ',
      en: 'Novan WebApp'
    },
    home: {
      fa: 'خانه',
      en: 'Home'
    },
    courses: {
      fa: 'دوره‌ها',
      en: 'Courses'
    },
    students: {
      fa: 'دانشجویان',
      en: 'Students'
    },
    instructors: {
      fa: 'مربیان',
      en: 'Instructors'
    },
    dashboard: {
      fa: 'داشبورد',
      en: 'Dashboard'
    },
    login: {
      fa: 'ورود',
      en: 'Login'
    },
    register: {
      fa: 'ثبت نام',
      en: 'Register'
    },
    user: {
      fa: 'کاربر',
      en: 'User'
    },
    logout: {
      fa: 'خروج',
      en: 'Logout'
    }
  },
  // Sidebar menu items
  sidebar: {
    dashboard: {
      fa: 'داشبورد',
      en: 'Dashboard'
    },
    exercises: {
      fa: 'تمرین‌ها',
      en: 'Exercises'
    },
    myExercises: {
      fa: 'تمرین‌های من',
      en: 'My Exercises'
    },
    courseManagement: {
      fa: 'درس‌ها',
      en: 'Courses'
    },
    myCourses: {
      fa: 'دوره‌های من',
      en: 'My Courses'
    },
    reviewSubmissions: {
      fa: 'بررسی تمرین‌ها',
      en: 'Review Submissions'
    },
    students: {
      fa: 'دانشجویان',
      en: 'Students'
    },
    profile: {
      fa: 'پروفایل',
      en: 'Profile'
    },
    progress: {
      fa: 'پیشرفت',
      en: 'Progress'
    },
    userManagement: {
      fa: 'مدیریت کاربران',
      en: 'User Management'
    },
    accounting: {
      fa: 'حسابداری',
      en: 'Accounting'
    },
    // User roles
    trainer: {
      fa: 'مربی',
      en: 'Trainer'
    },
    trainee: {
      fa: 'دانشجو',
      en: 'Student'
    },
    admin: {
      fa: 'مدیر',
      en: 'Admin'
    },
    user: {
      fa: 'کاربر',
      en: 'User'
    }
  }
};

export type TranslationKey = keyof typeof translations.common;

/**
 * Hook for translating text based on current language
 */
export function useTranslation() {
  const { language } = useLanguage();
  
  // Function to translate a specific key
  const t = (section: keyof typeof translations, key: string) => {
    const translation = (translations[section] as any)?.[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${section}.${key}`);
      return key;
    }
    return translation[language] || key;
  };
  
  return {
    t,
    // Shortcuts for different sections
    tCommon: (key: string) => t('common', key),
    tSidebar: (key: string) => t('sidebar', key)
  };
}
