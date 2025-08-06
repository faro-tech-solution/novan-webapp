import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InstructorCard from "@/components/management/InstructorCard";
import { InstructorCard as InstructorCardType } from "@/types/instructor";

const Instructors = () => {
  const instructors: InstructorCardType[] = [
    {
      id: "1",
      first_name: "Edward",
      last_name: "Norton",
      title: "SEO Specialist",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      students: 1245,
      courses: 12,
      expertise: ["SEO", "Digital Marketing", "Content Strategy"],
    },
    {
      id: "2",
      first_name: "Sarah",
      last_name: "Johnson",
      title: "Content Writer",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b2e3c3e5?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      students: 890,
      courses: 8,
      expertise: ["Writing", "Copywriting", "Storytelling"],
    },
    {
      id: "3",
      first_name: "Michael",
      last_name: "Chen",
      title: "Senior Developer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      students: 2340,
      courses: 15,
      expertise: ["Python", "Web Development", "Data Science"],
    },
    {
      id: "4",
      first_name: "Lisa",
      last_name: "Wong",
      title: "UX Designer",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      students: 1567,
      courses: 10,
      expertise: ["UI/UX", "Design Thinking", "Prototyping"],
    },
    {
      id: "5",
      first_name: "David",
      last_name: "Miller",
      title: "Full Stack Developer",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 4.6,
      students: 1890,
      courses: 18,
      expertise: ["JavaScript", "React", "Node.js"],
    },
    {
      id: "6",
      first_name: "Alex",
      last_name: "Thompson",
      title: "Design Lead",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      students: 1234,
      courses: 14,
      expertise: ["Product Design", "Figma", "Design Systems"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Instructors</h1>
          <p className="text-xl text-teal-100">
            Learn from industry experts and experienced professionals
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.id} {...instructor} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Instructors;
