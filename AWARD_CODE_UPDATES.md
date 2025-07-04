# Award Code Standardization

This document outlines the recent updates to award codes in the system, converting Persian award codes to standard English codes.

## What Was Changed

Several award codes were previously in Persian (e.g., `یادگیر_فعال`, `جغد_شب`). 
These have been standardized to use English codes that are consistent with the translation system.

## Complete List of English Award Codes

Here is the complete list of award codes now used in the system:

| English Code | Persian Name |
|--------------|--------------|
| first_submission | تولد یک کدنویس |
| perfect_score | استاد کامل |
| high_achiever | نابغه برنامه‌نویسی |
| academic_excellence | برتری علمی |
| top_student | دانشجوی برتر |
| early_bird | تکمیل‌کننده زودهنگام |
| on_time | سرباز وقت‌شناس |
| streak_master | قهرمان هفت روزه |
| monthly_warrior | جنگجوی ماهانه |
| never_give_up | هرگز تسلیم نشو |
| fast_learner | یادگیر سریع |
| speed_demon | شیطان سرعت |
| exercise_enthusiast | علاقه‌مند تمرین |
| century_club | باشگاه صدتایی‌ها |
| night_owl | جغد شب |
| weekend_warrior | جنگجوی آخر هفته |
| active_learner | یادگیر فعال |
| challenge_taker | پذیرنده چالش |
| course_explorer | کاشف دوره‌ها |
| course_completer | تکمیل‌کننده دوره |
| holiday_champion | قهرمان تعطیلات |
| platinum_researcher | محقق پلاتینی |
| helpful_student | دانشجوی مفید |
| progress_tracker | ردیاب پیشرفت |
| silver_researcher | محقق نقره‌ای |
| comeback_kid | بچه بازگشت |
| bronze_researcher | محقق برنزی |
| hundred_club | باشگاه صد نفره |
| diamond_researcher | محقق الماسی |
| top_achiever | قهرمان پیشرفت |
| golden_researcher | محقق طلایی |

## Migration Details

1. Updated `awardTranslations.ts` to include all award codes and their translations
2. Updated `add_award_codes.sql` to map Persian names to standardized English codes
3. Fixed `AchievementsDisplay.tsx` to use the translation system

## How to Use Award Codes

When referring to awards, always use the English code and the translation system:

```typescript
import { useAwardTranslation } from '@/utils/awardTranslationUtils';

// In your component
const { translateAward } = useAwardTranslation();

// Then use like this:
const translation = translateAward('active_learner');
// Returns { name: 'یادگیر فعال', description: '...' } in Persian mode
// Returns { name: 'Active Learner', description: '...' } in English mode
```
