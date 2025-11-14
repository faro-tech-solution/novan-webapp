// Types for dynamic preview data components

export type PreviewComponentType = 'text' | 'list' | 'accordion' | 'video_list' | 'grid';

export interface BasePreviewComponent {
  id: string;
  type: PreviewComponentType;
  title: string;
  backgroundColor?: string; // Hex color code, default is transparent
}

export interface TextPreviewComponent extends BasePreviewComponent {
  type: 'text';
  content: string; // Rich text content
}

export interface ListPreviewComponent extends BasePreviewComponent {
  type: 'list';
  items: string[]; // Array of list items
}

export interface AccordionPreviewComponent extends BasePreviewComponent {
  type: 'accordion';
  items: Array<{
    id: string;
    title: string;
    detail: string; // Simple text
  }>;
}

export interface VideoListPreviewComponent extends BasePreviewComponent {
  type: 'video_list';
  videos: Array<{
    id: string;
    link: string; // Video URL
    title: string;
    thumbnail: string; // Thumbnail URL
  }>;
}

export interface GridPreviewComponent extends BasePreviewComponent {
  type: 'grid';
  columns: 2 | 3 | 4; // Number of columns in the grid
  items: Array<{
    id: string;
    title: string;
    description: string;
    icon: string; // Icon name (e.g., "BookOpen", "Award", etc.)
    backgroundColor: string; // Hex color code
  }>;
}

export type PreviewComponent = 
  | TextPreviewComponent 
  | ListPreviewComponent 
  | AccordionPreviewComponent 
  | VideoListPreviewComponent
  | GridPreviewComponent;

export interface CoursePreviewDataStructure {
  components: PreviewComponent[];
}

