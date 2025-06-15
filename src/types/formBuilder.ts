
export interface FormQuestion {
  id: string;
  type: 'textbox' | 'dropdown' | 'checkbox' | 'radio' | 'input';
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // For dropdown, checkbox, radio
  placeholder?: string; // For textbox, input
}

export interface ExerciseForm {
  questions: FormQuestion[];
}

export interface FormAnswer {
  questionId: string;
  answer: string | string[]; // string[] for checkboxes
}

export interface ExerciseSubmission {
  answers: FormAnswer[];
}
