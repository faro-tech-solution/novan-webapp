import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

// Cache interface
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Cache storage
const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache utility functions
const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
};

const getCacheKey = (method: string, params?: any): string => {
    return `${method}_${JSON.stringify(params || {})}`;
};

export const NotificationService = {
    async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
        const cacheKey = getCacheKey('getLatestNotifications', { limit });
        const cached = cache.get(cacheKey);
        
        if (cached && isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
        
        const result = (data ?? []) as Notification[];
        
        // Cache the result
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
    },

    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);
        
        if (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
        
        // Clear cache when marking as read to ensure fresh data
        cache.clear();
    },

    async getUnreadCount(): Promise<number> {
        const cacheKey = getCacheKey('getUnreadCount');
        const cached = cache.get(cacheKey);
        
        if (cached && isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        const { count, error } = await (supabase as any)
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
        
        if (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
        
        const result = count || 0;
        
        // Cache the result
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        return result;
    },

    // Method to clear cache manually if needed
    clearCache(): void {
        cache.clear();
    },

    // Method to get cache statistics
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: cache.size,
            keys: Array.from(cache.keys())
        };
    }
}
