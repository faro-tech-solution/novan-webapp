'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  // Handle password reset redirect from root domain
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    const currentPath = window.location.pathname;
    
    // If we're on the root domain and have a hash with access_token, redirect to forget password
    if (currentPath === '/' && hash && hash.includes("access_token=")) {
      console.log("Redirecting from root to forget password page");
      window.location.href = `/portal/forget_password${hash}`;
      return;
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold text-gray-900 mb-4">
              خوش آمدید به پلتفرم یادگیری
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 leading-relaxed">
              پلتفرم جامع آموزش آنلاین برای یادگیری مهارت‌های جدید و پیشرفت در مسیر شغلی شما
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-700 text-base">
                برای شروع، لطفاً وارد حساب کاربری خود شوید یا ثبت نام کنید
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/portal/login" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-48 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ورود
                  </Button>
                </Link>
                
                <Link href="/portal/register" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-48 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    ثبت نام
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">دوره‌های با کیفیت</h3>
                  <p className="text-sm text-gray-600">دسترسی به بهترین محتوای آموزشی</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">یادگیری تعاملی</h3>
                  <p className="text-sm text-gray-600">تمرین‌های عملی و پروژه‌های واقعی</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">پشتیبانی کامل</h3>
                  <p className="text-sm text-gray-600">مربیان متخصص و جامعه یادگیری</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 