// Basic Group interface
export interface Group {
  id: string;
  title: string;
  description: string | null;
  telegram_channels: string | null; // Comma-separated channel IDs
  created_at: string;
  updated_at: string;
  created_by: string | null;
  member_count?: number;
  course_count?: number;
}

// Group interface for creation
export interface CreateGroupData {
  title: string;
  description?: string;
  telegram_channels?: string;
}

// Group interface for updates
export interface UpdateGroupData {
  title?: string;
  description?: string;
  telegram_channels?: string;
}

// Group member interface
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

// Group course interface
export interface GroupCourse {
  id: string;
  group_id: string;
  course_id: string;
  assigned_at: string;
  assigned_by: string | null;
  course?: {
    id: string;
    name: string;
    description: string | null;
  };
}

// Group with members and courses
export interface GroupWithDetails extends Group {
  members: GroupMember[];
  courses: GroupCourse[];
}

// Group member assignment data
export interface GroupMemberAssignment {
  group_id: string;
  user_ids: string[];
}

// Group course assignment data
export interface GroupCourseAssignment {
  group_id: string;
  course_ids: string[];
}

// Group filters
export interface GroupFilters {
  search?: string;
  created_by?: string;
}

// Group statistics
export interface GroupStats {
  total_groups: number;
  total_members: number;
  total_courses_assigned: number;
  average_members_per_group: number;
} 