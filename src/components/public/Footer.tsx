import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">درباره نوان</h3>
            <p className="text-gray-400 leading-relaxed text-right">
              پلتفرم جامع آموزش آنلاین که مسیر یادگیری شما را هوشمندانه‌تر و مطمئن‌تر می‌کند.
            </p>
            <div className="flex gap-4 justify-end">
              {/* Social Icons */}
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm">T</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm">I</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <span className="text-sm">L</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <h3 className="text-xl font-bold text-white mb-4">لینک‌های مفید</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">صفحه اصلی</Link></li>
              <li><Link href="/portal/login" className="hover:text-blue-400 transition-colors">دوره‌های آموزشی</Link></li>
              <li><Link href="/portal/login" className="hover:text-blue-400 transition-colors">درباره ما</Link></li>
              <li><Link href="/portal/login" className="hover:text-blue-400 transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-right">
            <h3 className="text-xl font-bold text-white mb-4">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-end">
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </li>
              <li className="flex items-center justify-end">
                <span>info@novan.com</span>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </li>
              <li className="text-sm text-gray-400">(۹ صبح تا ۹ شب)</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-right">
            <h3 className="text-xl font-bold text-white mb-4">عضویت در خبرنامه</h3>
            <p className="text-gray-400 mb-4">از جدیدترین دوره‌ها با خبر شوید</p>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 px-6">
                ارسال
              </Button>
              <input 
                type="email" 
                placeholder="ایمیل شما" 
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-600 focus:outline-none text-right"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="text-center text-gray-400">
            <p>کلیه حقوق مادی و معنوی این وب‌سایت متعلق به <span className="text-white">نوان</span> می‌باشد</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

