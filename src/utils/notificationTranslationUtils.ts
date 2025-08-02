import notificationTranslations from '@/translations/notificationTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

export const getNotificationTranslation = (key: string, language: 'en' | 'fa' = 'en') => {
  const translation = notificationTranslations[key];
  
  if (!translation) {
    console.warn(`Translation not found for notification key: ${key}`);
    return {
      title: key,
      description: key
    };
  }

  return {
    title: translation[language]?.title || translation.en.title,
    description: translation[language]?.description || translation.en.description
  };
};

export const useNotificationTranslation = () => {
  const { language } = useLanguage();
  
  return (key: string) => getNotificationTranslation(key, language);
};

// Helper function to get award-specific notification title
export const getAwardNotificationTitle = (awardCode: string, language: 'en' | 'fa' = 'en') => {
  const key = `new_award_achieved: ${awardCode}`;
  const translation = getNotificationTranslation(key, language);
  return translation.title;
};

// Helper function to get feedback notification title
export const getFeedbackNotificationTitle = (language: 'en' | 'fa' = 'en') => {
  const translation = getNotificationTranslation('new_feedback_received', language);
  return translation.title;
};

// Helper function to get congratulations message
export const getCongratulationsMessage = (language: 'en' | 'fa' = 'en') => {
  const translation = getNotificationTranslation('congratulations_earned_new_award', language);
  return translation.title;
}; 