import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

export const NotificationService = {
    async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
        console.log('Fetching notifications with limit:', limit);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
        console.log('Fetched notifications:', data);
        return data ?? [];
    },

    async markAsRead(notificationId: string): Promise<void> {
        console.log('Marking notification as read:', notificationId);
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);
        
        if (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
        console.log('Successfully marked notification as read');
    },

    async getUnreadCount(): Promise<number> {
        console.log('Fetching unread count');
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
        
        if (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
        console.log('Unread count:', count);
        return count || 0;
    }
}
