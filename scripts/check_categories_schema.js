const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking exercise_categories table structure...');

    // Check if the table exists and get its structure
    const { data: categories, error } = await supabase
      .from('exercise_categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing exercise_categories table:', error.message);
      return;
    }

    console.log('✅ exercise_categories table exists and is accessible');

    // Try to get table info by attempting to insert a test record
    const testCategory = {
      name: 'Test Category',
      description: 'Test description',
      course_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      order_index: 0,
      is_active: true
    };

    const { error: insertError } = await supabase
      .from('exercise_categories')
      .insert(testCategory);

    if (insertError) {
      console.log('Table structure error:', insertError.message);
      
      // Check if created_by is required
      if (insertError.message.includes('created_by')) {
        console.log('created_by field is required');
        
        // Try with a dummy created_by
        const testCategoryWithCreatedBy = {
          ...testCategory,
          created_by: '00000000-0000-0000-0000-000000000000'
        };

        const { error: insertError2 } = await supabase
          .from('exercise_categories')
          .insert(testCategoryWithCreatedBy);

        if (insertError2) {
          console.log('Still error with created_by:', insertError2.message);
        } else {
          console.log('✅ created_by field is required but can be a dummy UUID');
        }
      }
    } else {
      console.log('✅ Table structure is valid');
    }

    // Check existing categories
    const { data: existingCategories, error: fetchError } = await supabase
      .from('exercise_categories')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('Error fetching existing categories:', fetchError.message);
    } else {
      console.log(`\nExisting categories: ${existingCategories.length}`);
      existingCategories.forEach(category => {
        console.log(`- ${category.name} (Course: ${category.course_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

checkSchema(); 