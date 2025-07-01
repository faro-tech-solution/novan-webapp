import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wikiService } from '@/services/wikiService';
import { useAuth } from '@/contexts/AuthContext';
import type {
  WikiCategory,
  WikiTopic,
  WikiArticle,
  CreateWikiCategoryData,
  CreateWikiTopicData,
  CreateWikiArticleData,
  UpdateWikiCategoryData,
  UpdateWikiTopicData,
  UpdateWikiArticleData
} from '@/types/wiki';

// Query keys
export const wikiKeys = {
  all: ['wiki'] as const,
  categories: () => [...wikiKeys.all, 'categories'] as const,
  category: (id: string) => [...wikiKeys.all, 'category', id] as const,
  article: (id: string) => [...wikiKeys.all, 'article', id] as const,
};

// Get all categories with access control
export const useWikiCategoriesQuery = () => {
  const { user, profile } = useAuth();
  
  return useQuery({
    queryKey: wikiKeys.categories(),
    queryFn: () => wikiService.getCategories(user?.id || '', profile?.role || ''),
    enabled: !!user?.id && !!profile,
  });
};

// Get category with topics and articles
export const useWikiCategoryQuery = (categoryId: string) => {
  return useQuery({
    queryKey: wikiKeys.category(categoryId),
    queryFn: () => wikiService.getCategoryWithContent(categoryId),
    enabled: !!categoryId,
  });
};

// Get single article
export const useWikiArticleQuery = (articleId: string) => {
  return useQuery({
    queryKey: wikiKeys.article(articleId),
    queryFn: () => wikiService.getArticle(articleId),
    enabled: !!articleId,
  });
};

// Mutations for admins
export const useCreateWikiCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWikiCategoryData) => wikiService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.categories() });
    },
  });
};

export const useUpdateWikiCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWikiCategoryData }) =>
      wikiService.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.categories() });
      queryClient.invalidateQueries({ queryKey: wikiKeys.category(id) });
    },
  });
};

export const useDeleteWikiCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wikiService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.categories() });
    },
  });
};

export const useCreateWikiTopicMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWikiTopicData) => wikiService.createTopic(data),
    onSuccess: (_, { category_id }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.category(category_id) });
    },
  });
};

export const useUpdateWikiTopicMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWikiTopicData }) =>
      wikiService.updateTopic(id, data),
    onSuccess: (topic) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.category(topic.category_id) });
    },
  });
};

export const useDeleteWikiTopicMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wikiService.deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all });
    },
  });
};

// Mutations for trainers and admins
export const useCreateWikiArticleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWikiArticleData) => wikiService.createArticle(data),
    onSuccess: (_, { topic_id }) => {
      // Invalidate all category queries since we don't know which category this topic belongs to
      queryClient.invalidateQueries({ queryKey: wikiKeys.categories() });
    },
  });
};

export const useUpdateWikiArticleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWikiArticleData }) =>
      wikiService.updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all });
    },
  });
};

export const useDeleteWikiArticleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => wikiService.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all });
    },
  });
}; 