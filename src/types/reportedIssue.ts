export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ReportedIssue {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: IssueStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface ReportedIssueWithUser extends ReportedIssue {
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  // For backward compatibility, also check 'user' field
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CreateIssueData {
  title: string;
  description: string;
}

export interface UpdateIssueData {
  status?: IssueStatus;
  admin_notes?: string;
}
