import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  fetchNegavidVideoUrl, 
  isVideoReady,
  getEmbedPlayerHtml,
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
    loadVideo();
  };

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

  const embedPlayerHtml = getEmbedPlayerHtml(videoData);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <div className="aspect-video">
              {embedPlayerHtml ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: embedPlayerHtml }}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>ویدیو در دسترس نیست</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
