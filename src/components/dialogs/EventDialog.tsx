import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/FileUpload';
import { FilePreviewList } from '@/components/ui/FilePreviewList';
import { Search, X } from 'lucide-react';
import { eventService } from '@/services/eventService';
import { CreateEventData, EventWithPresenters, Instructor, UpdateEventData } from '@/types/event';
import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';
import { useToast } from '@/hooks/use-toast';
import { useStableAuth } from '@/hooks/useStableAuth';

type Mode = 'create' | 'edit';

const formSchema = z.object({
  title: z.string().min(1, 'عنوان رویداد الزامی است'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  registration_link: z.string().url('لینک ثبت‌نام باید معتبر باشد').optional().or(z.literal('')),
  video_url: z.string().url('لینک ویدیو باید معتبر باشد').optional().or(z.literal('')),
  start_date: z.string().min(1, 'تاریخ شروع الزامی است'),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']),
  presenter_ids: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  event?: EventWithPresenters;
  onSuccess: () => void;
}

const EventDialog = ({ open, onOpenChange, mode, event, onSuccess }: EventDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [users, setUsers] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [presenterPickerOpen, setPresenterPickerOpen] = useState(false);
  const [tempPresenterIds, setTempPresenterIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { userId } = useStableAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: mode === 'edit' && event ? event.title : '',
      subtitle: mode === 'edit' && event ? event.subtitle || '' : '',
      description: mode === 'edit' && event ? event.description || '' : '',
      thumbnail: mode === 'edit' && event ? event.thumbnail || '' : '',
      registration_link: mode === 'edit' && event ? event.registration_link || '' : '',
      video_url: mode === 'edit' && event ? event.video_url || '' : '',
      start_date: mode === 'edit' && event && event.start_date
        ? new Date(event.start_date).toISOString().slice(0, 16)
        : '',
      status: mode === 'edit' && event ? event.status : 'upcoming',
      presenter_ids: mode === 'edit' && event ? event.presenters.map(p => p.id) : [],
    },
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      if (mode === 'edit' && event) {
        const presenterIds = event.presenters.map(p => p.id);
        form.reset({
          title: event.title,
          subtitle: event.subtitle || '',
          description: event.description || '',
          thumbnail: event.thumbnail || '',
          registration_link: event.registration_link || '',
          video_url: event.video_url || '',
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          status: event.status,
          presenter_ids: presenterIds,
        });
      }
    }
  }, [open, mode, event, form]);

  const loadUsers = async () => {
    try {
      const data = await eventService.fetchUsersForPresenters();
      setUsers(data as Instructor[]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.toLowerCase();
    const email = user.email ?? ''.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let thumbnailUrl = data.thumbnail || (mode === 'edit' ? event?.thumbnail ?? null : null);

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadPromises = selectedFiles.map(file => uploadFileToSupabase(file, 'event-thumbnails'));
        const uploadResults = await Promise.all(uploadPromises);
        const successfulUploads = uploadResults.filter(url => url !== null);
        if (successfulUploads.length > 0) {
          thumbnailUrl = successfulUploads[0];
        }
        setUploading(false);
      }

      if (mode === 'create') {
        if (!userId) {
          toast({ title: 'خطا', description: 'کاربر وارد نشده است', variant: 'destructive' });
          return;
        }
        
        const payload: CreateEventData = {
          title: data.title,
          subtitle: data.subtitle || null,
          description: data.description || null,
          thumbnail: thumbnailUrl,
          registration_link: data.registration_link || null,
          video_url: data.video_url || null,
          start_date: data.start_date,
          status: data.status,
          created_by: userId,
          presenter_ids: data.presenter_ids || [],
        };
        await eventService.createEvent(payload);
        toast({ title: 'موفقیت', description: 'رویداد با موفقیت ایجاد شد' });
      } else if (mode === 'edit' && event) {
        const payload: UpdateEventData = {
          id: event.id,
          title: data.title,
          subtitle: data.subtitle || null,
          description: data.description || null,
          thumbnail: thumbnailUrl,
          registration_link: data.registration_link || null,
          video_url: data.video_url || null,
          start_date: data.start_date,
          status: data.status,
          presenter_ids: data.presenter_ids || [],
        };
        await eventService.updateEvent(event.id, payload);
        toast({ title: 'موفقیت', description: 'رویداد با موفقیت به‌روزرسانی شد' });
      }

      setSelectedFiles([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({ title: 'خطا', description: 'خطا در ذخیره رویداد', variant: 'destructive' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}> 
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'ایجاد رویداد جدید' : 'ویرایش رویداد'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'اطلاعات رویداد جدید را وارد کنید' : 'اطلاعات رویداد را ویرایش کنید'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان رویداد *</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان رویداد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب وضعیت" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upcoming">آینده</SelectItem>
                        <SelectItem value="ongoing">در حال برگزاری</SelectItem>
                        <SelectItem value="completed">تکمیل شده</SelectItem>
                        <SelectItem value="cancelled">لغو شده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>زیرعنوان</FormLabel>
                  <FormControl>
                    <Input placeholder="زیرعنوان کوتاه رویداد (اختیاری)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="توضیحات رویداد را وارد کنید..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاریخ و زمان شروع *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registration_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لینک ثبت‌نام</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/register" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لینک ویدیو (برای رویدادهای تکمیل شده)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/video" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>تصویر شاخص</FormLabel>
              <div className="space-y-2">
                {mode === 'edit' && event?.thumbnail && selectedFiles.length === 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-2">تصویر فعلی:</p>
                    <img src={event.thumbnail} alt="Current thumbnail" className="w-32 h-20 object-cover rounded border" />
                  </div>
                )}
                <FileUpload
                  onFileChange={setSelectedFiles}
                  disabled={loading || uploading}
                  label={uploading ? 'در حال آپلود...' : (mode === 'edit' ? 'انتخاب تصویر جدید' : 'انتخاب تصویر شاخص')}
                  accept="image/*"
                  multiple={false}
                  maxFiles={1}
                />
                <FilePreviewList
                  attachments={[]}
                  files={selectedFiles}
                  showRemoveButton={true}
                  onRemove={(index) => {
                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                    setSelectedFiles(newFiles);
                  }}
                  imageSize="md"
                />
                <p className="text-xs text-gray-500">{mode === 'edit' ? 'برای تغییر تصویر شاخص، تصویر جدیدی انتخاب کنید' : 'تصویر شاخص رویداد را انتخاب کنید (حداکثر 1 فایل)'}</p>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="presenter_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ارائه‌دهندگان</FormLabel>
                  <div className="space-y-3">
                    {users.filter(u => (field.value || []).includes(u.id)).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {users
                          .filter(u => (field.value || []).includes(u.id))
                          .map((user) => {
                            const selectedIds = field.value || [];
                            return (
                              <div key={user.id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                <span>{`${user.first_name ?? ''} ${user.last_name ?? ''}`}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newIds = selectedIds.filter(id => id !== user.id);
                                    field.onChange(newIds);
                                  }}
                                  className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );  
                          })}
                      </div>
                    )}

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTempPresenterIds(field.value || []);
                          setPresenterPickerOpen(true);
                        }}
                      >
                        انتخاب ارائه‌دهندگان
                      </Button>
                    </div>

                    {/* Presenter Picker Dialog */}
                    <Dialog open={presenterPickerOpen} onOpenChange={setPresenterPickerOpen}>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>انتخاب ارائه‌دهندگان</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                          </div>
                          <div className="border rounded-md max-h-64 overflow-y-auto">
                            {filteredUsers.length === 0 ? (
                              <div className="p-3 text-sm text-gray-500 text-center">{searchTerm ? 'هیچ ارائه‌دهنده‌ای یافت نشد' : 'هیچ ارائه‌دهنده‌ای موجود نیست'}</div>
                            ) : (
                              filteredUsers.map((user) => {
                                const isSelected = tempPresenterIds.includes(user.id);
                                return (
                                  <div
                                    key={user.id}
                                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                                    onClick={() => {
                                      const newIds = isSelected ? tempPresenterIds.filter(id => id !== user.id) : [...tempPresenterIds, user.id];
                                      setTempPresenterIds(newIds);
                                    }}
                                  >
                                    <Checkbox checked={isSelected} onChange={() => {}} />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{user.first_name ?? ''} {user.last_name ?? ''}</div>
                                      <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setPresenterPickerOpen(false)}>انصراف</Button>
                            <Button
                              type="button"
                              onClick={() => {
                                field.onChange(tempPresenterIds);
                                setPresenterPickerOpen(false);
                              }}
                            >
                              تایید
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                انصراف
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading || uploading ? (mode === 'create' ? 'در حال ایجاد...' : 'در حال به‌روزرسانی...') : (mode === 'create' ? 'ایجاد رویداد' : 'به‌روزرسانی رویداد')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;


