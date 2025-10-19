'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicCourse } from '@/types/course';
import { 
  ChevronLeft, 
  CreditCard, 
  ExternalLink, 
  Banknote,
  ArrowRight,
  Coins,
  Copy,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentPageProps {
  course: PublicCourse;
}

const PaymentPage = ({ course }: PaymentPageProps) => {
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  const [showBankTransferDetails, setShowBankTransferDetails] = useState(false);
  const previewData = course.preview_data;

  const formatPrice = (price?: number) => {
    if (!price || price === 0) {
      return 'رایگان';
    }
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('آدرس کیف پول کپی شد!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('خطا در کپی کردن آدرس');
    }
  };

  const handlePaymentClick = (method: string, url: string) => {
    if (method === 'crypto') {
      setShowCryptoDetails(true);
      setShowBankTransferDetails(false); // Hide bank transfer details
    } else if (method === 'bank_transfer') {
      setShowBankTransferDetails(true);
      setShowCryptoDetails(false); // Hide crypto details
    } else {
      // Open Zarinpal or Stripe in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600" dir="rtl">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              خانه
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href="/" className="hover:text-blue-600 transition-colors">
              دوره‌های آموزشی
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href={`/courses/${course.slug}`} className="hover:text-blue-600 transition-colors">
              {course.name}
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-900 font-medium">پرداخت</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              تکمیل خرید دوره
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {course.name}
            </p>
            <div className="bg-blue-50 rounded-lg p-6 inline-block">
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(course.price)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                دسترسی مادام‌العمر به دوره
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Zarinpal Payment */}
            {previewData?.payments?.zarinpal && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm" dir="rtl">
                    پرداخت آنلاین زرین‌پال
                  </h3>
                  <p className="text-gray-600 text-xs" dir="rtl">
                    پرداخت امن و سریع
                  </p>
                  <Button
                    onClick={() => handlePaymentClick('zarinpal', previewData.payments.zarinpal)}
                    size="sm"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 ml-1" />
                    پرداخت
                  </Button>
                </div>
              </Card>
            )}

            {/* Bank Transfer Payment */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm" dir="rtl">
                  واریز بانکی
                </h3>
                <p className="text-gray-600 text-xs" dir="rtl">
                  بدون کارمزد اضافی
                </p>
                <Button
                  onClick={() => handlePaymentClick('bank_transfer', '')}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-xs"
                >
                  <Banknote className="w-3 h-3 ml-1" />
                  مشاهده
                </Button>
              </div>
            </Card>

            {/* Stripe Payment */}
            {previewData?.payments?.stripe && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm" dir="rtl">
                    پرداخت استرایپ
                  </h3>
                  <p className="text-gray-600 text-xs" dir="rtl">
                    کارت‌های بین‌المللی
                  </p>
                  <Button
                    onClick={() => handlePaymentClick('stripe', previewData.payments.stripe)}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 ml-1" />
                    پرداخت
                  </Button>
                </div>
              </Card>
            )}

            {/* Crypto Payment */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm" dir="rtl">
                  پرداخت USDT
                </h3>
                <p className="text-gray-600 text-xs" dir="rtl">
                  ارز دیجیتال
                </p>
                <Button
                  onClick={() => handlePaymentClick('crypto', '')}
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs"
                >
                  <Coins className="w-3 h-3 ml-1" />
                  مشاهده
                </Button>
              </div>
            </Card>
          </div>


          {/* Crypto Payment Details */}
          {showCryptoDetails && (
            <Card className="mb-8 bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-600" />
                  </div>
                  اطلاعات پرداخت با USDT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Payment Amount */}
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3" dir="rtl">
                      مبلغ پرداخت:
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="text-right" dir="rtl">
                        <p className="text-sm text-gray-600">مبلغ به تومان:</p>
                        <p className="text-lg font-bold text-blue-600">{formatPrice(course.price)}</p>
                      </div>
                      <div className="text-right" dir="rtl">
                        <p className="text-sm text-gray-600">مبلغ به USDT:</p>
                        <p className="text-lg font-bold text-yellow-600">120 USDT</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Information */}
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-3" dir="rtl">
                      اطلاعات کیف پول:
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1" dir="rtl">شبکه:</p>
                        <p className="font-medium text-gray-900">TRON (TRC-20)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1" dir="rtl">آدرس کیف پول:</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1 break-all">
                          TPBXx7o2cBBc52R7XnNtMWaaJzFw3KDn52
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE')}
                            className="flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1" dir="rtl">نوع ارز:</p>
                        <p className="font-medium text-gray-900">USDT (Tether)</p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3" dir="rtl">
                      دستورالعمل پرداخت:
                    </h4>
                    <ol className="space-y-2 text-sm text-yellow-800" dir="rtl">
                      <li className="flex items-start gap-2">
                        <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <span>مبلغ 120 USDT را به آدرس کیف پول بالا ارسال کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <span>اطمینان حاصل کنید که از شبکه TRON (TRC-20) استفاده می‌کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span>پس از ارسال، هش تراکنش را به تلگرام ارسال کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        <span>دسترسی شما پس از تایید تراکنش فعال خواهد شد</span>
                      </li>
                    </ol>
                  </div>

                  {/* Warning */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800" dir="rtl">
                      <strong>هشدار:</strong> لطفاً دقت کنید که از شبکه TRON (TRC-20) استفاده کنید. ارسال از شبکه‌های دیگر ممکن است منجر به از دست رفتن ارز شود.
                    </p>
                  </div>

                  {/* Telegram Support */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800 mb-3" dir="rtl">
                      برای ارسال هش تراکنش یا سوالات خود:
                    </p>
                    <a
                      href="https://t.me/tadayonTalks_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      تماس با پشتیبانی در تلگرام
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Transfer Details */}
          {showBankTransferDetails && 
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  اطلاعات پرداخت از طریق واریز بانکی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Payment Amount */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3" dir="rtl">
                      مبلغ پرداخت:
                    </h4>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatPrice(course.price)}</p>
                      <p className="text-sm text-gray-600 mt-1" dir="rtl">
                        مبلغ دقیق واریز
                      </p>
                    </div>
                  </div>

                  {/* Bank Information */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-3" dir="rtl">
                      اطلاعات حساب بانکی:
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600" dir="rtl">نام صاحب حساب:</span>
                        <span className="font-medium text-gray-900">حمید تدینی بستکان</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600" dir="rtl">شماره حساب:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">6219-8610-7740-6329</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard('6219-8610-7740-6329')}
                            className="flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600" dir="rtl">شماره شبا:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">IR88 0560 0801 7770 3196 2930 01</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard('IR880560080177703196293001')}
                            className="flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600" dir="rtl">نام بانک:</span>
                        <span className="font-medium text-gray-900">بانک سامان</span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Card Image */}
                  <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
                    <h4 className="font-semibold text-gray-900 mb-3" dir="rtl">
                      تصویر کارت بانکی:
                    </h4>
                    <Image
                      src="/bank-card.jpg"
                      alt="اطلاعات کارت بانکی"
                      width={600}
                      height={400}
                      className="mx-auto rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3" dir="rtl">
                      دستورالعمل پرداخت:
                    </h4>
                    <ol className="space-y-2 text-sm text-green-800" dir="rtl">
                      <li className="flex items-start gap-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <span>مبلغ {formatPrice(course.price)} را به حساب بانکی بالا واریز کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <span>پس از واریز، تصویر فیش واریزی را تهیه کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span>تصویر فیش را به تلگرام ارسال کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        <span>دسترسی شما حداکثر ظرف ۲۴ ساعت فعال خواهد شد</span>
                      </li>
                    </ol>
                  </div>

                  {/* Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800" dir="rtl">
                      <strong>نکته:</strong> لطفاً در هنگام واریز، نام دوره را در قسمت توضیحات فیش ذکر کنید تا پردازش سریع‌تر انجام شود.
                    </p>
                  </div>

                  {/* Telegram Support */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-800 mb-3" dir="rtl">
                      برای ارسال تصویر فیش یا سوالات خود:
                    </p>
                    <a
                      href="https://t.me/tadayonTalks_support"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      تماس با پشتیبانی در تلگرام
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          }

          {/* Important Notes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-4" dir="rtl">
                نکات مهم:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800" dir="rtl">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  پس از پرداخت موفق، دسترسی شما به دوره بلافاصله فعال می‌شود
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  در صورت واریز بانکی، حداکثر ۲۴ ساعت طول می‌کشد تا دسترسی فعال شود
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  پرداخت‌های ارز دیجیتال پس از تایید تراکنش فعال می‌شوند
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  تمام پرداخت‌ها تحت پوشش ضمانت بازگشت وجه قرار دارند
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  در صورت بروز مشکل، با پشتیبانی در تلگرام تماس بگیرید
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to Course */}
          <div className="text-center mt-8">
            <Link href={`/courses/${course.slug}`}>
              <Button variant="outline" className="mr-4">
                <ChevronLeft className="w-4 h-4 ml-2" />
                بازگشت به صفحه دوره
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
