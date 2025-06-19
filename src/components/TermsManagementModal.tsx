import { Button } from '@/components/ui/button';
import CourseTermsManagement from './CourseTermsManagement';
import { Course } from '@/types/course';

interface TermsManagementModalProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  userRole?: string;
}

const TermsManagementModal = ({ open, onClose, course, userRole }: TermsManagementModalProps) => {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {userRole === 'admin' ? 'مدیریت ترم‌های' : 'ترم‌های'} {course.name}
            </h2>
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              بستن
            </Button>
          </div>
          <CourseTermsManagement 
            courseId={course.id}
            courseName={course.name}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
};

export default TermsManagementModal;
