-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS course_enrollments CASCADE;

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  term_id UUID REFERENCES course_terms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_term_id ON course_enrollments(term_id);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Add RLS policies
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments" 
  ON course_enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can manage all enrollments" 
  ON course_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow teachers to view enrollments for their courses
CREATE POLICY "Teachers can view enrollments for their courses" 
  ON course_enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM teacher_course_assignments 
      WHERE teacher_id = auth.uid() AND course_id = course_enrollments.course_id
    )
  );

-- Allow students to view their own enrollments
CREATE POLICY "Students can view their own enrollments" 
  ON course_enrollments FOR SELECT 
  USING (auth.uid() = student_id); 