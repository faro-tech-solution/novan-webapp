import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useNegavidPlayer from '@/hooks/useNegavidPlayer';
import { useStableAuth } from '@/hooks/useStableAuth';

interface IframePlayerProps {
  iframeHtml: string;
  onComplete: () => void;
  isCompleted: boolean;
  disabled: boolean;
}

export const IframePlayer: React.FC<IframePlayerProps> = ({
  iframeHtml,
  onComplete,
  isCompleted,
  disabled
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const { userEmail, profile } = useStableAuth();
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';
  const message = ["", "", userEmail || '', fullName || '', "#ffee8c", "3"];
  useNegavidPlayer(message);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    
    // Simulate loading time for iframe content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [iframeHtml]);

  const handleComplete = () => {
    if (!disabled && !isCompleted) {
      onComplete();
      toast({
        title: "تکمیل شد",
        description: "تمرین iframe با موفقیت تکمیل شد",
      });
    }
  };

  if (hasError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">خطا در بارگذاری</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="bg-gray-100 p-4 rounded-md text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>کد HTML iframe:</strong>
              </p>
              <code className="text-xs bg-white p-2 rounded border block break-all max-h-32 overflow-y-auto">
                {iframeHtml}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoize the iframe markup so it doesn't re-mount on incidental rerenders
  const memoizedIframe = useMemo(() => (
    <div 
      className="bg-gray-100 rounded-lg overflow-hidden"
      dangerouslySetInnerHTML={{ __html: iframeHtml }}
    />
  ), [iframeHtml]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 ml-1" />
                <span className="text-sm font-medium">تکمیل شده</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="mr-2 text-gray-600">در حال بارگذاری...</span>
            </div>
          )}

          {/* Iframe HTML Content */}
          <div className="relative">{memoizedIframe}</div>

          {/* Complete Button */}
          {!isCompleted && !disabled && (
            <div className="flex justify-center">
              <Button
                onClick={handleComplete}
                disabled={disabled || isLoading}
                className="px-6"
              >
                <CheckCircle className="h-4 w-4 ml-2" />
                تکمیل تمرین
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 