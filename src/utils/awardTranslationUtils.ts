import { useLanguage } from '../contexts/LanguageContext';
import { getAwardTranslation, AwardCode } from '../translations/awardTranslations';

/**
 * Custom hook to translate awards based on the current language context
 */
export const useAwardTranslation = () => {
  const { language } = useLanguage();

  /**
   * Translates an award based on its code and the current language
   * @param awardCode The code of the award to translate
   */
  const translateAward = (awardCode: AwardCode) => {
    return getAwardTranslation(awardCode, language);
  };

  return {
    translateAward
  };
};

/**
 * Type definition for an award with translation
 */
export interface Award {
  id: string;
  code: AwardCode;
  icon: string;
  points_value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  name?: string;       // Will be populated from translations
  description?: string; // Will be populated from translations
}

/**
 * Utility function to enrich award data with translations
 * @param award The award object from the database
 * @param language The language to use for translation
 * @returns Award object with translated name and description
 */
export const enrichAwardWithTranslation = (
  award: Omit<Award, 'name' | 'description'>, 
  language: string = 'en'
): Award => {
  const translation = getAwardTranslation(award.code, language);
  
  return {
    ...award,
    name: translation.name,
    description: translation.description
  };
};
