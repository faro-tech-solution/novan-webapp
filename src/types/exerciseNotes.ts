export interface ExerciseNote {
    id: string;
    exercise_id: string | null; // Allow null for global notes
    course_id: string;
    user_id: string;
    title: string; // Required title for each note
    content: string;
    created_at: string;
    updated_at: string;
    exercises?: {
      id: string;
      title: string;
      order_index?: number;
    };
    courses?: {
      id: string;
      title: string;
    };
  }
  
  export interface CreateNoteData {
    exercise_id?: string; // Make optional for global notes
    course_id: string;
    title: string; // Required title
    content: string;
  }
  
  export interface UpdateNoteData {
    title?: string; // Optional for updates
    content: string;
  }