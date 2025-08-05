export type NotificationTranslations = {
  [key: string]: {
    en: {
      title: string;
      description?: string;
    };
    fa: {
      title: string;
      description?: string;
    };
  };
};

const notificationTranslations: NotificationTranslations = {
  'new_feedback_received': {
    'en': {
      title: 'New Feedback Received',
    },
    'fa': {
      title: 'بازخورد جدید دریافت شد',
    }
  },
  'first_submission': {
    'en': {
      title: 'First Submission',
    },
    'fa': {
      title: 'اولین ارسال',
    }
  },
  'feedback_received': {
    'en': {
      title: 'Feedback Received',
    },
    'fa': {
      title: 'بازخورد دریافت شد',
    }
  },
  'new_award_achieved: perfect_score': {
    'en': {
      title: 'New Award Achieved: Perfect Score',
    },
    'fa': {
      title: 'جایزه جدید کسب شد: استاد کامل',
    }
  },
  'new_award_achieved: exercise_enthusiast': {
    'en': {
      title: 'New Award Achieved: Exercise Enthusiast',
    },
    'fa': {
      title: 'جایزه جدید کسب شد: علاقه‌مند به تمرین',
    }
  },
  'new_award_achieved: century_club': {
    'en': {
      title: 'New Award Achieved: Century Club',
    },
    'fa': {
      title: 'جایزه جدید کسب شد: باشگاه صدتایی',
    }
  },
  'congratulations_earned_new_award': {
    'en': {
      title: 'Congratulations! You have earned a new award.',
    },
    'fa': {
      title: 'تبریک! شما یک جایزه جدید کسب کردید.',
    }
  },
  'loading_notifications': {
    'en': { title: 'Loading notifications...' },
    'fa': { title: 'در حال بارگذاری اعلان‌ها...' }
  },
  'notifications_title': {
    'en': { title: 'Notifications' },
    'fa': { title: 'اعلان‌ها' }
  },
  'notifications_subtitle': {
    'en': { title: 'All your recent notifications' },
    'fa': { title: 'همه اعلان‌های اخیر شما' }
  },
  'no_notifications': {
    'en': { title: 'No notifications available' },
    'fa': { title: 'اعلانی وجود ندارد' }
  },
  'view_all_notifications': {
    'en': { title: 'View all notifications' },
    'fa': { title: 'مشاهده همه اعلان‌ها' }
  },
};

export default notificationTranslations; 