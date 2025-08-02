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
  'new_award_achieved: first_submission': {
    'en': {
      title: 'New Award Achieved: First Submission',
    },
    'fa': {
      title: 'جایزه جدید کسب شد: تولد یک کدنویس',
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
};

export default notificationTranslations; 