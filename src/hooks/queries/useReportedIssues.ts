import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReportedIssue, ReportedIssueWithUser, CreateIssueData, UpdateIssueData } from '@/types/reportedIssue';

export const useReportedIssues = (status?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: issues = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reportedIssues', profile?.id, profile?.role, status],
    queryFn: async () => {
      if (!profile) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('reported_issues')
        .select('*')
        .order('created_at', { ascending: false });

      // If admin, get all issues; if regular user, only their own
      if (profile.role !== 'admin') {
        query = query.eq('user_id', profile.id);
      }

      // Filter by status if provided
      if (status) {
        query = query.eq('status', status as 'open' | 'in_progress' | 'resolved' | 'closed');
      }

      const { data: issues, error } = await query;

      if (error) {
        throw error;
      }

      if (!issues || issues.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(issues.map(issue => issue.user_id))];

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      // Create a map for quick lookup
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Map issues with user data
      return issues.map((issue) => {
        const userProfile = profileMap.get(issue.user_id);
        return {
          ...issue,
          user: userProfile ? {
            id: userProfile.id,
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            email: userProfile.email || '',
          } : null,
          profiles: userProfile ? {
            id: userProfile.id,
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            email: userProfile.email || '',
          } : null,
        } as ReportedIssueWithUser;
      });
    },
    enabled: !!profile,
  });

  const createIssueMutation = useMutation({
    mutationFn: async (issueData: CreateIssueData) => {
      if (!profile) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('reported_issues')
        .insert({
          user_id: profile.id,
          title: issueData.title,
          description: issueData.description,
        })
        .select()
        .single();

      if (error) throw error;

      return data as ReportedIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportedIssues'] });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, updates }: { issueId: string; updates: UpdateIssueData }) => {
      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const { data, error } = await supabase
        .from('reported_issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;

      return data as ReportedIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportedIssues'] });
    },
  });

  return {
    issues,
    isLoading,
    error,
    refetch,
    createIssue: createIssueMutation.mutateAsync,
    updateIssue: updateIssueMutation.mutateAsync,
    isCreating: createIssueMutation.isPending,
    isUpdating: updateIssueMutation.isPending,
  };
};

export const useReportedIssueStats = () => {
  const { profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['reportedIssuesStats', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'admin') {
        return null;
      }

      const { data, error } = await supabase
        .from('reported_issues')
        .select('status');

      if (error) throw error;

      const total = data?.length || 0;
      const open = data?.filter(i => i.status === 'open').length || 0;
      const inProgress = data?.filter(i => i.status === 'in_progress').length || 0;
      const resolved = data?.filter(i => i.status === 'resolved').length || 0;
      const closed = data?.filter(i => i.status === 'closed').length || 0;

      return {
        total,
        open,
        inProgress,
        resolved,
        closed,
      };
    },
    enabled: !!profile && profile.role === 'admin',
  });

  return stats;
};
