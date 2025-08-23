interface NegavidVideoMeta {
  duration: number;
  extension: string;
  size: string;
}

interface NegavidVideoCategory {
  id: number;
  name: string;
}

interface NegavidEmbedStream {
  iframe: string;
  script: string;
}

interface NegavidVideoData {
  id: number;
  title: string;
  description: string | null;
  view_count: number;
  download_permission: boolean;
  password: string | null;
  dynamic_watermark: boolean;
  cover: string;
  soft_watermark: boolean;
  manifest: string;
  condition: string;
  play_url: string;
  category: NegavidVideoCategory;
  meta: NegavidVideoMeta;
  subtitles: any[];
  embed_stream: NegavidEmbedStream;
}

interface NegavidVideoResponse {
  data: NegavidVideoData;
  success: boolean;
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
    const baseUrl = process.env.NEXT_PUBLIC_NEGAVID_BASE_URL;
    const accessToken = process.env.NEXT_PUBLIC_NEGAVID_ACCESS_TOKEN;

    console.log('fetchNegavidVideoUrl called with:', { videoId, baseUrl, hasAccessToken: !!accessToken });

    if (!accessToken) {
      throw new Error('Negavid API configuration missing. Please check NEGAVID_ACCESS_TOKEN environment variable.');
    }

    // Build API URL
    const url = `${baseUrl}/video/edit/${videoId}`;

    console.log('Fetching Negavid video:', {
      videoId,
      url: url.toString()
    });

    const organizationId = process.env.NEXT_PUBLIC_NEGAVID_ORGANIZATION_ID;
    
    if (!organizationId) {
      throw new Error('Negavid API configuration missing. Please check NEGAVID_ORGANIZATION_ID environment variable.');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Organization-Code': organizationId,
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
  return videoData.data.embed_stream?.iframe || null;
}

/**
 * Get the embed script from the response
 */
export function getEmbedScript(videoData: NegavidVideoResponse): string | null {
  return videoData.data.embed_stream?.script || null;
}

/**
 * Get the container ID from the embed script
 */
export function getEmbedContainerId(videoData: NegavidVideoResponse): string | null {
  const embedScript = videoData.data.embed_stream?.script;
  if (!embedScript) return null;
  
  // Extract negavid_id from the script tag
  const match = embedScript.match(/negavid_id="([^"]+)"/);
  return match ? match[1] : null;
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
  return videoData.success === true && 
         videoData.data.condition === 'ready' && 
         !!videoData.data.embed_stream?.iframe;
}

export type { 
  NegavidVideoResponse, 
  NegavidVideoError, 
  NegavidVideoData,
  NegavidVideoMeta,
  NegavidVideoCategory,
  NegavidEmbedStream
};
