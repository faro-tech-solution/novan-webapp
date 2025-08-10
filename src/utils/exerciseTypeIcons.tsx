import { 
  Video, 
  Volume2, 
  FileText, 
  FormInput,
  Monitor,
  PlayCircle
} from 'lucide-react';
import { ExerciseType } from '@/types/exercise';

/**
 * Returns the appropriate icon component for an exercise type
 */
export const getExerciseTypeIcon = (exerciseType: ExerciseType) => {
  switch (exerciseType) {
    case 'video':
      return <Video className="h-4 w-4 text-blue-500" />;
    case 'audio':
      return <Volume2 className="h-4 w-4 text-green-500" />;
    case 'arvan_video':
      return <PlayCircle className="h-4 w-4 text-purple-500" />;
    case 'iframe':
      return <Monitor className="h-4 w-4 text-orange-500" />;
    case 'form':
      return <FormInput className="h-4 w-4 text-teal-500" />;
    case 'simple':
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

/**
 * Returns the appropriate icon component with smaller size for table/compact views
 */
export const getExerciseTypeIconSmall = (exerciseType: ExerciseType) => {
  switch (exerciseType) {
    case 'video':
      return <Video className="h-3 w-3 text-blue-500" />;
    case 'audio':
      return <Volume2 className="h-3 w-3 text-green-500" />;
    case 'arvan_video':
      return <PlayCircle className="h-3 w-3 text-purple-500" />;
    case 'iframe':
      return <Monitor className="h-3 w-3 text-orange-500" />;
    case 'form':
      return <FormInput className="h-3 w-3 text-teal-500" />;
    case 'simple':
    default:
      return <FileText className="h-3 w-3 text-gray-500" />;
  }
};

/**
 * Returns a text description of the exercise type for accessibility
 */
export const getExerciseTypeLabel = (exerciseType: ExerciseType): string => {
  switch (exerciseType) {
    case 'video':
      return 'ویدیو';
    case 'audio':
      return 'صوتی';
    case 'arvan_video':
      return 'ویدیو آروان';
    case 'iframe':
      return 'صفحه وب';
    case 'form':
      return 'فرم';
    case 'simple':
    default:
      return 'متنی';
  }
};
