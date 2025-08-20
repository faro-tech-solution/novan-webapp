import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  fetchNegavidVideoUrl, 
  isVideoReady,
  getEmbedScript,
  getEmbedContainerId,
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
  const scriptRef = useRef<HTMLScriptElement | null>(null);

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
        setError(`ویدیو در دسترس نیست. وضعیت: ${videoData.data.status}`);
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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setScriptLoaded(false);
    loadVideo();
  };

  // Load the embed script when video data is available
  useEffect(() => {
    if (!videoData || !isVideoReady(videoData) || !containerRef.current) {
      return;
    }

    const embedScript = getEmbedScript(videoData);
    const containerId = getEmbedContainerId(videoData);

    if (!embedScript || !containerId) {
      console.error('Missing embed script or container ID');
      return;
    }

    // Create container div for the video player
    const container = containerRef.current;
    container.innerHTML = `<div id="${containerId}" class="w-full h-full"></div>`;

    // Remove any existing script
    if (scriptRef.current) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    // Create and load the new script
    const script = document.createElement('script');
    script.defer = true;
    script.className = 'negavid-video-stream-embed';
    script.id = `stream_id-${videoId}`;
    
    // Extract script src from embed_script
    const srcMatch = embedScript.match(/src='([^']+)'/);
    if (srcMatch) {
      script.src = srcMatch[1];
    }

    // Extract negavid_id and set as attribute
    const negavidIdMatch = embedScript.match(/negavid_id='([^']+)'/);
    if (negavidIdMatch) {
      script.setAttribute('negavid_id', negavidIdMatch[1]);
    }

    script.onload = () => {
      console.log('Negavid embed script loaded successfully');
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Negavid embed script');
      setError('خطا در بارگذاری پخش‌کننده ویدیو');
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    // Cleanup function
    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      setScriptLoaded(false);
    };
  }, [videoData, videoId]);

  useEffect(() => {
    loadVideo();
  }, [videoId, retryCount]);

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
                {videoData?.data?.status && (
                  <p className="text-sm text-muted-foreground">وضعیت: {videoData.data.status}</p>
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
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
              <div 
                ref={containerRef}
                className="w-full h-full"
              />
              {!scriptLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                    <p className="text-white text-sm">در حال بارگذاری پخش‌کننده...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
