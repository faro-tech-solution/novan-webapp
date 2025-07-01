
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">آ</span>
              </div>
              <span className="text-xl font-bold font-peyda">پورتال آموزش فاروباکس</span>
            </div>
            <p className="text-gray-400 text-sm">
              مهارت‌های جدید را از متخصصان صنعت یاد بگیرید و با دوره‌های آنلاین جامع ما، حرفه خود را پیش ببرید.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>ایمیل: info@farobox.io</p>
            </div>
          </div>

          {/* Online Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-peyda">پلتفرم آنلاین</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                درباره ما
              </Link>
              <Link to="/courses" className="block text-gray-400 hover:text-white transition-colors text-sm">
                دوره‌ها
              </Link>
              <Link to="/instructors" className="block text-gray-400 hover:text-white transition-colors text-sm">
                مربیان
              </Link>
              <Link to="/events" className="block text-gray-400 hover:text-white transition-colors text-sm">
                رویدادها
              </Link>
              <Link to="/instructor-details" className="block text-gray-400 hover:text-white transition-colors text-sm">
                جزئیات مربیان
              </Link>
              <Link to="/purchase-guide" className="block text-gray-400 hover:text-white transition-colors text-sm">
                راهنمای خرید
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-peyda">لینک‌ها</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                تماس با ما
              </Link>
              <Link to="/gallery" className="block text-gray-400 hover:text-white transition-colors text-sm">
                گالری
              </Link>
              <Link to="/news" className="block text-gray-400 hover:text-white transition-colors text-sm">
                اخبار و مقالات
              </Link>
              <Link to="/faq" className="block text-gray-400 hover:text-white transition-colors text-sm">
                سوالات متداول
              </Link>
              <Link to="/coming-soon" className="block text-gray-400 hover:text-white transition-colors text-sm">
                به زودی
              </Link>
              <Link to="/signin" className="block text-gray-400 hover:text-white transition-colors text-sm">
                ورود/ثبت نام
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-peyda">تماس</h3>
            <p className="text-gray-400 text-sm mb-4">
              آدرس ایمیل خود را وارد کنید تا در خبرنامه ما ثبت نام شوید
            </p>
            <div className="flex space-x-2 space-x-reverse mb-4">
              <Input
                type="email"
                placeholder="ایمیل شما"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="bg-teal-500 hover:bg-teal-600">
                عضویت
              </Button>
            </div>
            <div className="flex space-x-4 space-x-reverse">
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>کپی‌رایت ۱۴۰۳ پورتال آموزش فاروباکس | توسعه یافته توسط DevBlink. تمام حقوق محفوظ است</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
