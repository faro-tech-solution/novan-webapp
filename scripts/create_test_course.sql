-- Create a test course with payment data
INSERT INTO public.courses (
  id,
  name,
  description,
  instructor_id,
  status,
  slug,
  price,
  preview_data,
  created_at,
  updated_at
) VALUES (
  'test-course-id-123',
  'برنامه‌نویسی با هوش مصنوعی',
  'دوره جامع برنامه‌نویسی با استفاده از هوش مصنوعی و یادگیری ماشین',
  '11111111-1111-1111-1111-111111111111', -- Test user ID from seed
  'active',
  'programming-with-ai',
  12000000, -- 12,000,000 Toman
  '{
    "topics": [
      "مقدمه‌ای بر هوش مصنوعی",
      "یادگیری ماشین و الگوریتم‌های آن",
      "پردازش زبان طبیعی",
      "بینایی کامپیوتر",
      "شبکه‌های عصبی",
      "پروژه‌های عملی"
    ],
    "description": "<p>این دوره جامع شما را با مفاهیم پیشرفته برنامه‌نویسی با هوش مصنوعی آشنا می‌کند.</p>",
    "differentiators": [
      {
        "title": "پروژه‌های عملی",
        "description": "انجام پروژه‌های واقعی در طول دوره",
        "color": "blue"
      },
      {
        "title": "پشتیبانی کامل",
        "description": "پشتیبانی ۲۴ ساعته از دانشجویان",
        "color": "green"
      }
    ],
    "who_is_for": [
      "برنامه‌نویسان مبتدی",
      "دانشجویان کامپیوتر",
      "علاقه‌مندان به هوش مصنوعی"
    ],
    "faqs": [
      {
        "question": "آیا این دوره برای مبتدیان مناسب است؟",
        "answer": "بله، این دوره از مفاهیم پایه شروع می‌شود."
      }
    ],
    "testimonials": [
      {
        "name": "علی احمدی",
        "rating": 5,
        "text": "دوره بسیار عالی و کاربردی بود."
      }
    ],
    "payments": {
      "zarinpal": "https://zarinpal.com/pg/StartPay/test",
      "stripe": "https://checkout.stripe.com/test"
    },
    "intro_videos": [
      {
        "url": "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "title": "معرفی دوره",
        "duration": "5:30",
        "thumbnail": "/placeholder.svg",
        "description": "معرفی کامل دوره برنامه‌نویسی با هوش مصنوعی"
      }
    ]
  }'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  preview_data = EXCLUDED.preview_data,
  updated_at = NOW();
