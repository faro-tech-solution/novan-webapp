import { supabase } from '@/integrations/supabase/client';
import type {
  WikiCategory,
  WikiTopic,
  WikiArticle,
  WikiCategoryWithTopics,
  CreateWikiCategoryData,
  CreateWikiTopicData,
  CreateWikiArticleData,
  UpdateWikiCategoryData,
  UpdateWikiTopicData,
  UpdateWikiArticleData
} from '@/types/wiki';

export const wikiService = {
  // Get all categories with access control
  async getCategories(userId: string, userRole: string): Promise<WikiCategory[] | any[]> {
    console.log('getCategories called with:', { userId, userRole });
    
    const { data, error } = await supabase
      .from('wiki_categories')
      .select(`
        *,
        course_access:wiki_category_course_access(
          id,
          course_id,
          course:courses(id, name)
        )
      `)
      .order('title');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    console.log('Raw categories data:', data);
    
    // Debug course access data
    if (data) {
      data.forEach((category: any) => {
        console.log(`Category: ${category.title}`);
        console.log('Course access:', category.course_access);
        if (category.course_access) {
          category.course_access.forEach((access: any) => {
            console.log('Access entry:', access);
            console.log('Course data:', access.course);
          });
        }
      });
    }

    // Filter based on user access
    const categories = data || [];
    if (userRole === 'admin' || userRole === 'trainer') {
      console.log('Admin/Trainer access - returning all categories:', categories.length);
      return categories;
    }

    // For trainees, filter based on access
    const accessibleCategories = await Promise.all(
      categories.map(async (category: any) => {
        console.log('Checking category:', category.title, 'access_type:', category.access_type);
        
        if (category.access_type === 'all_students') {
          console.log('Category accessible to all students:', category.title);
          return category;
        }
        
        if (category.access_type === 'course_specific') {
          // Check if user is enrolled in any of the courses with access
          if (category.course_access && category.course_access.length > 0) {
            const courseIds = category.course_access.map((access: any) => access.course_id);
            console.log('Course-specific category, checking enrollments for courses:', courseIds);
            
            const { data: enrollments } = await supabase
              .from('course_enrollments')
              .select('course_id')
              .eq('student_id', userId)
              .eq('status', 'active')
              .in('course_id', courseIds);
            
            console.log('User enrollments:', enrollments);
            
            if (enrollments && enrollments.length > 0) {
              console.log('User has access to category:', category.title);
              return category;
            }
          }
          console.log('User has no access to category:', category.title);
          return null; // No access
        }
        
        console.log('Unknown access type for category:', category.title);
        return null; // No access
      })
    );

    const filteredCategories = accessibleCategories.filter(Boolean) as WikiCategory[] | any[];
    console.log('Final accessible categories:', filteredCategories.length);
    return filteredCategories;
  },

  // Get category with topics and articles
  async getCategoryWithContent(categoryId: string): Promise<WikiCategoryWithTopics | null | any> {
    const { data, error } = await supabase
      .from('wiki_categories')
      .select(`
        *,
        topics:wiki_topics(
          id,
          title,
          description,
          order_index,
          created_at,
          updated_at,
          created_by,
          articles:wiki_articles(
            id,
            title,
            content,
            order_index,
            is_published,
            created_at,
            updated_at,
            created_by
          )
        )
      `)
      .eq('id', categoryId)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Get author information for articles
    const articlesWithAuthors = await Promise.all(
      (data.topics || []).map(async (topic) => {
        const articlesWithAuthors = await Promise.all(
          (topic.articles || []).map(async (article: any) => {
            if (article.created_by) {
              const { data: authorData } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .eq('id', article.created_by)
                .single();
              
              return {
                ...article,
                author: authorData ? {
                  id: authorData.id,
                  first_name: authorData.first_name,
                  last_name: authorData.last_name
                } : undefined
              };
            }
            return article;
          })
        );
        
        return {
          ...topic,
          articles: articlesWithAuthors
        };
      })
    );

    // Sort topics and articles by order_index
    const sortedData = {
      ...data,
      topics: articlesWithAuthors.sort((a, b) => a.order_index - b.order_index).map(topic => ({
        ...topic,
        articles: topic.articles.sort((a, b) => a.order_index - b.order_index)
      }))
    };

    return sortedData;
  },

  // Get single article
  async getArticle(articleId: string): Promise<WikiArticle | null | any> {
    const { data, error } = await supabase
      .from('wiki_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Get author information
    let author = undefined;
    if (data.created_by) {
      const { data: authorData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', data.created_by)
        .single();
      
      if (authorData) {
        author = {
          id: authorData.id,
          first_name: authorData.first_name,
          last_name: authorData.last_name
        };
      }
    }

    return {
      ...data,
      author
    };
  },

  // Create category (admin only)
  async createCategory(categoryData: CreateWikiCategoryData): Promise<WikiCategory> {
    const { data, error } = await supabase
      .from('wiki_categories')
      .insert([{
        title: categoryData.title,
        description: categoryData.description,
        access_type: categoryData.access_type,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;

    // If course-specific, add course access
    if (categoryData.access_type === 'course_specific' && categoryData.course_ids) {
      await this.addCategoryCourseAccess(data.id, categoryData.course_ids);
    }

    return data;
  },

  // Create topic (admin only)
  async createTopic(topicData: CreateWikiTopicData): Promise<WikiTopic> {
    const { data, error } = await supabase
      .from('wiki_topics')
      .insert([{
        category_id: topicData.category_id,
        title: topicData.title,
        description: topicData.description,
        order_index: topicData.order_index || 0,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create article (trainer/admin)
  async createArticle(articleData: CreateWikiArticleData): Promise<WikiArticle> {
    const { data, error } = await supabase
      .from('wiki_articles')
      .insert([{
        topic_id: articleData.topic_id,
        title: articleData.title,
        content: articleData.content,
        order_index: articleData.order_index || 0,
        is_published: articleData.is_published !== false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category (admin only)
  async updateCategory(categoryId: string, updateData: UpdateWikiCategoryData): Promise<WikiCategory> {
    const { data, error } = await supabase
      .from('wiki_categories')
      .update({
        title: updateData.title,
        description: updateData.description,
        access_type: updateData.access_type
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    // Update course access if needed
    if (updateData.access_type === 'course_specific' && updateData.course_ids) {
      await this.updateCategoryCourseAccess(categoryId, updateData.course_ids);
    }

    return data;
  },

  // Update topic (admin only)
  async updateTopic(topicId: string, updateData: UpdateWikiTopicData): Promise<WikiTopic> {
    const { data, error } = await supabase
      .from('wiki_topics')
      .update({
        title: updateData.title,
        description: updateData.description,
        order_index: updateData.order_index
      })
      .eq('id', topicId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update article (trainer/admin)
  async updateArticle(articleId: string, updateData: UpdateWikiArticleData): Promise<WikiArticle> {
    const { data, error } = await supabase
      .from('wiki_articles')
      .update({
        title: updateData.title,
        content: updateData.content,
        order_index: updateData.order_index,
        is_published: updateData.is_published
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete category (admin only)
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },

  // Delete topic (admin only)
  async deleteTopic(topicId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_topics')
      .delete()
      .eq('id', topicId);

    if (error) throw error;
  },

  // Delete article (trainer/admin)
  async deleteArticle(articleId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
  },

  // Helper function to add course access to category
  async addCategoryCourseAccess(categoryId: string, courseIds: string[]): Promise<void> {
    const accessRecords = courseIds.map(courseId => ({
      category_id: categoryId,
      course_id: courseId
    }));

    const { error } = await supabase
      .from('wiki_category_course_access' as any)
      .insert(accessRecords);

    if (error) throw error;
  },

  // Helper function to update course access for category
  async updateCategoryCourseAccess(categoryId: string, courseIds: string[]): Promise<void> {
    // First remove existing access
    await supabase
      .from('wiki_category_course_access' as any)
      .delete()
      .eq('category_id', categoryId);

    // Then add new access
    if (courseIds.length > 0) {
      await this.addCategoryCourseAccess(categoryId, courseIds);
    }
  },

  // Check if user has access to category
  async checkCategoryAccess(categoryId: string, userId: string): Promise<boolean  | any> {
    const { data: category, error } = await supabase
      .from('wiki_categories')
      .select('access_type')
      .eq('id', categoryId)
      .single();

    if (error) throw error;

    if (category.access_type === 'all_students') {
      return true;
    }

    if (category.access_type === 'course_specific') {
      // Check if user is enrolled in any course with access
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', userId)
        .eq('status', 'active');

      if (!enrollments || enrollments.length === 0) {
        return false;
      }

      const userCourseIds = enrollments.map(e => e.course_id);
      
      const { data: access } = await supabase
        .from('wiki_category_course_access' as any)
        .select('course_id')
        .eq('category_id', categoryId)
        .in('course_id', userCourseIds);

      return access && access.length > 0;
    }

    return false;
  }
}; 