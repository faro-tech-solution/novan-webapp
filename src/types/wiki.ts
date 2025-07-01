export interface WikiCategory {
  id: string;
  title: string;
  description: string | null;
  access_type: 'all_students' | 'course_specific';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  course_access?: {
    id: string;
    course_id: string;
    course: {
      id: string;
      name: string;
    };
  }[];
}

export interface WikiTopic {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  articles?: WikiArticle[];
}

export interface WikiArticle {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface WikiCategoryCourseAccess {
  id: string;
  category_id: string;
  course_id: string;
  created_at: string;
  course?: {
    id: string;
    name: string;
  };
}

export interface WikiCategoryWithTopics extends WikiCategory {
  topics: (WikiTopic & { articles: WikiArticle[] })[];
}

export interface CreateWikiCategoryData {
  title: string;
  description?: string;
  access_type: 'all_students' | 'course_specific';
  course_ids?: string[];
}

export interface CreateWikiTopicData {
  category_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

export interface CreateWikiArticleData {
  topic_id: string;
  title: string;
  content: string;
  order_index?: number;
  is_published?: boolean;
}

export interface UpdateWikiCategoryData {
  title?: string;
  description?: string;
  access_type?: 'all_students' | 'course_specific';
  course_ids?: string[];
}

export interface UpdateWikiTopicData {
  title?: string;
  description?: string;
  order_index?: number;
}

export interface UpdateWikiArticleData {
  title?: string;
  content?: string;
  order_index?: number;
  is_published?: boolean;
} 