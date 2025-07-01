import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWikiArticleMutation, useWikiCategoriesQuery, useWikiCategoryQuery } from '@/hooks/useWikiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const CreateWikiArticle: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const createArticleMutation = useCreateWikiArticleMutation();
  const { data: categories = [] } = useWikiCategoriesQuery();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topic_id: '',
    order_index: 0,
    is_published: true
  });

  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch topics for the selected category
  const { data: selectedCategoryData, isLoading: isTopicsLoading } = useWikiCategoryQuery(selectedCategory);
  const topics = selectedCategoryData?.topics || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic_id) {
      toast.error('لطفاً یک موضوع انتخاب کنید');
      return;
    }

    try {
      await createArticleMutation.mutateAsync({
        topic_id: formData.topic_id,
        title: formData.title,
        content: formData.content,
        order_index: formData.order_index,
        is_published: formData.is_published
      });
      
      toast.success('مقاله با موفقیت ایجاد شد');
      navigate('/wiki');
    } catch (error) {
      toast.error('خطا در ایجاد مقاله');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({ ...prev, topic_id: '' }));
  };

  if (profile?.role !== 'admin' && profile?.role !== 'trainer') {
    return (
      <DashboardLayout title="ایجاد مقاله جدید">
        <Alert>
          <AlertDescription>
            شما مجوز ایجاد مقاله ندارید.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="ایجاد مقاله جدید">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <button onClick={() => navigate('/wiki')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            بازگشت به ویکی
          </button>
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">ایجاد مقاله جدید</h1>
        <p className="text-gray-600 mt-2">مقاله جدید خود را ایجاد کنید</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>اطلاعات مقاله</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">دسته‌بندی</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
              <Label htmlFor="topic">موضوع</Label>
              <Select value={formData.topic_id} onValueChange={(topicId) => setFormData(prev => ({ ...prev, topic_id: topicId }))} disabled={!selectedCategory || isTopicsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isTopicsLoading ? 'در حال بارگذاری...' : 'موضوع را انتخاب کنید'} />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && !isTopicsLoading && topics.length === 0 && (
                <p className="text-sm text-gray-500">هیچ موضوعی در این دسته‌بندی وجود ندارد.</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">عنوان مقاله</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان مقاله را وارد کنید"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">محتوای مقاله</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="محتوای مقاله را وارد کنید"
                rows={10}
                required
              />
            </div>

            {/* Order Index */}
            <div className="space-y-2">
              <Label htmlFor="order_index">ترتیب نمایش</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Published Status */}
            <div className="space-y-2">
              <Label htmlFor="is_published">وضعیت انتشار</Label>
              <Select 
                value={formData.is_published.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_published: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">منتشر شده</SelectItem>
                  <SelectItem value="false">پیش‌نویس</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={createArticleMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 ml-2" />
                {createArticleMutation.isPending ? 'در حال ایجاد...' : 'ایجاد مقاله'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/wiki')}
              >
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CreateWikiArticle; 