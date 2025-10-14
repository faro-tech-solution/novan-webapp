import React from 'react';

export default function ValuePropositionSection() {
  return (
    <section className="py-10 bg-[#6e61b5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-right space-y-6">
              <h2 className="text-2xl sm:text-2xl font-bold text-gray-900">
                یادگیری هوشمند، آینده غیر قابل انکار
              </h2>
              <p className="text-gray-600 leading-relaxed">
                دنیای آموزش در حال تحول است. برای یادگیری و استفاده از فناوری‌های جدید، 
                شما نیاز دارید تا مسیر درستی طی کنید. ما اینجاییم تا به شما کمک کنیم 
                تا با بهترین روش‌ها و ابزارها به اهدافتان برسید.
              </p>
              
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center bg-white rounded-lg p-6">
                  <div className="text-4xl text-gray-600 mb-2">۱۰،۰۰۰+</div>
                  <div className="text-sm text-gray-600">دانشجو</div>
                </div>
                <div className="text-center bg-white rounded-lg p-6">
                  <div className="text-4xl text-gray-600 mb-2">۵۰۰+</div>
                  <div className="text-sm text-gray-600">ساعت آموزش</div>
                </div>
                <div className="text-center bg-white rounded-lg p-6">
                  <div className="text-4xl text-gray-600 mb-2">۱۵+</div>
                  <div className="text-sm text-gray-600">سال تجربه</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden">
                <video 
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster=""
                >
                  <source 
                    src="https://farobox.io/wp-content/uploads/2025/05/farobox-intro-comp.mp4" 
                    type="video/mp4" 
                  />
                  <p className="text-center p-8 text-gray-600">
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </p>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

