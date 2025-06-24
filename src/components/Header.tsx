import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">آ</span>
            </div>
            <span className="text-xl font-bold text-gray-900 font-peyda">پرتال آموزش فاروباکس</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link to="/" className="text-gray-700 hover:text-teal-600 transition-colors">
              خانه
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-teal-600 transition-colors">
              دوره‌ها
            </Link>
            {(profile?.role === 'trainer' || profile?.role === 'admin') && (
              <Link to="/students" className="text-gray-700 hover:text-teal-600 transition-colors">
                دانشجویان
              </Link>
            )}
            <Link to="/instructors" className="text-gray-700 hover:text-teal-600 transition-colors">
              مربیان
            </Link>
            {profile && (
              <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 transition-colors">
                داشبورد
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
            
            {!loading && (
              profile ? (
                <Link to="/dashboard">
                  <Button variant="outline">
                    <User className="h-4 w-4 ml-2" />
                    {profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'کاربر'}
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link to="/login">
                    <Button variant="outline">
                      <LogIn className="h-4 w-4 ml-2" />
                      ورود
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                      ثبت نام
                    </Button>
                  </Link>
                </div>
              )
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-teal-600 transition-colors">
                خانه
              </Link>
              <Link to="/courses" className="text-gray-700 hover:text-teal-600 transition-colors">
                دوره‌ها
              </Link>
              {(profile?.role === 'trainer' || profile?.role === 'admin') && (
                <Link to="/students" className="text-gray-700 hover:text-teal-600 transition-colors">
                  دانشجویان
                </Link>
              )}
              <Link to="/instructors" className="text-gray-700 hover:text-teal-600 transition-colors">
                مربیان
              </Link>
              {profile && (
                <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 transition-colors">
                  داشبورد
                </Link>
              )}
              {!profile && (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-teal-600 transition-colors">
                    ورود
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-teal-600 transition-colors">
                    ثبت نام
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
