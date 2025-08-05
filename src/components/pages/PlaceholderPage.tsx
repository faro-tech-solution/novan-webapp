'use client';

import React from 'react';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title = "صفحه در حال توسعه", 
  description = "این صفحه در حال توسعه است و به زودی در دسترس خواهد بود." 
}) => {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Export commonly used placeholder components
export const Login = () => <PlaceholderPage title="ورود" description="صفحه ورود در حال توسعه است." />;
export const Register = () => <PlaceholderPage title="ثبت نام" description="صفحه ثبت نام در حال توسعه است." />;
export const ForgetPassword = () => <PlaceholderPage title="فراموشی رمز عبور" description="صفحه فراموشی رمز عبور در حال توسعه است." />;
export const NotFound = () => <PlaceholderPage title="صفحه یافت نشد" description="صفحه مورد نظر یافت نشد." />;
export const AdminDashboard = () => <PlaceholderPage title="داشبورد مدیر" description="داشبورد مدیر در حال توسعه است." />;
export const TrainerDashboard = () => <PlaceholderPage title="داشبورد مدرس" description="داشبورد مدرس در حال توسعه است." />;
export const TraineeDashboard = () => <PlaceholderPage title="داشبورد دانشجو" description="داشبورد دانشجو در حال توسعه است." />;
export const Exercises = () => <PlaceholderPage title="تمرینات" description="صفحه تمرینات در حال توسعه است." />;
export const ExerciseDetail = () => <PlaceholderPage title="جزئیات تمرین" description="صفحه جزئیات تمرین در حال توسعه است." />;
export const Profile = () => <PlaceholderPage title="پروفایل" description="صفحه پروفایل در حال توسعه است." />;
export const Students = () => <PlaceholderPage title="دانشجویان" description="صفحه دانشجویان در حال توسعه است." />;
export const Instructors = () => <PlaceholderPage title="مدرسین" description="صفحه مدرسین در حال توسعه است." />;
export const Courses = () => <PlaceholderPage title="دوره‌ها" description="صفحه دوره‌ها در حال توسعه است." />;
export const CourseManagement = () => <PlaceholderPage title="مدیریت دوره‌ها" description="صفحه مدیریت دوره‌ها در حال توسعه است." />;
export const Accounting = () => <PlaceholderPage title="حسابداری" description="صفحه حسابداری در حال توسعه است." />;
export const UserManagement = () => <PlaceholderPage title="مدیریت کاربران" description="صفحه مدیریت کاربران در حال توسعه است." />;
export const ReviewSubmissions = () => <PlaceholderPage title="بررسی ارسال‌ها" description="صفحه بررسی ارسال‌ها در حال توسعه است." />;
export const MyExercises = () => <PlaceholderPage title="تمرینات من" description="صفحه تمرینات من در حال توسعه است." />;
export const Progress = () => <PlaceholderPage title="پیشرفت" description="صفحه پیشرفت در حال توسعه است." />;
export const StudentCourses = () => <PlaceholderPage title="دوره‌های دانشجو" description="صفحه دوره‌های دانشجو در حال توسعه است." />;
export const AllCoursesTrainee = () => <PlaceholderPage title="همه دوره‌ها" description="صفحه همه دوره‌ها در حال توسعه است." />; 