import { supabase } from '@/integrations/supabase/client';
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

// Get all groups with optional filters
export const getGroups = async (filters?: GroupFilters): Promise<Group[] | any[]> => {
  let query = supabase
    .from('groups')
    .select(`
      *,
      member_count:group_members(count),
      course_count:group_courses(count)
    `)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching groups: ${error.message}`);
  }

  return data || [];
};

// Get a single group by ID
export const getGroup = async (id: string): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching group: ${error.message}`);
  }

  return data;
};

// Get group with details (members and courses)
export const getGroupWithDetails = async (id: string): Promise<GroupWithDetails | any> => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      members:group_members(
        *,
        user:profiles(id, first_name, last_name, email, role)
      ),
      courses:group_courses(
        *,
        course:courses(id, name, description)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching group details: ${error.message}`);
  }

  return data;
};

// Create a new group
export const createGroup = async (groupData: CreateGroupData): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .insert([groupData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating group: ${error.message}`);
  }

  return data;
};

// Update a group
export const updateGroup = async (id: string, groupData: UpdateGroupData): Promise<Group> => {
  const { data, error } = await supabase
    .from('groups')
    .update(groupData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating group: ${error.message}`);
  }

  return data;
};

// Delete a group
export const deleteGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting group: ${error.message}`);
  }
};

// Add members to a group
export const addGroupMembers = async (assignment: GroupMemberAssignment): Promise<void> => {
  const memberData = assignment.user_ids.map(user_id => ({
    group_id: assignment.group_id,
    user_id
  }));

  const { error } = await supabase
    .from('group_members')
    .insert(memberData);

  if (error) {
    throw new Error(`Error adding group members: ${error.message}`);
  }
};

// Remove members from a group
export const removeGroupMembers = async (groupId: string, userIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .in('user_id', userIds);

  if (error) {
    throw new Error(`Error removing group members: ${error.message}`);
  }
};

// Add courses to a group
export const addGroupCourses = async (assignment: GroupCourseAssignment): Promise<void> => {
  const courseData = assignment.course_ids.map(course_id => ({
    group_id: assignment.group_id,
    course_id
  }));

  const { error } = await supabase
    .from('group_courses')
    .insert(courseData);

  if (error) {
    throw new Error(`Error adding group courses: ${error.message}`);
  }
};

// Remove courses from a group
export const removeGroupCourses = async (groupId: string, courseIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('group_courses')
    .delete()
    .eq('group_id', groupId)
    .in('course_id', courseIds);

  if (error) {
    throw new Error(`Error removing group courses: ${error.message}`);
  }
};

// Get group statistics
export const getGroupStats = async (): Promise<GroupStats> => {
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id');

  if (groupsError) {
    throw new Error(`Error fetching groups for stats: ${groupsError.message}`);
  }

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('id');

  if (membersError) {
    throw new Error(`Error fetching members for stats: ${membersError.message}`);
  }

  const { data: courses, error: coursesError } = await supabase
    .from('group_courses')
    .select('id');

  if (coursesError) {
    throw new Error(`Error fetching courses for stats: ${coursesError.message}`);
  }

  const totalGroups = groups?.length || 0;
  const totalMembers = members?.length || 0;
  const totalCoursesAssigned = courses?.length || 0;
  const averageMembersPerGroup = totalGroups > 0 ? totalMembers / totalGroups : 0;

  return {
    total_groups: totalGroups,
    total_members: totalMembers,
    total_courses_assigned: totalCoursesAssigned,
    average_members_per_group: Math.round(averageMembersPerGroup * 100) / 100
  };
}; 