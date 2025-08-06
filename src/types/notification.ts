export type NotificationType = 'exercise_feedback' | 'award_achieved' | 'system';

export interface Notification {
    id: string;
    title: string;
    description: string | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
    link: string | null;
    type: NotificationType;
    metadata: Record<string, any>;
    sender_id: string | null;
    priority: 'normal' | 'high' | 'low';
    icon: string | null;
    course_id: string | null;
}
