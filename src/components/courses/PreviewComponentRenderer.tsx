'use client';

import { useState } from 'react';
import * as React from 'react';
import { ChevronRight, ChevronDown, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as LucideIcons from 'lucide-react';
import { 
  PreviewComponent,
  TextPreviewComponent,
  ListPreviewComponent,
  AccordionPreviewComponent,
  VideoListPreviewComponent,
  GridPreviewComponent 
} from '@/types/previewData';

interface PreviewComponentRendererProps {
  component: PreviewComponent;
}

// Helper function to convert string to PascalCase (e.g., "book open" -> "BookOpen")
const toPascalCase = (str: string): string => {
  return str
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Helper function to get icon component by name
const getIconComponent = (iconName: string) => {
  if (!iconName || typeof iconName !== 'string') return null;
  
  // Trim whitespace and normalize the icon name
  const normalizedName = iconName.trim();
  if (!normalizedName) return null;
  
  // Try exact match first (most common case)
  let IconComponent = (LucideIcons as any)[normalizedName];
  
  // If not found, try PascalCase conversion (lucide-react uses PascalCase)
  if (!IconComponent) {
    const pascalCaseName = toPascalCase(normalizedName);
    IconComponent = (LucideIcons as any)[pascalCaseName];
  }
  
  // If still not found, try with first letter uppercase only
  if (!IconComponent) {
    const firstUpper = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    IconComponent = (LucideIcons as any)[firstUpper];
  }
  
  // Return the found icon or null (don't use fallback to avoid showing wrong icons)
  return IconComponent || null;
};

const PreviewComponentRenderer = ({ component }: PreviewComponentRendererProps) => {
  switch (component.type) {
    case 'text':
      return <TextComponentRenderer component={component as TextPreviewComponent} />;
    case 'list':
      return <ListComponentRenderer component={component as ListPreviewComponent} />;
    case 'accordion':
      return <AccordionComponentRenderer component={component as AccordionPreviewComponent} />;
    case 'video_list':
      return <VideoListComponentRenderer component={component as VideoListPreviewComponent} />;
    case 'grid':
      return <GridComponentRenderer component={component as GridPreviewComponent} />;
    default:
      return null;
  }
};

// Text Component Renderer
const TextComponentRenderer = ({ component }: { component: TextPreviewComponent }) => {
  const bgColor = component.backgroundColor;
  const bgStyle = !bgColor || bgColor === 'transparent' ? {} : { backgroundColor: bgColor };
  
  // Show component even if content is empty, but show a placeholder
  if (!component.content || component.content.trim() === '') {
    return (
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          محتوای متن خالی است
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {component.title && (
        <h2 className="text-3xl text-gray-900 relative inline-block w-full">
          <span className="relative inline-block">{component.title}</span>
        </h2>
      )}
      <div 
        className={`rounded-lg p-8 shadow-sm ${bgColor === 'transparent' ? '' : ''}`}
        style={bgStyle}
      >
        <div
          className="prose prose-gray max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-li:marker:text-gray-500"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: component.content }}
        />
      </div>
    </section>
  );
};

// List Component Renderer
const ListComponentRenderer = ({ component }: { component: ListPreviewComponent }) => {
  const validItems = component.items?.filter(item => item && item.trim() !== '') || [];
  const bgColor = component.backgroundColor;
  const bgStyle = !bgColor || bgColor === 'transparent' ? {} : { backgroundColor: bgColor };
  
  if (validItems.length === 0) {
    return (
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          هیچ آیتمی در لیست وجود ندارد
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {component.title && (
        <h2 className="text-3xl text-gray-900 relative inline-block w-full">
          <span className="relative inline-block">{component.title}</span>
        </h2>
      )}
      <div 
        className="rounded-lg p-8 shadow-sm"
        style={bgStyle}
      >
        <ul className="space-y-4" dir="rtl">
          {validItems.map((item, index) => (
            <li key={index} className="flex items-start gap-4 text-gray-700">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <ChevronRight className="w-4 h-4 text-blue-600 rotate-180" />
              </div>
              <span className="flex-1 leading-relaxed text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// Accordion Component Renderer
const AccordionComponentRenderer = ({ component }: { component: AccordionPreviewComponent }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const bgColor = component.backgroundColor;
  const bgStyle = !bgColor || bgColor === 'transparent' ? {} : { backgroundColor: bgColor };

  const validItems = component.items?.filter(item => item && item.title && item.title.trim() !== '') || [];

  if (validItems.length === 0) {
    return (
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 text-center relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          هیچ آیتمی در آکاردئون وجود ندارد
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {component.title && (
        <h2 className="text-3xl text-gray-900 text-center relative inline-block w-full">
          <span className="relative inline-block">{component.title}</span>
        </h2>
      )}
      <div className="space-y-3" style={bgStyle}>
        {validItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
              dir="rtl"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {index + 1}
                </span>
                <span className="font-semibold text-gray-900 text-lg">{item.title}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 pt-2 text-gray-700 leading-relaxed" dir="rtl">
                <p>{item.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Video List Component Renderer
const VideoListComponentRenderer = ({ component }: { component: VideoListPreviewComponent }) => {
  const [selectedVideo, setSelectedVideo] = useState<{ link: string; title: string } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const validVideos = component.videos?.filter(video => video && video.link && video.link.trim() !== '') || [];

  if (validVideos.length === 0) {
    return (
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          هیچ ویدیویی در لیست وجود ندارد
        </div>
      </section>
    );
  }

  const handleVideoClick = (video: { link: string; title: string }) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  // Convert video URL to embed format if needed
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    
    // If already an embed URL or other format, return as is
    return url;
  };

  const bgColor = component.backgroundColor;
  const bgStyle = !bgColor || bgColor === 'transparent' ? {} : { backgroundColor: bgColor };

  return (
    <>
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={bgStyle}>
          {validVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoClick({ link: video.link, title: video.title })}
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
            {selectedVideo?.link && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(selectedVideo.link)}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Grid Component Renderer
const GridComponentRenderer = ({ component }: { component: GridPreviewComponent }) => {
  const validItems = component.items?.filter(item => item && item.title && item.title.trim() !== '') || [];
  const bgColor = component.backgroundColor;
  const bgStyle = !bgColor || bgColor === 'transparent' ? {} : { backgroundColor: bgColor };

  if (validItems.length === 0) {
    return (
      <section className="space-y-6">
        {component.title && (
          <h2 className="text-3xl text-gray-900 relative inline-block w-full">
            <span className="relative inline-block">{component.title}</span>
          </h2>
        )}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          هیچ آیتمی در گرید وجود ندارد
        </div>
      </section>
    );
  }

  // Determine grid columns class based on component.columns
  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[component.columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="space-y-6">
      {component.title && (
        <h2 className="text-3xl text-gray-900 relative inline-block w-full">
          <span className="relative inline-block">{component.title}</span>
        </h2>
      )}
      <div className={`grid ${gridColsClass} gap-6`} style={bgStyle}>
        {validItems.map((item) => {
          const IconComponent = getIconComponent(item.icon);
          
          // Helper function to determine if color is light or dark
          const isLightColor = (hex: string): boolean => {
            if (!hex) return false;
            const rgb = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (!rgb) return false;
            const r = parseInt(rgb[1], 16);
            const g = parseInt(rgb[2], 16);
            const b = parseInt(rgb[3], 16);
            // Calculate luminance
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5;
          };

          const bgColor = item.backgroundColor || '#3b82f6';
          const isLight = isLightColor(bgColor);
          const textColor = isLight ? 'text-gray-900' : 'text-white';
          const textColorMuted = isLight ? 'text-gray-700' : 'text-white/90';
          const iconBgColor = isLight ? 'bg-gray-900/10' : 'bg-white/20';
          const iconColor = isLight ? 'text-gray-700' : 'text-white';

          return (
            <div
              key={item.id}
              className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              style={{ backgroundColor: bgColor }}
            >
              <div className="p-6 space-y-4" dir="rtl">
                {IconComponent && (
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full ${iconBgColor} mb-4`}>
                    {React.createElement(IconComponent, { className: `w-8 h-8 ${iconColor}` })}
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${textColor} mb-2`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className={`${textColorMuted} text-sm leading-relaxed`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PreviewComponentRenderer;

