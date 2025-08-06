import { SpotPlayerConfig } from '@/types/spotplayer';

export class SpotPlayerService {
  private static API_BASE_URL = 'https://panel.spotplayer.ir';
  private static APP_URL = 'https://app.spotplayer.ir';
  private static API_KEY = process.env.NEXT_PUBLIC_SPOTPLAYER_API_KEY || process.env.SPOTPLAYER_API_KEY;

  /**
   * Create a SpotPlayer license using the official API
   */
  static async createLicense(
    userId: string,
    courseId: string,
    spotplayerCourseId: string,
    isTest: boolean = false
  ): Promise<{ licenseId: string; licenseKey: string; url: string }> {
    if (!this.API_KEY) {
      throw new Error('SpotPlayer API key is not configured. Please set NEXT_PUBLIC_SPOTPLAYER_API_KEY or SPOTPLAYER_API_KEY environment variable.');
    }
    console.log(courseId)
    console.log('Creating SpotPlayer license with:', {
      API_BASE_URL: this.API_BASE_URL,
      API_KEY: this.API_KEY ? '***configured***' : 'NOT_CONFIGURED',
      courseId: spotplayerCourseId,
      isTest
    });

    try {
      // Prepare license data according to SpotPlayer API documentation
      const licenseData = {
        test: isTest,
        course: [spotplayerCourseId],
        offline: 30, // 30 days offline access
        name: `user_${userId}`,
        payload: "",
        data: {
          confs: 0,
          limit: {
            [spotplayerCourseId]: "0-" // Access to all items in course
          }
        },
        watermark: {
          position: 511, // All positions
          reposition: 15, // 15 seconds
          margin: 40, // 40 pixels
          texts: [
            {
              text: "SpotPlayer",
              repeat: 10,
              font: 1,
              weight: 1,
              color: 2164260863,
              size: 50,
              stroke: { color: 2164260863, size: 1 }
            }
          ]
        },
        device: {
          p0: 1, // All Devices
          p1: 1, // Windows
          p2: 1, // MacOS
          p3: 1, // Ubuntu
          p4: 1, // Android
          p5: 1, // IOS
          p6: 1  // WebApp
        }
      };

      const response = await fetch(`${this.API_BASE_URL}/license/edit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          '$API': this.API_KEY,
          '$LEVEL': '-1'
        },
        body: JSON.stringify(licenseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SpotPlayer API error response:', errorText);
        throw new Error(`SpotPlayer API error: ${response.status} - ${errorText}`);
      }

      const apiResponse = await response.json();
      
      if (apiResponse.ex) {
        throw new Error(`SpotPlayer API error: ${apiResponse.ex.msg || 'Unknown error'}`);
      }

      console.log('SpotPlayer license created successfully:', {
        licenseId: apiResponse._id,
        licenseKey: apiResponse.key ? '***generated***' : 'NOT_GENERATED',
        url: apiResponse.url
      });

      return {
        licenseId: apiResponse._id,
        licenseKey: apiResponse.key,
        url: apiResponse.url
      };
    } catch (error) {
      console.error('Error creating SpotPlayer license:', error);
      throw error;
    }
  }

  /**
   * Get or create cookie for SpotPlayer authentication
   */
  static async getOrCreateCookie(userId: string): Promise<string> {
    // Generate a new cookie value for the user
    const cookieValue = `${Date.now().toString(16)}${Math.random().toString(16).substr(2)}`;
    
    console.log('Generated SpotPlayer cookie for user:', userId);
    
    return cookieValue;
  }

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

    console.log('Getting SpotPlayer config for:', {
      userId,
      courseId,
      spotplayerCourseId,
      itemId
    });

    try {
      // Create license using the official API
      const licenseResult = await this.createLicense(userId, courseId, spotplayerCourseId, false);
      
      // Get or create cookie
      const cookieValue = await this.getOrCreateCookie(userId);

      // Create license object
      const license = {
        id: licenseResult.licenseId,
        user_id: userId,
        course_id: courseId,
        license_id: spotplayerCourseId,
        license_key: licenseResult.licenseKey,
        is_test: false,
        is_valid: true,
        created_at: new Date().toISOString()
      };

      // Create cookie object
      const cookie = {
        id: `cookie_${Date.now()}`,
        user_id: userId,
        cookie_value: cookieValue,
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
      licenseKey: licenseKey ? '***logged***' : 'NOT_AVAILABLE',
      streamUrl,
      itemId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Refresh SpotPlayer cookie (for server-side cookie synchronization)
   */
  static async refreshCookie(existingCookie: string): Promise<string> {
    try {
      const response = await fetch(this.APP_URL, {
        method: 'HEAD',
        headers: {
          'Cookie': `X=${existingCookie}`
        }
      });

      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        const match = setCookieHeader.match(/X=([a-f0-9]+);/);
        if (match && match[1]) {
          console.log('SpotPlayer cookie refreshed successfully');
          return match[1];
        }
      }

      throw new Error('Failed to refresh cookie - no new cookie received');
    } catch (error) {
      console.error('Error refreshing SpotPlayer cookie:', error);
      throw error;
    }
  }

  /**
   * Check if cookie is still valid (based on timestamp in cookie)
   */
  static isCookieValid(cookieValue: string): boolean {
    try {
      // SpotPlayer cookies contain timestamp at positions 24-35 (12 chars in hex)
      const timestampHex = cookieValue.substr(24, 12);
      const timestamp = parseInt(timestampHex, 16);
      return Date.now() < timestamp;
    } catch {
      return false;
    }
  }
}