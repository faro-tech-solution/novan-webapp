'use client';

import { useState } from 'react';
import { CourseIntroVideo } from '@/types/course';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';

interface VideoIntroductionSectionProps {
  videos: CourseIntroVideo[];
  onVideoClick?: (video: CourseIntroVideo) => void;
}

const VideoIntroductionSection = ({ videos, onVideoClick }: VideoIntroductionSectionProps) => {
  const [selectedVideo, setSelectedVideo] = useState<CourseIntroVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleVideoClick = (video: CourseIntroVideo) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    onVideoClick?.(video);
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={index}
              onClick={() => handleVideoClick(video)}
              className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-20 h-20 text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2" dir="rtl">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" dir="rtl">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedVideo?.url && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={selectedVideo.url}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
            )}
            {selectedVideo?.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm leading-relaxed" dir="rtl">
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoIntroductionSection;
