'use client';

import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl } from '@/components/ui/form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { 
  PreviewComponent, 
  PreviewComponentType,
  TextPreviewComponent,
  ListPreviewComponent,
  AccordionPreviewComponent,
  VideoListPreviewComponent,
  GridPreviewComponent 
} from '@/types/previewData';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PreviewDataBuilderProps {
  value: PreviewComponent[];
  onChange: (components: PreviewComponent[]) => void;
}

const PreviewDataBuilder = ({ value, onChange }: PreviewDataBuilderProps) => {
  const [components, setComponents] = useState<PreviewComponent[]>(value || []);

  // Sync with parent value when it changes
  React.useEffect(() => {
    if (value) {
      setComponents(value);
    }
  }, [value]);

  const updateComponents = (newComponents: PreviewComponent[]) => {
    setComponents(newComponents);
    onChange(newComponents);
  };

  const addComponent = (type: PreviewComponentType) => {
    const newComponent: PreviewComponent = (() => {
      const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const base = { id, title: '', type };

      switch (type) {
        case 'text':
          return { ...base, type: 'text', content: '' } as TextPreviewComponent;
        case 'list':
          return { ...base, type: 'list', items: [''] } as ListPreviewComponent;
        case 'accordion':
          return { 
            ...base, 
            type: 'accordion', 
            items: [{ id: `item-${Date.now()}`, title: '', detail: '' }] 
          } as AccordionPreviewComponent;
        case 'video_list':
          return { 
            ...base, 
            type: 'video_list', 
            videos: [{ id: `video-${Date.now()}`, link: '', title: '', thumbnail: '' }] 
          } as VideoListPreviewComponent;
        case 'grid':
          return { 
            ...base, 
            type: 'grid', 
            columns: 3,
            items: [{ id: `item-${Date.now()}`, title: '', description: '', icon: '', backgroundColor: '#3b82f6' }] 
          } as GridPreviewComponent;
        default:
          throw new Error(`Unknown component type: ${type}`);
      }
    })();

    updateComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    updateComponents(components.filter(comp => comp.id !== id));
  };

  const updateComponent = (id: string, updates: Partial<PreviewComponent>) => {
    updateComponents(
      components.map(comp => comp.id === id ? { ...comp, ...updates } : comp)
    );
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= components.length) return;

    const newComponents = [...components];
    [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
    updateComponents(newComponents);
  };

  const getComponentTypeName = (type: PreviewComponentType): string => {
    const typeNames: Record<PreviewComponentType, string> = {
      text: 'متن',
      list: 'لیست',
      accordion: 'آکاردئون',
      video_list: 'لیست ویدیو',
      grid: 'گرید',
    };
    return typeNames[type];
  };

  const getComponentHeaderTitle = (component: PreviewComponent): string => {
    const typeName = getComponentTypeName(component.type);
    const title = component.title || '(بدون عنوان)';
    return `${typeName} + ${title}`;
  };

  const renderTextComponent = (component: TextPreviewComponent, index: number) => (
    <Accordion key={component.id} type="single" collapsible className="mb-4">
      <AccordionItem value={component.id} className="border rounded-lg">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{getComponentHeaderTitle(component)}</CardTitle>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'down');
                  }}
                  disabled={index === components.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-0">
        <div>
          <Label>عنوان</Label>
          <Input
            value={component.title}
            onChange={(e) => updateComponent(component.id, { title: e.target.value })}
            placeholder="عنوان را وارد کنید"
          />
        </div>
        <div>
          <Label>رنگ پس‌زمینه</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.backgroundColor && component.backgroundColor !== 'transparent' ? component.backgroundColor : '#ffffff'}
              onChange={(e) => updateComponent(component.id, { backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              value={component.backgroundColor || ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateComponent(component.id, { backgroundColor: value === '' || value === 'transparent' ? undefined : value });
              }}
              placeholder="transparent یا #ffffff"
            />
          </div>
        </div>
        <div>
          <Label>محتوای متن</Label>
          <RichTextEditor
            value={component.content}
            onChange={(content) => updateComponent(component.id, { content } as Partial<TextPreviewComponent>)}
            placeholder="محتوای متن را وارد کنید"
            height="200px"
          />
        </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );

  const renderListComponent = (component: ListPreviewComponent, index: number) => (
    <Accordion key={component.id} type="single" collapsible className="mb-4">
      <AccordionItem value={component.id} className="border rounded-lg">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{getComponentHeaderTitle(component)}</CardTitle>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'down');
                  }}
                  disabled={index === components.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-0">
        <div>
          <Label>عنوان</Label>
          <Input
            value={component.title}
            onChange={(e) => updateComponent(component.id, { title: e.target.value })}
            placeholder="عنوان را وارد کنید"
          />
        </div>
        <div>
          <Label>رنگ پس‌زمینه</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.backgroundColor && component.backgroundColor !== 'transparent' ? component.backgroundColor : '#ffffff'}
              onChange={(e) => updateComponent(component.id, { backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              value={component.backgroundColor || ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateComponent(component.id, { backgroundColor: value === '' || value === 'transparent' ? undefined : value });
              }}
              placeholder="transparent یا #ffffff"
            />
          </div>
        </div>
        <div>
          <Label>آیتم‌های لیست</Label>
          {component.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex gap-2 mb-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...component.items];
                  newItems[itemIndex] = e.target.value;
                  updateComponent(component.id, { items: newItems } as Partial<ListPreviewComponent>);
                }}
                placeholder={`آیتم ${itemIndex + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newItems = component.items.filter((_, i) => i !== itemIndex);
                  updateComponent(component.id, { items: newItems } as Partial<ListPreviewComponent>);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItems = [...component.items, ''];
              updateComponent(component.id, { items: newItems } as Partial<ListPreviewComponent>);
            }}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            افزودن آیتم
          </Button>
        </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );

  const renderAccordionComponent = (component: AccordionPreviewComponent, index: number) => (
    <Accordion key={component.id} type="single" collapsible className="mb-4">
      <AccordionItem value={component.id} className="border rounded-lg">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{getComponentHeaderTitle(component)}</CardTitle>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'down');
                  }}
                  disabled={index === components.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-0">
        <div>
          <Label>عنوان بلوک</Label>
          <Input
            value={component.title}
            onChange={(e) => updateComponent(component.id, { title: e.target.value })}
            placeholder="عنوان بلوک را وارد کنید"
          />
        </div>
        <div>
          <Label>رنگ پس‌زمینه</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.backgroundColor && component.backgroundColor !== 'transparent' ? component.backgroundColor : '#ffffff'}
              onChange={(e) => updateComponent(component.id, { backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              value={component.backgroundColor || ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateComponent(component.id, { backgroundColor: value === '' || value === 'transparent' ? undefined : value });
              }}
              placeholder="transparent یا #ffffff"
            />
          </div>
        </div>
        <div>
          <Label>آیتم‌های آکاردئون</Label>
          {component.items.map((item) => (
            <Card key={item.id} className="mb-2">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>عنوان</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = component.items.map(i =>
                            i.id === item.id ? { ...i, title: e.target.value } : i
                          );
                          updateComponent(component.id, { items: newItems } as Partial<AccordionPreviewComponent>);
                        }}
                        placeholder="عنوان آیتم"
                      />
                    </div>
                    <div>
                      <Label>جزئیات</Label>
                      <Textarea
                        value={item.detail}
                        onChange={(e) => {
                          const newItems = component.items.map(i =>
                            i.id === item.id ? { ...i, detail: e.target.value } : i
                          );
                          updateComponent(component.id, { items: newItems } as Partial<AccordionPreviewComponent>);
                        }}
                        placeholder="جزئیات آیتم"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = component.items.filter(i => i.id !== item.id);
                      updateComponent(component.id, { items: newItems } as Partial<AccordionPreviewComponent>);
                    }}
                    className="mr-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItem = {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: '',
                detail: ''
              };
              const newItems = [...component.items, newItem];
              updateComponent(component.id, { items: newItems } as Partial<AccordionPreviewComponent>);
            }}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            افزودن آیتم
          </Button>
        </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );

  const renderVideoListComponent = (component: VideoListPreviewComponent, index: number) => (
    <Accordion key={component.id} type="single" collapsible className="mb-4">
      <AccordionItem value={component.id} className="border rounded-lg">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{getComponentHeaderTitle(component)}</CardTitle>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'down');
                  }}
                  disabled={index === components.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-0">
        <div>
          <Label>عنوان</Label>
          <Input
            value={component.title}
            onChange={(e) => updateComponent(component.id, { title: e.target.value })}
            placeholder="عنوان را وارد کنید"
          />
        </div>
        <div>
          <Label>رنگ پس‌زمینه</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.backgroundColor && component.backgroundColor !== 'transparent' ? component.backgroundColor : '#ffffff'}
              onChange={(e) => updateComponent(component.id, { backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              value={component.backgroundColor || ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateComponent(component.id, { backgroundColor: value === '' || value === 'transparent' ? undefined : value });
              }}
              placeholder="transparent یا #ffffff"
            />
          </div>
        </div>
        <div>
          <Label>ویدیوها</Label>
          {component.videos.map((video) => (
            <Card key={video.id} className="mb-2">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>لینک ویدیو</Label>
                      <Input
                        value={video.link}
                        onChange={(e) => {
                          const newVideos = component.videos.map(v =>
                            v.id === video.id ? { ...v, link: e.target.value } : v
                          );
                          updateComponent(component.id, { videos: newVideos } as Partial<VideoListPreviewComponent>);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>عنوان ویدیو</Label>
                      <Input
                        value={video.title}
                        onChange={(e) => {
                          const newVideos = component.videos.map(v =>
                            v.id === video.id ? { ...v, title: e.target.value } : v
                          );
                          updateComponent(component.id, { videos: newVideos } as Partial<VideoListPreviewComponent>);
                        }}
                        placeholder="عنوان ویدیو"
                      />
                    </div>
                    <div>
                      <Label>لینک تصویر بندانگشتی</Label>
                      <Input
                        value={video.thumbnail}
                        onChange={(e) => {
                          const newVideos = component.videos.map(v =>
                            v.id === video.id ? { ...v, thumbnail: e.target.value } : v
                          );
                          updateComponent(component.id, { videos: newVideos } as Partial<VideoListPreviewComponent>);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newVideos = component.videos.filter(v => v.id !== video.id);
                      updateComponent(component.id, { videos: newVideos } as Partial<VideoListPreviewComponent>);
                    }}
                    className="mr-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newVideo = {
                id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                link: '',
                title: '',
                thumbnail: ''
              };
              const newVideos = [...component.videos, newVideo];
              updateComponent(component.id, { videos: newVideos } as Partial<VideoListPreviewComponent>);
            }}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            افزودن ویدیو
          </Button>
        </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );

  const renderGridComponent = (component: GridPreviewComponent, index: number) => (
    <Accordion key={component.id} type="single" collapsible className="mb-4">
      <AccordionItem value={component.id} className="border rounded-lg">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-lg">{getComponentHeaderTitle(component)}</CardTitle>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'up');
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveComponent(index, 'down');
                  }}
                  disabled={index === components.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeComponent(component.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <CardContent className="space-y-4 pt-0">
        <div>
          <Label>عنوان</Label>
          <Input
            value={component.title}
            onChange={(e) => updateComponent(component.id, { title: e.target.value })}
            placeholder="عنوان را وارد کنید"
          />
        </div>
        <div>
          <Label>رنگ پس‌زمینه</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={component.backgroundColor && component.backgroundColor !== 'transparent' ? component.backgroundColor : '#ffffff'}
              onChange={(e) => updateComponent(component.id, { backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              value={component.backgroundColor || ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateComponent(component.id, { backgroundColor: value === '' || value === 'transparent' ? undefined : value });
              }}
              placeholder="transparent یا #ffffff"
            />
          </div>
        </div>
        <div>
          <Label>تعداد ستون‌ها</Label>
          <Select 
            value={component.columns.toString()} 
            onValueChange={(value) => updateComponent(component.id, { columns: parseInt(value) as 2 | 3 | 4 } as Partial<GridPreviewComponent>)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="تعداد ستون را انتخاب کنید" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="2">2 ستون</SelectItem>
              <SelectItem value="3">3 ستون</SelectItem>
              <SelectItem value="4">4 ستون</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>آیتم‌های گرید</Label>
          {component.items.map((item) => (
            <Card key={item.id} className="mb-2">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>عنوان</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = component.items.map(i =>
                            i.id === item.id ? { ...i, title: e.target.value } : i
                          );
                          updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                        }}
                        placeholder="عنوان آیتم"
                      />
                    </div>
                    <div>
                      <Label>توضیحات</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => {
                          const newItems = component.items.map(i =>
                            i.id === item.id ? { ...i, description: e.target.value } : i
                          );
                          updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                        }}
                        placeholder="توضیحات آیتم"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>نام آیکون (از lucide-react)</Label>
                        <Input
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = component.items.map(i =>
                              i.id === item.id ? { ...i, icon: e.target.value } : i
                            );
                            updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                          }}
                          placeholder="مثال: BookOpen"
                        />
                      </div>
                      <div>
                        <Label>رنگ پس‌زمینه</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={item.backgroundColor}
                            onChange={(e) => {
                              const newItems = component.items.map(i =>
                                i.id === item.id ? { ...i, backgroundColor: e.target.value } : i
                              );
                              updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                            }}
                            className="w-20 h-10"
                          />
                          <Input
                            value={item.backgroundColor}
                            onChange={(e) => {
                              const newItems = component.items.map(i =>
                                i.id === item.id ? { ...i, backgroundColor: e.target.value } : i
                              );
                              updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                            }}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = component.items.filter(i => i.id !== item.id);
                      updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
                    }}
                    className="mr-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItem = {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: '',
                description: '',
                icon: '',
                backgroundColor: '#3b82f6'
              };
              const newItems = [...component.items, newItem];
              updateComponent(component.id, { items: newItems } as Partial<GridPreviewComponent>);
            }}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            افزودن آیتم
          </Button>
        </div>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );

  const renderComponent = (component: PreviewComponent, index: number) => {
    switch (component.type) {
      case 'text':
        return renderTextComponent(component as TextPreviewComponent, index);
      case 'list':
        return renderListComponent(component as ListPreviewComponent, index);
      case 'accordion':
        return renderAccordionComponent(component as AccordionPreviewComponent, index);
      case 'video_list':
        return renderVideoListComponent(component as VideoListPreviewComponent, index);
      case 'grid':
        return renderGridComponent(component as GridPreviewComponent, index);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">داده‌های پیش‌نمایش</Label>
        <Select onValueChange={(value) => addComponent(value as PreviewComponentType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="افزودن کامپوننت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">متن</SelectItem>
            <SelectItem value="list">لیست</SelectItem>
            <SelectItem value="accordion">آکاردئون</SelectItem>
            <SelectItem value="video_list">لیست ویدیو</SelectItem>
            <SelectItem value="grid">گرید</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            هیچ کامپوننتی اضافه نشده است. برای شروع، یک کامپوننت اضافه کنید.
          </CardContent>
        </Card>
      ) : (
        components.map((component, index) => renderComponent(component, index))
      )}
    </div>
  );
};

export default PreviewDataBuilder;

