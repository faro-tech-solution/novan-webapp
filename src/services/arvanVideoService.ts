interface ArvanVideoFileInfo {
  general: {
    duration: number;
    format: string;
    bit_rate: string;
    size: string;
  };
  video: {
    codec: string;
    width: number;
    height: number;
    frame_rate: string;
    bit_rate: string;
  };
  audio: {
    codec: string;
    sample_rate: string;
    bit_rate: string;
    channel_layout: string;
  };
}

interface ArvanVideoConvertInfo {
  audio_bitrate: number | string;
  video_bitrate: number | string;
  resolution: string;
}

interface ArvanVideoChannel {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  secure_link_enabled: number;
  secure_link_key: string;
  is_recommendation_enabled: number;
  secure_link_with_ip: boolean;
  ads_enabled: number;
  present_type?: string | null;
  campaign_id?: string | null;
  agency_id?: string | null;
  category_id?: string | null;
  player_id?: string | null;
}

interface ArvanVideoData {
  id: string;
  user_id: string;
  title: string;
  video_url: string;
  description?: string;
  file_info: ArvanVideoFileInfo;
  thumbnail_time: number;
  status: string;
  job_status_url?: string | null;
  available: number;
  convert_mode: string;
  convert_info: ArvanVideoConvertInfo[];
  converted_info: ArvanVideoConvertInfo[];
  play_ready: number;
  created_at: string;
  updated_at: string;
  completed_at: string;
  play_ready_at: string;
  parallel_convert: number;
  directory_size: string;
  options?: any | null;
  config_url: string;
  mp4_videos: string[];
  hls_playlist: string;
  dash_playlist: string;
  thumbnail_url: string;
  tooltip_url: string;
  player_url: string;
  channel: ArvanVideoChannel;
  tags: any[];
}

interface ArvanVideoResponse {
  data: ArvanVideoData;
}

interface ArvanVideoError {
  message: string;
  error_code?: string;
}

/**
 * Get user's IP address from a reliable service
 */
async function getUserIP(): Promise<string> {
  try {
    // Try multiple IP services for reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://httpbin.org/ip',
      'https://api64.ipify.org?format=json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Different services return IP in different formats
        const ip = data.ip || data.origin;
        if (ip) {
          console.log('Detected user IP:', ip);
          return ip;
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }
    
    // Fallback - let server determine IP
    console.warn('Could not determine user IP, using server default');
    return '';
  } catch (error) {
    console.error('Error getting user IP:', error);
    return '';
  }
}

/**
 * Generate Unix timestamp for 1 hour from now
 */
function getExpireTimestamp(): number {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
  const oneHour = 60 * 60; // 1 hour in seconds
  return now + oneHour;
}

/**
 * Fetch secure video URL from Arvan Cloud API
 */
export async function fetchArvanVideoUrl(videoId: string): Promise<ArvanVideoResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_ARVAN_CLOUD_BASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_ARVAN_CLOUD_API_KEY;

    console.log('fetchArvanVideoUrl 1', {baseUrl, apiKey});

    if (!baseUrl || !apiKey) {
      throw new Error('Arvan Cloud API configuration missing. Please check ARVAN_CLOUD_BASE_URL and ARVAN_CLOUD_API_KEY environment variables.');
    }
    console.log('fetchArvanVideoUrl 2');
    // Get user IP and expiration timestamp
    const userIP = await getUserIP();
    const expireTime = getExpireTimestamp();
    console.log('fetchArvanVideoUrl 3', {userIP, expireTime});
    // Build API URL
    const url = `${baseUrl}/videos/${videoId}?secure_ip=${userIP}&secure_expire_time=${expireTime}`
    // if (userIP) {
    //   url.searchParams.append('secure_ip', userIP);
    // }
    // url.searchParams.append('secure_expire_time', expireTime.toString());

    console.log('fetchArvanVideoUrl 4', url);

    console.log('Fetching Arvan video:', {
      videoId,
      userIP: userIP || 'server-determined',
      expireTime: new Date(expireTime * 1000).toISOString(),
      url: url.toString()
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText) as ArvanVideoError;
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If can't parse as JSON, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(`Failed to fetch video from Arvan Cloud: ${errorMessage}`);
    }

    const videoData = await response.json() as ArvanVideoResponse;

    return videoData;

  } catch (error) {
    console.error('Error fetching Arvan video:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while fetching video');
    }
  }
}

/**
 * Get the best video URL from the response
 * Prioritizes HLS playlist > highest quality MP4 > main video URL > player URL
 */
  export function getBestVideoUrl(videoData: ArvanVideoResponse): string | null {
    // Priority order: hls_playlist > highest quality mp4 > video_url > player_url
  const candidates = [
    videoData.data.hls_playlist,
    videoData.data.dash_playlist,
    // Get the highest quality MP4 (last in array typically has highest bitrate)
    videoData.data.mp4_videos && videoData.data.mp4_videos.length > 0 
      ? videoData.data.mp4_videos[videoData.data.mp4_videos.length - 1] 
      : null,
    videoData.data.video_url,
    videoData.data.player_url
  ];

  for (const url of candidates) {
    if (url && url.trim()) {
      return url.trim();
    }
  }

  return null;
}

/**
 * Check if video is available and ready to play
 */
export function isVideoReady(videoData: ArvanVideoResponse): boolean {
  return videoData.data.status === 'complete' && 
         videoData.data.play_ready === 1 && 
         videoData.data.available === 1;
}

export type { 
  ArvanVideoResponse, 
  ArvanVideoError, 
  ArvanVideoFileInfo, 
  ArvanVideoConvertInfo, 
  ArvanVideoChannel 
};