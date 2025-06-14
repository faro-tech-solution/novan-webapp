
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">TutorialHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Learn new skills from industry experts and advance your career with our comprehensive online courses.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Add: 70-80 Upper St Norwich NR2</p>
              <p>Call: +01 123 5641 231</p>
              <p>Email: info@tutorialhub.co</p>
            </div>
          </div>

          {/* Online Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Online Platform</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link to="/courses" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Course
              </Link>
              <Link to="/instructors" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Instructor
              </Link>
              <Link to="/events" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Events
              </Link>
              <Link to="/instructor-details" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Instructor Details
              </Link>
              <Link to="/purchase-guide" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Purchase Guide
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/gallery" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Gallery
              </Link>
              <Link to="/news" className="block text-gray-400 hover:text-white transition-colors text-sm">
                News & Articles
              </Link>
              <Link to="/faq" className="block text-gray-400 hover:text-white transition-colors text-sm">
                FAQ's
              </Link>
              <Link to="/coming-soon" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Coming Soon
              </Link>
              <Link to="/signin" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Sign In/Registration
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacts</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter your email address to register to our newsletter subscription
            </p>
            <div className="flex space-x-2 mb-4">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button className="bg-teal-500 hover:bg-teal-600">
                Subscribe
              </Button>
            </div>
            <div className="flex space-x-4">
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
          <p>Copyright 2025 TutorialHub | Developed By DevBlink. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
