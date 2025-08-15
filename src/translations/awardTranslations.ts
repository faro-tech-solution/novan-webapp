/**
 * Awards Translation System
 * Contains translations for award names and descriptions in different languages
 */

export type AwardCode = 
  | 'first_submission'
  | 'perfect_score' 
  | 'high_achiever'
  | 'academic_excellence'
  | 'top_student'
  | 'early_bird'
  | 'on_time'
  | 'streak_master'
  | 'monthly_warrior'
  | 'never_give_up'
  | 'fast_learner'
  | 'speed_demon'
  | 'exercise_enthusiast'
  | 'century_club'
  | 'night_owl'
  | 'weekend_warrior'
  | 'active_learner'
  | 'challenge_taker'
  | 'course_explorer'
  | 'course_completer'
  | 'holiday_champion'
  | 'platinum_researcher'
  | 'helpful_student'
  | 'progress_tracker'
  | 'silver_researcher'
  | 'comeback_kid'
  | 'bronze_researcher'
  | 'hundred_club'
  | 'diamond_researcher'
  | 'top_achiever'
  | 'golden_researcher';

export interface AwardTranslation {
  name: string;
  description: string;
}

export interface AwardTranslations {
  [key: string]: {
    [languageCode: string]: AwardTranslation;
  };
}

const awardTranslations: AwardTranslations = {
  'first_submission': {
    'en': {
      name: 'First Submission',
      description: 'Complete your first exercise',
    },
    'fa': {
      name: 'تولد یک کدنویس',
      description: '🎉 اولین قدم در دنیای برنامه‌نویسی! شما اولین تمرین خود را تکمیل کردید',
    }
  },
  'perfect_score': {
    'en': {
      name: 'Perfect Score',
      description: 'Get 100% on any exercise',
    },
    'fa': {
      name: 'استاد کامل',
      description: '🏆 نمره کامل! شما در یکی از تمرین‌ها نمره ۱۰۰ گرفتید',
    }
  },
  'high_achiever': {
    'en': {
      name: 'High Achiever',
      description: 'Get 90%+ on 5 exercises',
    },
    'fa': {
      name: 'نابغه برنامه‌نویسی',
      description: '⭐ شما در ۵ تمرین نمره ۹۰ یا بالاتر کسب کردید',
    }
  },
  'academic_excellence': {
    'en': {
      name: 'Academic Excellence',
      description: 'Get 95%+ average across 10 exercises',
    },
    'fa': {
      name: 'برتری علمی',
      description: '🎓 میانگین نمرات شما در ۱۰ تمرین بیش از ۹۵٪ است',
    }
  },
  'top_student': {
    'en': {
      name: 'Top Student',
      description: 'Rank #1 in class for a month',
    },
    'fa': {
      name: 'دانشجوی برتر',
      description: '🏅 شما به مدت یک ماه رتبه اول کلاس را کسب کردید',
    }
  },
  'early_bird': {
    'en': {
      name: 'Early Bird',
      description: 'Submit 5 exercises before the due date',
    },
    'fa': {
      name: 'تکمیل‌کننده زودهنگام',
      description: '⏰ شما ۵ تمرین را قبل از موعد مقرر تحویل دادید',
    }
  },
  'on_time': {
    'en': {
      name: 'On Time',
      description: 'Submit 10 exercises by their due date',
    },
    'fa': {
      name: 'سرباز وقت‌شناس',
      description: '📅 شما ۱۰ تمرین را در موعد مقرر تحویل دادید',
    }
  },
  'streak_master': {
    'en': {
      name: 'Streak Master',
      description: 'Submit exercises 7 days in a row',
    },
    'fa': {
      name: 'قهرمان هفت روزه',
      description: '🔥 شما ۷ روز متوالی تمرین تحویل دادید',
    }
  },
  'monthly_warrior': {
    'en': {
      name: 'Monthly Warrior',
      description: 'Complete all exercises in a month',
    },
    'fa': {
      name: 'جنگجوی ماهانه',
      description: '💪 شما تمام تمرین‌های یک ماه را تکمیل کردید',
    }
  },

  'fast_learner': {
    'en': {
      name: 'Fast Learner',
      description: 'Complete 3 exercises in one day',
    },
    'fa': {
      name: 'یادگیر سریع',
      description: '⚡ شما ۳ تمرین را در یک روز تکمیل کردید',
    }
  },
  'speed_demon': {
    'en': {
      name: 'Speed Demon',
      description: 'Complete an exercise in less than the estimated time',
    },
    'fa': {
      name: 'شیطان سرعت',
      description: '💨 شما تمرینی را در کمتر از زمان تخمینی تکمیل کردید',
    }
  },
  'exercise_enthusiast': {
    'en': {
      name: 'Exercise Enthusiast',
      description: 'Complete 25 exercises',
    },
    'fa': {
      name: 'علاقه‌مند تمرین',
      description: '💻 شما ۲۵ تمرین را تکمیل کردید',
    }
  },
  'century_club': {
    'en': {
      name: 'Century Club',
      description: 'Complete 100 exercises',
    },
    'fa': {
      name: 'باشگاه صدتایی‌ها',
      description: '🏆 شما ۱۰۰ تمرین را تکمیل کردید',
    }
  },
  'night_owl': {
    'en': {
      name: 'Night Owl',
      description: 'Submit an exercise between 10pm and 6am',
    },
    'fa': {
      name: 'جغد شب',
      description: '🦉 شما تمرینی را بین ساعت ۱۰ شب تا ۶ صبح تحویل دادید',
    }
  },
  'weekend_warrior': {
    'en': {
      name: 'Weekend Warrior',
      description: 'Submit an exercise on a weekend',
    },
    'fa': {
      name: 'جنگجوی آخر هفته',
      description: '📆 شما در آخر هفته تمرینی را تحویل دادید',
    }
  },
  'active_learner': {
    'en': {
      name: 'Active Learner',
      description: 'Complete exercises for 14 consecutive days',
    },
    'fa': {
      name: 'یادگیر فعال',
      description: '📚 شما 14 روز متوالی به یادگیری و تمرین پرداخته‌اید',
    }
  },
  'challenge_taker': {
    'en': {
      name: 'Challenge Taker',
      description: 'Complete 3 difficult exercises',
    },
    'fa': {
      name: 'پذیرنده چالش',
      description: '🏋️ شما 3 تمرین سخت را با موفقیت تکمیل کردید',
    }
  },
  'course_explorer': {
    'en': {
      name: 'Course Explorer',
      description: 'Enroll in 3 different courses',
    },
    'fa': {
      name: 'کاشف دوره‌ها',
      description: '🧭 شما در 3 دوره مختلف ثبت‌نام کرده‌اید',
    }
  },
  'course_completer': {
    'en': {
      name: 'Course Completer',
      description: 'Finish all exercises in a course',
    },
    'fa': {
      name: 'تکمیل‌کننده دوره',
      description: '🎯 شما تمامی تمرین‌های یک دوره را تکمیل کردید',
    }
  },
  'holiday_champion': {
    'en': {
      name: 'Holiday Champion',
      description: 'Submit an exercise on a public holiday',
    },
    'fa': {
      name: 'قهرمان تعطیلات',
      description: '🎊 شما در یک روز تعطیل رسمی تمرین انجام دادید',
    }
  },
  'platinum_researcher': {
    'en': {
      name: 'Platinum Researcher',
      description: 'Visit the reference library 100 times',
    },
    'fa': {
      name: 'محقق پلاتینی',
      description: '📚 شما 100 بار از کتابخانه مرجع بازدید کرده‌اید',
    }
  },
  'helpful_student': {
    'en': {
      name: 'Helpful Student',
      description: 'Answer 10 questions in the forums',
    },
    'fa': {
      name: 'دانشجوی مفید',
      description: '💬 شما به 10 سوال در انجمن‌ها پاسخ داده‌اید',
    }
  },
  'progress_tracker': {
    'en': {
      name: 'Progress Tracker',
      description: 'Check your progress page 10 times',
    },
    'fa': {
      name: 'ردیاب پیشرفت',
      description: '📊 شما 10 بار صفحه پیشرفت خود را بررسی کرده‌اید',
    }
  },
  'silver_researcher': {
    'en': {
      name: 'Silver Researcher',
      description: 'Visit the reference library 50 times',
    },
    'fa': {
      name: 'محقق نقره‌ای',
      description: '📚 شما 50 بار از کتابخانه مرجع بازدید کرده‌اید',
    }
  },
  'comeback_kid': {
    'en': {
      name: 'Comeback Kid',
      description: 'Return after 30 days of inactivity',
    },
    'fa': {
      name: 'بچه بازگشت',
      description: '🔄 شما پس از 30 روز عدم فعالیت بازگشته‌اید',
    }
  },
  'bronze_researcher': {
    'en': {
      name: 'Bronze Researcher',
      description: 'Visit the reference library 25 times',
    },
    'fa': {
      name: 'محقق برنزی',
      description: '📚 شما 25 بار از کتابخانه مرجع بازدید کرده‌اید',
    }
  },
  'hundred_club': {
    'en': {
      name: 'Hundred Club',
      description: 'Join a course with 100+ enrolled students',
    },
    'fa': {
      name: 'باشگاه صد نفره',
      description: '👥 شما در دوره‌ای با بیش از 100 دانشجو ثبت‌نام کرده‌اید',
    }
  },
  'diamond_researcher': {
    'en': {
      name: 'Diamond Researcher',
      description: 'Visit the reference library 200 times',
    },
    'fa': {
      name: 'محقق الماسی',
      description: '📚 شما 200 بار از کتابخانه مرجع بازدید کرده‌اید',
    }
  },
  'top_achiever': {
    'en': {
      name: 'Top Achiever',
      description: 'Reach the top position in the course leaderboard',
    },
    'fa': {
      name: 'قهرمان پیشرفت',
      description: '🏅 شما به مقام اول در جدول امتیازات دوره رسیدید',
    }
  },
  'golden_researcher': {
    'en': {
      name: 'Golden Researcher',
      description: 'Visit the reference library 75 times',
    },
    'fa': {
      name: 'محقق طلایی',
      description: '📚 شما 75 بار از کتابخانه مرجع بازدید کرده‌اید',
    }
  }
};

/**
 * Get award translation based on award code and language
 * @param code The unique code of the award
 * @param lang The language code (defaults to 'en')
 * @returns The translated name and description, or fallback to English if not available
 */
export const getAwardTranslation = (
  code: AwardCode, 
  lang: string = 'en'
): AwardTranslation => {
  // Get the translations for this award
  const awardData = awardTranslations[code];
  
  if (!awardData) {
    console.warn(`No translations found for award code: ${code}`);
    return { name: code, description: '' };
  }
  
  // Use the requested language or fall back to English
  const translation = awardData[lang] || awardData['en'];
  
  if (!translation) {
    console.warn(`No translation found for award ${code} in language ${lang}`);
    return { name: code, description: '' };
  }
  
  return translation;
};

export default awardTranslations;
