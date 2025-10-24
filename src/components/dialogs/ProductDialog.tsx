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
import { productService } from '@/services/productService';
import { CreateProductData, Product } from '@/types/product';
import { uploadFileToSupabase } from '@/utils/uploadImageToSupabase';
import { useToast } from '@/hooks/use-toast';
import { useStableAuth } from '@/hooks/useStableAuth';
import { PRODUCT_CATEGORIES, PRODUCT_TYPE_CONFIG, ACCESS_LEVEL_CONFIG, STATUS_CONFIG } from '@/constants/productConstants';

type Mode = 'create' | 'edit';

const formSchema = z.object({
  title: z.string().min(1, 'عنوان محصول الزامی است'),
  slug: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  product_type: z.enum(['video', 'audio', 'ebook', 'other']),
  file_url: z.string().url('لینک فایل باید معتبر باشد').optional().or(z.literal('')),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  duration: z.number().optional(),
  file_size: z.number().optional(),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد'),
  access_level: z.enum(['public', 'registered', 'paid']),
  is_featured: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'draft']),
});

type FormData = z.infer<typeof formSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  product?: Product;
  onSuccess: () => void;
}

const ProductDialog = ({ open, onOpenChange, mode, product, onSuccess }: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [slugError, setSlugError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userId } = useStableAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: mode === 'edit' && product ? product.title : '',
      slug: mode === 'edit' && product ? product.slug : '',
      description: mode === 'edit' && product ? product.description || '' : '',
      thumbnail: mode === 'edit' && product ? product.thumbnail || '' : '',
      product_type: mode === 'edit' && product ? product.product_type : 'other',
      file_url: mode === 'edit' && product ? product.file_url || '' : '',
      author: mode === 'edit' && product ? product.author || '' : '',
      category: mode === 'edit' && product ? product.category || 'none' : 'none',
      tags: mode === 'edit' && product ? product.tags.join(', ') : '',
      duration: mode === 'edit' && product ? product.duration || undefined : undefined,
      file_size: mode === 'edit' && product ? product.file_size || undefined : undefined,
      price: mode === 'edit' && product ? product.price : 0,
      access_level: mode === 'edit' && product ? product.access_level : 'public',
      is_featured: mode === 'edit' && product ? product.is_featured : false,
      status: mode === 'edit' && product ? product.status : 'active',
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      setSlugError(null);
    }
  }, [open]);

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !value.slug) {
        const slug = value.title
          .toLowerCase()
          .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        form.setValue('slug', slug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setSlugError(null);

      // Check slug uniqueness
      if (data.slug) {
        const isUnique = await productService.checkSlugUnique(data.slug, product?.id);
        if (!isUnique) {
          setSlugError('این آدرس قبلاً استفاده شده است');
          return;
        }
      }

      // Upload thumbnail if selected
      let thumbnailUrl = data.thumbnail;
      if (selectedFiles.length > 0) {
        setUploading(true);
        const file = selectedFiles[0];
        const uploadedUrl = await uploadFileToSupabase(file, 'products');
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        } else {
          toast({
            title: "خطا در آپلود تصویر",
            description: "تصویر شاخص با موفقیت آپلود نشد",
            variant: "destructive",
          });
          return;
        }
        setUploading(false);
      }

      // Prepare product data
      const productData: CreateProductData = {
        title: data.title,
        slug: data.slug || await productService.generateUniqueSlug(data.title, product?.id),
        description: data.description || null,
        thumbnail: thumbnailUrl || null,
        product_type: data.product_type,
        file_url: data.file_url || null,
        author: data.author || null,
        category: data.category === 'none' ? null : data.category || null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        duration: data.duration || null,
        file_size: data.file_size || null,
        price: data.price,
        access_level: data.access_level,
        is_featured: data.is_featured || false,
        status: data.status,
        created_by: userId!,
      };

      if (mode === 'create') {
        await productService.createProduct(productData);
        toast({
          title: "موفقیت",
          description: "محصول با موفقیت ایجاد شد",
        });
      } else {
        await productService.updateProduct(product!.id, {
          ...productData,
          id: product!.id,
        });
        toast({
          title: "موفقیت",
          description: "محصول با موفقیت به‌روزرسانی شد",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره محصول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'ایجاد محصول جدید' : 'ویرایش محصول'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'اطلاعات محصول جدید را وارد کنید' 
              : 'اطلاعات محصول را ویرایش کنید'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان محصول *</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان محصول را وارد کنید" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس محصول</FormLabel>
                    <FormControl>
                      <Input placeholder="آدرس محصول (خودکار تولید می‌شود)" {...field} />
                    </FormControl>
                    {slugError && <p className="text-sm text-red-500">{slugError}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع محصول *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع محصول را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRODUCT_TYPE_CONFIG).map(([type, config]) => (
                          <SelectItem key={type} value={type}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="access_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سطح دسترسی *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="سطح دسترسی را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ACCESS_LEVEL_CONFIG).map(([level, config]) => (
                          <SelectItem key={level} value={level}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نویسنده</FormLabel>
                    <FormControl>
                      <Input placeholder="نام نویسنده" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دسته‌بندی</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">بدون دسته‌بندی</SelectItem>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لینک فایل</FormLabel>
                    <FormControl>
                      <Input placeholder="لینک فایل محصول" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>قیمت (تومان)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="قیمت محصول" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مدت زمان (ثانیه)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="مدت زمان برای ویدیو/صوت" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حجم فایل (بایت)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="حجم فایل" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>برچسب‌ها</FormLabel>
                    <FormControl>
                      <Input placeholder="برچسب‌ها را با کاما جدا کنید" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت محصول" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات محصول</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="توضیحات محصول را وارد کنید"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>تصویر شاخص</FormLabel>
              <div className="space-y-2">
                {mode === 'edit' && product?.thumbnail && selectedFiles.length === 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-2">تصویر فعلی:</p>
                    <img src={product.thumbnail} alt="Current thumbnail" className="w-32 h-20 object-cover rounded border" />
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
                <p className="text-xs text-gray-500">{mode === 'edit' ? 'برای تغییر تصویر شاخص، تصویر جدیدی انتخاب کنید' : 'تصویر شاخص محصول را انتخاب کنید (حداکثر 1 فایل)'}</p>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      محصول ویژه (نمایش در صفحه اصلی)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                انصراف
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading || uploading ? (mode === 'create' ? 'در حال ایجاد...' : 'در حال به‌روزرسانی...') : (mode === 'create' ? 'ایجاد محصول' : 'به‌روزرسانی محصول')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
