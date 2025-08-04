import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpotPlayerService } from '@/services/spotPlayerService';
import { SpotPlayerConfig } from '@/types/spotplayer';
import { FeedbackForm } from './FeedbackForm';

// Declare SpotPlayer global for TypeScript
declare global {
  interface Window {
    SpotPlayer: new (
      element: HTMLElement,
      cookieUrl: string,
      side?: boolean,
      cookieName?: string
    ) => {
      Open: (key: string, course?: string, item?: string) => Promise<void>;
      Stop: () => Promise<void>;
      Hide: () => Promise<void>;
    };
  }
}

interface SpotPlayerVideoProps {
  exerciseId: string;
  courseId: string;
  spotplayerCourseId: string;
  spotplayerItemId?: string;
  userId: string;
  onComplete: (feedback?: string) => void;
  isCompleted: boolean;
  disabled: boolean;
}

export const SpotPlayerVideo: React.FC<SpotPlayerVideoProps> = ({
  exerciseId,
  courseId,
  spotplayerCourseId,
  spotplayerItemId,
  userId,
  onComplete,
  isCompleted,
  disabled
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const spotPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [config, setConfig] = useState<SpotPlayerConfig | null>(null);
  const [canComplete, setCanComplete] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();

  // Load SpotPlayer script
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="app-api.js"]');
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.spotplayer.ir/assets/js/app-api.js';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setHasError(true);
      setErrorMessage('خطا در بارگذاری اسکریپت SpotPlayer');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize SpotPlayer configuration
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        setIsLoading(true);
        const spotPlayerConfig = await SpotPlayerService.getSpotPlayerConfig(
          userId,
          courseId,
          spotplayerCourseId,
          spotplayerItemId
        );
        setConfig(spotPlayerConfig);
      } catch (error) {
        console.error('Error initializing SpotPlayer config:', error);
        setHasError(true);
        setErrorMessage('خطا در تنظیم SpotPlayer');
      } finally {
        setIsLoading(false);
      }
    };

    if (scriptLoaded) {
      initializeConfig();
    }
  }, [scriptLoaded, userId, courseId, spotplayerCourseId, spotplayerItemId]);

  // Initialize SpotPlayer instance
  useEffect(() => {
    const initializePlayer = async () => {
      if (!config || !playerRef.current || !window.SpotPlayer || !scriptLoaded) {
        return;
      }

      try {
        // Create SpotPlayer instance
        const spotPlayer = new window.SpotPlayer(
          playerRef.current,
          '', // We handle cookie management manually through SpotPlayerService
          false, // side panel
          'X' // cookie name
        );

        spotPlayerRef.current = spotPlayer;

        // Open the video content
        await spotPlayer.Open(
          config.license.license_key,
          config.courseId,
          config.itemId
        );

        // Log stream access
        await SpotPlayerService.logStreamAccess(
          userId,
          courseId,
          config.license.license_key,
          `spotplayer://${config.courseId}/${config.itemId || ''}`,
          config.itemId
        );

        setCanComplete(true);

        toast({
          title: "ویدیو بارگذاری شد",
          description: "ویدیو SpotPlayer با موفقیت بارگذاری شد",
        });
      } catch (error) {
        console.error('Error initializing SpotPlayer:', error);
        setHasError(true);
        setErrorMessage('خطا در بارگذاری ویدیو SpotPlayer');
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (spotPlayerRef.current) {
        try {
          spotPlayerRef.current.Stop();
        } catch (error) {
          console.error('Error stopping SpotPlayer:', error);
        }
      }
    };
  }, [config, scriptLoaded]);

  const handleShowFeedbackForm = () => {
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    setIsSubmitting(true);
    try {
      await onComplete(feedback);
      toast({
        title: "تمرین تکمیل شد",
        description: "تمرین ویدیویی SpotPlayer با موفقیت تکمیل شد",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFeedbackForm && !isCompleted) {
    return (
      <FeedbackForm
        onSubmit={handleFeedbackSubmit}
        isSubmitting={isSubmitting}
        title="بازخورد ویدیو SpotPlayer"
        description="برای تکمیل تمرین، لطفاً بازخورد خود را وارد کنید."
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>در حال بارگذاری SpotPlayer...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{errorMessage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div 
          ref={playerRef} 
          className="w-full min-h-[400px] bg-gray-100 rounded-md"
          style={{ minHeight: '400px' }}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            SpotPlayer Video - Course: {spotplayerCourseId}
            {spotplayerItemId && `, Item: ${spotplayerItemId}`}
          </div>
          
          {isCompleted ? (
            <div className="flex items-center text-green-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>تکمیل شده</span>
            </div>
          ) : canComplete ? (
            <Button
              onClick={handleShowFeedbackForm}
              disabled={disabled}
              size="sm"
            >
              تکمیل تمرین
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};