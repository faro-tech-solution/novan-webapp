import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getGroups, 
  getGroup, 
  getGroupWithDetails, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  addGroupMembers,
  removeGroupMembers,
  addGroupCourses,
  removeGroupCourses,
  getGroupStats
} from '@/services/groupService';
import { 
  Group, 
  CreateGroupData, 
  UpdateGroupData, 
  GroupWithDetails,
  GroupMemberAssignment,
  GroupCourseAssignment,
  GroupFilters,
  GroupStats
} from '@/types/group';
import { toast } from 'sonner';

// Query keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters: GroupFilters) => [...groupKeys.lists(), filters] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  stats: () => [...groupKeys.all, 'stats'] as const,
};

// Get all groups
export const useGroupsQuery = (filters?: GroupFilters) => {
  return useQuery({
    queryKey: groupKeys.list(filters || {}),
    queryFn: () => getGroups(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single group
export const useGroupQuery = (id: string) => {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => getGroup(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get group with details
export const useGroupWithDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: [...groupKeys.detail(id), 'details'],
    queryFn: () => getGroupWithDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get group statistics
export const useGroupStatsQuery = () => {
  return useQuery({
    queryKey: groupKeys.stats(),
    queryFn: getGroupStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create group mutation
export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('گروه با موفقیت ایجاد شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در ایجاد گروه: ${error.message}`);
    },
  });
};

// Update group mutation
export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupData }) => 
      updateGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
      toast.success('گروه با موفقیت بروزرسانی شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در بروزرسانی گروه: ${error.message}`);
    },
  });
};

// Delete group mutation
export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('گروه با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف گروه: ${error.message}`);
    },
  });
};

// Add group members mutation
export const useAddGroupMembersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGroupMembers,
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('اعضا با موفقیت به گروه اضافه شدند');
    },
    onError: (error: Error) => {
      toast.error(`خطا در اضافه کردن اعضا: ${error.message}`);
    },
  });
};

// Remove group members mutation
export const useRemoveGroupMembersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userIds }: { groupId: string; userIds: string[] }) => 
      removeGroupMembers(groupId, userIds),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('اعضا با موفقیت از گروه حذف شدند');
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف اعضا: ${error.message}`);
    },
  });
};

// Add group courses mutation
export const useAddGroupCoursesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGroupCourses,
    onSuccess: (_, { group_id }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('دوره‌ها با موفقیت به گروه اضافه شدند');
    },
    onError: (error: Error) => {
      toast.error(`خطا در اضافه کردن دوره‌ها: ${error.message}`);
    },
  });
};

// Remove group courses mutation
export const useRemoveGroupCoursesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, courseIds }: { groupId: string; courseIds: string[] }) => 
      removeGroupCourses(groupId, courseIds),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.stats() });
      toast.success('دوره‌ها با موفقیت از گروه حذف شدند');
    },
    onError: (error: Error) => {
      toast.error(`خطا در حذف دوره‌ها: ${error.message}`);
    },
  });
}; 