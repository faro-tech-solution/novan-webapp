import { useLanguage } from '@/contexts/LanguageContext';

// Dictionary of translations
const translations = {
  // Common UI elements
  common: {
    portalName: {
      fa: 'پورتال آموزش فاروباکس',
      en: 'FaroBox Learning Portal'
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
    wikiManagement: {
      fa: 'مدیریت ویکی',
      en: 'Wiki Management'
    },
    profile: {
      fa: 'پروفایل',
      en: 'Profile'
    },
    progress: {
      fa: 'پیشرفت',
      en: 'Progress'
    },
    wiki: {
      fa: 'ویکی',
      en: 'Wiki'
    },
    userManagement: {
      fa: 'مدیریت کاربران',
      en: 'User Management'
    },
    groupManagement: {
      fa: 'مدیریت گروه‌ها',
      en: 'Group Management'
    },
    accounting: {
      fa: 'حسابداری',
      en: 'Accounting'
    },
    tasksManagement: {
      fa: 'مدیریت وظایف',
      en: 'Tasks Management'
    },
    myTasks: {
      fa: 'کارهای من',
      en: 'My Tasks'
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
    teammate: {
      fa: 'هم‌تیمی',
      en: 'Teammate'
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
    const translation = translations[section]?.[key];
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
