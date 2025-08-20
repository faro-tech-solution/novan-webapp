interface NegavidVideoData {
  id: number;
  name: string;
  description: string | null;
  download_count: number;
  url: boolean;
  view: string;
  duration: number;
  embed_player: string;
  embed_script: string;
  status: string;
  subtitles: any[];
  rich_snipp: any | null;
  manifest: string;
}

interface NegavidVideoResponse {
  data: NegavidVideoData;
  status: string;
}

interface NegavidVideoError {
  message: string;
  error_code?: string;
}

/**
 * Fetch video data from Negavid API
 */
export async function fetchNegavidVideoUrl(videoId: string): Promise<NegavidVideoResponse> {
  try {
    const baseUrl = 'https://open.negavid.com/api/v1';
    const accessToken = process.env.NEXT_PUBLIC_NEGAVID_ACCESS_TOKEN;

    console.log('fetchNegavidVideoUrl called with:', { videoId, baseUrl, hasAccessToken: !!accessToken });

    if (!accessToken) {
      throw new Error('Negavid API configuration missing. Please check NEGAVID_ACCESS_TOKEN environment variable.');
    }

    // Build API URL
    const url = `${baseUrl}/video/${videoId}`;

    console.log('Fetching Negavid video:', {
      videoId,
      url: url.toString()
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText) as NegavidVideoError;
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If can't parse as JSON, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(`Failed to fetch video from Negavid: ${errorMessage}`);
    }

    const videoData = await response.json() as NegavidVideoResponse;

    return videoData;

  } catch (error) {
    console.error('Error fetching Negavid video:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while fetching video');
    }
  }
}

/**
 * Get the embed player HTML from the response
 */
export function getEmbedPlayerHtml(videoData: NegavidVideoResponse): string | null {
  return videoData.data.embed_player || null;
}

/**
 * Get the manifest URL for HLS streaming
 */
export function getManifestUrl(videoData: NegavidVideoResponse): string | null {
  return videoData.data.manifest || null;
}

/**
 * Check if video is available and ready to play
 */
export function isVideoReady(videoData: NegavidVideoResponse): boolean {
  return videoData.status === 'success' && 
         videoData.data.status === 'Ready' && 
         !!videoData.data.embed_player;
}

export type { 
  NegavidVideoResponse, 
  NegavidVideoError, 
  NegavidVideoData 
};
