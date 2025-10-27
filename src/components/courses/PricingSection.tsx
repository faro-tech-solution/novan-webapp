'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface PricingSectionProps {
  price?: number;
  onPaymentRedirect: () => void;
}

const PricingSection = ({ price, onPaymentRedirect }: PricingSectionProps) => {
  const formatPrice = (value?: number) => {
    if (!value || value === 0) return 'رایگان';
    return `${value.toLocaleString('fa-IR')} تومان`;
  };

  return (
    <section className="bg-white rounded-lg p-8 shadow-sm">
      <h2 className="text-3xl text-gray-900 mb-6 text-center relative inline-block w-full">
        <span className="relative inline-block">
          قیمت و شرایط خرید
        </span>
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4" dir="rtl">
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
              <span className="text-gray-700">دسترسی مادام العمر</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
              <span className="text-gray-700">تضمین بازگشت وجه در صورت نارضایتی</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
              <span className="text-gray-700">پشتیبانی یک ساله</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 rotate-180" />
              <span className="text-gray-700">دسترسی رایگان به تمامی آپدیتها</span>
            </li>
          </ul>
        </div>
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-blue-600">{formatPrice(price)}</p>
          </div>
          <Button 
            size="lg" 
            onClick={onPaymentRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full w-full"
          >
            ثبت نام و شرکت در دوره
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;


