import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Hls from 'hls.js';
import { 
  fetchArvanVideoUrl, 
  isVideoReady,
  type ArvanVideoResponse 
} from '@/services/arvanVideoService';

interface ArvanVideoPlayerProps {
  videoId: string;
  className?: string;
}

export const ArvanVideoPlayer: React.FC<ArvanVideoPlayerProps> = ({ 
  videoId, 
  className = '' 
}) => {
  const [videoData, setVideoData] = useState<ArvanVideoResponse | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Helper function to get best MP4 URL as fallback
  const getBestMp4Url = (videoData: ArvanVideoResponse): string | null => {
    if (videoData.data.mp4_videos && videoData.data.mp4_videos.length > 0) {
      // Return highest quality MP4 (last in array typically has highest bitrate)
      return videoData.data.mp4_videos[videoData.data.mp4_videos.length - 1];
    }
    return videoData.data.video_url || null;
  };

  // Initialize HLS player
  const initializeHlsPlayer = (url: string) => {
    const video = videoRef.current;
    if (!video) return false;

    try {
      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            // Try fallback to MP4
            const mp4Url = videoData ? getBestMp4Url(videoData) : null;
            if (mp4Url && mp4Url !== url) {
              console.log('HLS failed, trying MP4 fallback:', mp4Url);
              setVideoUrl(mp4Url);
            } else {
              setError('خطا در پخش ویدیو');
            }
          }
        });
        
        hlsRef.current = hls;
        return true;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = url;
        return true;
      } else {
        // HLS not supported, use MP4 fallback
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize HLS player:', error);
      return false;
    }
  };

  // Clean up HLS instance
  const cleanupHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const loadVideo = async () => {
    if (!videoId?.trim()) {
      setError('شناسه ویدیو معتبر نیست');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading Arvan video:', videoId);
      const videoData = await fetchArvanVideoUrl(videoId);
      
      if (!isVideoReady(videoData)) {
        setError(`ویدیو در حال پردازش است. وضعیت: ${videoData.data.status}`);
        setVideoData(videoData);
        setLoading(false);
        return;
      }

      setVideoData(videoData);

      // Try HLS first, then fall back to MP4
      let finalUrl: string | null = null;
      
      if (videoData.data.hls_playlist && (Hls.isSupported() || videoRef.current?.canPlayType('application/vnd.apple.mpegurl'))) {
        finalUrl = videoData.data.hls_playlist;
        console.log('Using HLS playlist:', finalUrl);
      } else {
        // Fall back to best MP4
        finalUrl = getBestMp4Url(videoData);
        console.log('Using MP4 fallback:', finalUrl);
      }

      if (!finalUrl) {
        setError('لینک ویدیو در دسترس نیست');
        setLoading(false);
        return;
      }

      console.log('Final video URL:', finalUrl);
      setVideoUrl(finalUrl);
      setError(null);
      
    } catch (err) {
      console.error('Failed to load Arvan video:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری ویدیو';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadVideo();
  };

  useEffect(() => {
    loadVideo();
  }, [videoId, retryCount]);

  // Initialize video player when URL changes
  useEffect(() => {
    if (videoUrl && videoData) {
      const isHLS = videoUrl.includes('.m3u8') || videoUrl.includes('hls');
      
      if (isHLS) {
        // Initialize HLS player
        const success = initializeHlsPlayer(videoUrl);
        if (!success) {
          // HLS failed, try MP4 fallback
          const mp4Url = getBestMp4Url(videoData);
          if (mp4Url && mp4Url !== videoUrl) {
            console.log('HLS initialization failed, switching to MP4:', mp4Url);
            setVideoUrl(mp4Url);
          }
        }
      } else {
        // Regular MP4 - clean up any existing HLS
        cleanupHls();
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
        }
      }
    }
  }, [videoUrl, videoData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupHls();
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

  if (!videoUrl || !videoData) {
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
                <video
                ref={videoRef}
                  controls
                  className="w-full h-full"
                poster={videoData.data.thumbnail_url}
                  preload="metadata"
                  controlsList="nodownload"
                >
                  <p className="text-white p-4">
                    مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
                  </p>
                </video>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              این لینک ویدیو امن است و تا ۱ ساعت آینده معتبر می‌باشد. در صورت انقضا، صفحه را تازه‌سازی کنید.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};