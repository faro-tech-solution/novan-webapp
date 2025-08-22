
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormRenderer } from './forms/FormRenderer';
import { ExerciseForm } from '@/types/formBuilder';

interface InstructorFormViewProps {
  formStructure: ExerciseForm;
}

export const InstructorFormView = ({ formStructure }: InstructorFormViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ساختار فرم تمرین</CardTitle>
        <CardDescription>
          نمایش سوالات تعریف شده برای این تمرین
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormRenderer
          form={formStructure}
          answers={[]}
          onChange={() => {}}
          disabled={true}
        />
      </CardContent>
    </Card>
  );
};
