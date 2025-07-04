# Course Enrollment Price Accounting Integration

## Problem Description

When adding a student to a course in "مدیریت دانشجویان دوره", the price field was displayed but wasn't properly integrated with the accounting system. The current issue is that:

1. The database has a trigger (`handle_course_enrollment_payment`) that automatically creates a negative accounting record using the course price
2. When entering a custom price in "قیمت دوره" in the UI, we were creating a separate positive record
3. This led to confusion and incorrect accounting balances

## Solution

We're simplifying the approach by:

1. Removing the database trigger completely
2. Handling all accounting logic in the application code
3. Using the value entered in "قیمت دوره" directly as the negative amount in accounting records

## Step 1: Apply the Database Migration

Run the SQL migration script to drop the existing trigger and function:

```sql
-- Migration: Fix Course Enrollment Accounting Integration
-- Date: 2025-07-02

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_course_enrollment_payment ON course_enrollments;

-- Drop the existing function
DROP FUNCTION IF EXISTS handle_course_enrollment_payment();

-- Drop the existing function
DROP FUNCTION IF EXISTS handle_course_enrollment_payment();

-- Create updated function to handle course enrollment payment
CREATE OR REPLACE FUNCTION handle_course_enrollment_payment()
RETURNS TRIGGER AS $$
DECLARE
    course_price DECIMAL;
    course_name TEXT;
BEGIN
    -- Get the course price and name
    SELECT price, name INTO course_price, course_name
    FROM courses
    WHERE id = NEW.course_id;

    -- Only create accounting record if course has a price
    IF v_course_price IS NOT NULL AND v_course_price > 0 THEN
        INSERT INTO accounting (
            user_id,
            course_id,
            amount,
            payment_type,
            payment_status,
            description
        ) VALUES (
            NEW.student_id,
            NEW.course_id,
            v_course_price,
            'buy_course',
            'waiting',
            'ثبت نام در دوره ' || COALESCE(v_course_name, NEW.course_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the course_enrollments table
DROP TRIGGER IF EXISTS create_accounting_record_on_enrollment ON course_enrollments;
CREATE TRIGGER create_accounting_record_on_enrollment
AFTER INSERT ON course_enrollments
FOR EACH ROW
EXECUTE FUNCTION create_course_enrollment_accounting_record();
```

You can run this script in the Supabase SQL Editor.

## Step 2: Update the Application Code

Update the `handleEnroll` function in the `CourseStudentsDialog.tsx` file to create an accounting record when a student is enrolled:

```typescript
// Create enrollment without price field - we'll handle pricing in accounting
const enrollmentData = {
  course_id: courseId,
  student_id: studentData.id,
  status: "active",
  enrolled_at: now,
  term_id: selectedTermId === "general" ? null : selectedTermId,
  created_at: now,
  updated_at: now,
};

const { error: enrollError } = await supabase
  .from("course_enrollments")
  .insert([enrollmentData]);

if (enrollError) {
  console.error("Enrollment error:", enrollError);
  throw enrollError;
}

// Create accounting record for the course enrollment if price is set
if (coursePrice > 0) {
  // Create accounting record for the course fee
  const accountingData = {
    user_id: studentData.id,
    course_id: courseId,
    amount: coursePrice, // Use the price from the course
    payment_type: "buy_course" as const,
    payment_status: "waiting" as const, // Set initial status to waiting
    description: `ثبت نام در دوره ${courseName || courseId}`,
  };

  const { error: accountingError } = await supabase
    .from("accounting")
    .insert([accountingData]);

  if (accountingError) {
    console.error("Accounting error:", accountingError);
    // Don't throw error here, just log it and continue
  }
}
```

## Step 3: Update the fetchCoursePrice function

Make sure the `fetchCoursePrice` function retrieves both the price and course name:

```typescript
const fetchCoursePrice = async () => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("price, name")
      .eq("id", courseId)
      .single();

    if (error) throw error;
    setCoursePrice(data.price || 0);
    setCourseName(data.name || "");
  } catch (error: any) {
    console.error("Error fetching course price:", error);
  }
};
```

## Step 4: Displaying Course Price from Accounting Records

When displaying student enrollments, fetch the price from the accounting records:

```typescript
// Function to fetch a student's enrollment price from accounting records
const fetchStudentEnrollmentPrice = async (
  courseId: string,
  studentId: string
) => {
  try {
    const { data, error } = await supabase
      .from("accounting")
      .select("amount")
      .eq("course_id", courseId)
      .eq("user_id", studentId)
      .eq("payment_type", "buy_course")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.amount || 0;
  } catch (error) {
    console.error("Error fetching enrollment price:", error);
    return 0;
  }
};
```

Then use this function when rendering the enrollment list:

```tsx
// In your component, maintain a state for enrollment prices
const [enrollmentPrices, setEnrollmentPrices] = useState<
  Record<string, number>
>({});

// Fetch prices for all enrollments
useEffect(() => {
  const fetchPrices = async () => {
    const prices: Record<string, number> = {};

    for (const enrollment of enrollments) {
      const price = await fetchStudentEnrollmentPrice(
        enrollment.course_id,
        enrollment.student_id
      );
      prices[enrollment.id] = price;
    }

    setEnrollmentPrices(prices);
  };

  if (enrollments.length > 0) {
    fetchPrices();
  }
}, [enrollments]);

// Then in your render code:
<div className="text-sm font-medium mt-1 text-teal-600">
  قیمت دوره:{" "}
  {enrollmentPrices[enrollment.id]
    ? `${enrollmentPrices[enrollment.id].toLocaleString()} تومان`
    : "رایگان"}
</div>;
```

## Testing the Implementation

1. Run the SQL migration in the Supabase SQL Editor
2. Restart your development server to ensure the changes take effect
3. Navigate to the course management page
4. Add a student to a course with a non-zero price
5. Verify that an accounting record is created with the correct price
6. Check that the course price is displayed correctly in the enrollment list

## Benefits of This Approach

1. **Better Financial Management**: By storing course enrollment payments in the accounting system, we have a centralized record of all financial transactions.

2. **Historical Record**: Even if a course's price changes over time, we maintain the historical record of what each student paid.

3. **Payment Status Tracking**: The accounting system can track payment status (pending, completed, refunded, etc.) independently of the enrollment status.

4. **Flexible Pricing**: Special pricing, discounts, and payment plans can be managed through the accounting system without affecting the enrollment records.
5. Verify that the price is displayed correctly in the enrollment list
6. Check the database to confirm the price was saved correctly

## Notes

- If you encounter any TypeScript errors about the price field not existing, you may need to update your Supabase type definitions
- This fix assumes the price is stored as a numeric value in the database
- The solution removes any automatic price setting triggers that might be overriding the manual price
