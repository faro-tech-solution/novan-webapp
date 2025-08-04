import { supabase } from '@/integrations/supabase/client';
import { SpotPlayerConfig } from '@/types/spotplayer';

export class SpotPlayerService {
  private static API_BASE_URL = 'https://panel.spotplayer.ir';
  private static APP_URL = 'https://app.spotplayer.ir';
  private static API_KEY = process.env.NEXT_PUBLIC_SPOTPLAYER_API_KEY || process.env.SPOTPLAYER_API_KEY;

  /**
   * Get configuration for SpotPlayer integration
   */
  static async getSpotPlayerConfig(
    userId: string,
    courseId: string,
    spotplayerCourseId: string,
    itemId?: string
  ): Promise<SpotPlayerConfig> {
    if (!this.API_KEY) {
      throw new Error('SpotPlayer API key is not configured. Please set NEXT_PUBLIC_SPOTPLAYER_API_KEY or SPOTPLAYER_API_KEY environment variable.');
    }

    console.log(this.API_BASE_URL, this.API_KEY)

    try {
      // Call SpotPlayer API to get or create a license
      const response = await fetch(`${this.API_BASE_URL}/api/v1/licenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          course_id: spotplayerCourseId,
          user_id: userId,
          is_test: false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SpotPlayer API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const apiResponse = await response.json();
      
      // Create a simple license object
      const license = {
        id: `license_${Date.now()}`,
        user_id: userId,
        course_id: courseId,
        license_id: spotplayerCourseId,
        license_key: apiResponse.license_key || `temp_key_${Date.now()}`,
        is_test: false,
        is_valid: true,
        created_at: new Date().toISOString()
      };

      // Create a simple cookie object
      const cookie = {
        id: `cookie_${Date.now()}`,
        user_id: userId,
        cookie_value: `${Date.now().toString(16)}${Math.random().toString(16).substr(2)}`,
        updated_at: new Date().toISOString()
      };

      return {
        courseId: spotplayerCourseId,
        itemId,
        license,
        cookie
      };
    } catch (error) {
      console.error('Error getting SpotPlayer config:', error);
      
      // Fallback configuration if API call fails
      const license = {
        id: `license_${Date.now()}`,
        user_id: userId,
        course_id: courseId,
        license_id: spotplayerCourseId,
        license_key: `temp_key_${Date.now()}`,
        is_test: false,
        is_valid: true,
        created_at: new Date().toISOString()
      };

      const cookie = {
        id: `cookie_${Date.now()}`,
        user_id: userId,
        cookie_value: `${Date.now().toString(16)}${Math.random().toString(16).substr(2)}`,
        updated_at: new Date().toISOString()
      };

      return {
        courseId: spotplayerCourseId,
        itemId,
        license,
        cookie
      };
    }
  }

  /**
   * Log stream access (simplified - just console log for now)
   */
  static async logStreamAccess(
    userId: string,
    courseId: string,
    licenseKey: string,
    streamUrl: string,
    itemId?: string
  ): Promise<void> {
    console.log('SpotPlayer stream access logged:', {
      userId,
      courseId,
      licenseKey,
      streamUrl,
      itemId,
      timestamp: new Date().toISOString()
    });
  }
}