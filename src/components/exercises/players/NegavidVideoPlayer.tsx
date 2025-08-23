import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  fetchNegavidVideoUrl, 
  isVideoReady,
  getEmbedPlayerHtml,
  getEmbedScript,
  type NegavidVideoResponse 
} from '@/services/negavidVideoService';

interface NegavidVideoPlayerProps {
  videoId: string;
  className?: string;
}

export const NegavidVideoPlayer: React.FC<NegavidVideoPlayerProps> = ({ 
  videoId, 
  className = '' 
}) => {
  const [videoData, setVideoData] = useState<NegavidVideoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const loadVideo = async () => {
    if (!videoId?.trim()) {
      setError('شناسه ویدیو معتبر نیست');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading Negavid video:', videoId);
      const videoData = await fetchNegavidVideoUrl(videoId);
      
      if (!isVideoReady(videoData)) {
        setError(`ویدیو در دسترس نیست. وضعیت: ${videoData.data.condition}`);
        setVideoData(videoData);
        setLoading(false);
        return;
      }

      setVideoData(videoData);
      setError(null);
      
    } catch (err) {
      console.error('Failed to load Negavid video:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری ویدیو';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadEmbedScript = (scriptHtml: string) => {
    // Remove any existing script
    const existingScript = document.querySelector('script[class*="negavid-video-stream-embed"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create a temporary div to parse the script HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scriptHtml;
    const scriptElement = tempDiv.querySelector('script');
    
    if (scriptElement) {
      // Set up script loading event
      scriptElement.onload = () => {
        console.log('Negavid embed script loaded successfully');
        setScriptLoaded(true);
      };
      
      scriptElement.onerror = () => {
        console.error('Failed to load Negavid embed script');
        setScriptLoaded(false);
      };

      // Append the script to the document head
      document.head.appendChild(scriptElement);
    }
  };

  const createIframeFromHtml = (htmlString: string) => {
    if (!containerRef.current) return;

    // Clear the container
    containerRef.current.innerHTML = '';

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Find the iframe element
    const iframeElement = tempDiv.querySelector('iframe');
    if (iframeElement) {
      // Clone the iframe to avoid any reference issues
      const clonedIframe = iframeElement.cloneNode(true) as HTMLIFrameElement;
      
      // Store reference to the iframe
      iframeRef.current = clonedIframe;
      
      // Append the iframe to the container
      containerRef.current.appendChild(clonedIframe);
      
      console.log('Iframe created and appended successfully');
    } else {
      console.error('No iframe found in the HTML string');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setScriptLoaded(false);
    loadVideo();
  };

  useEffect(() => {
    loadVideo();
  }, [videoId, retryCount]);

  useEffect(() => {
    if (videoData && isVideoReady(videoData)) {
      const embedScript = getEmbedScript(videoData);
      if (embedScript) {
        loadEmbedScript(embedScript);
      }
    }
  }, [videoData]);

  // Create iframe when video data is ready and container is available
  useEffect(() => {
    if (videoData && isVideoReady(videoData) && containerRef.current) {
      const embedPlayerHtml = getEmbedPlayerHtml(videoData);
      if (embedPlayerHtml) {
        createIframeFromHtml(embedPlayerHtml);
      }
    }
  }, [videoData, containerRef.current]);

  // Cleanup script on unmount
  useEffect(() => {
    return () => {
      const existingScript = document.querySelector('script[class*="negavid-video-stream-embed"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">در حال بارگذاری ویدیو...</p>
            <p className="text-sm text-muted-foreground">شناسه ویدیو: {videoId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p className="font-medium">خطا در بارگذاری ویدیو</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs text-muted-foreground">شناسه ویدیو: {videoId}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تلاش مجدد
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!videoData || !isVideoReady(videoData)) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <PlayCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>ویدیو در دسترس نیست</p>
                <p className="text-sm text-muted-foreground">شناسه ویدیو: {videoId}</p>
                {videoData?.data?.condition && (
                  <p className="text-sm text-muted-foreground">وضعیت: {videoData.data.condition}</p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تلاش مجدد
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
              <div 
                ref={containerRef}
                className="w-full h-full"
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  paddingTop: '25px',
                  height: '0',
                  overflow: 'hidden'
                }}
              />
            </div>
            {!scriptLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <p className="text-white text-sm">در حال بارگذاری پخش‌کننده...</p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
