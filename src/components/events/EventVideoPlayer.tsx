import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Play } from 'lucide-react';
import Link from 'next/link';

interface EventVideoPlayerProps {
  videoUrl: string;
  eventTitle: string;
  className?: string;
}

const EventVideoPlayer = ({ videoUrl, eventTitle, className = "" }: EventVideoPlayerProps) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            ویدیو رویداد
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-gray-500">
              برای مشاهده ویدیو این رویداد باید وارد حساب کاربری خود شوید
            </div>
            <Button asChild>
              <Link href="/portal/login">
                ورود به حساب کاربری
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  // Check if it's a Vimeo URL
  const isVimeo = videoUrl.includes('vimeo.com');
  
  // Check if it's a direct video file
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|avi|mov)$/i);

  const getEmbedUrl = (url: string) => {
    if (isYouTube) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (isVimeo) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          ویدیو رویداد: {eventTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full">
          {isYouTube || isVimeo ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              title={eventTitle}
              className="w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full rounded-md"
              title={eventTitle}
            >
              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">فرمت ویدیو پشتیبانی نمی‌شود</p>
                <Button asChild variant="outline">
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    مشاهده در تب جدید
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventVideoPlayer;
