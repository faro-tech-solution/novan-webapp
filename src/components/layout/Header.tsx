'use client';

import React from 'react';
import { useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitch } from "./LanguageSwitch";
import { useTranslation } from "@/utils/translations";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  isDashboard?: boolean;
  title?: string;
  showRole?: boolean;
  sidebarTrigger?: React.ReactNode;
  onLogout?: () => void;
}

const Header = ({
  isDashboard,
  title,
  showRole,
  sidebarTrigger,
  onLogout,
}: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, loading } = useAuth();
  const { tCommon, tSidebar } = useTranslation();
  const pathname = usePathname();

  // Only show NotificationBell on trainee dashboard URLs
  const showNotificationBell = pathname?.startsWith('/portal/trainee/') || false;

  return (
    <header style={{ width: '100vw', background: 'transparent', boxShadow: 'none', border: 'none', margin: 0, padding: 0 }}>
      <div style={{ margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div className="flex items-center space-x-4 space-x-reverse">
          
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">آ</span>
            </div>
            <span className="text-xl font-bold text-gray-900 font-yekanbakh">
              {tCommon("portalName")}
            </span>
          

          {isDashboard && (
            <>
              <span className="text-gray-400 hidden md:inline">|</span>
              <h1 className="text-lg font-semibold text-gray-900 font-yekanbakh hidden md:block">
                {title}
              </h1>
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        {/* Removed navigation links for home, dashboard, profile, instructors */}

        {/* Right side actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Removed search button */}
          <LanguageSwitch />
          {showNotificationBell && <NotificationBell />}

          {!loading && (
            <>
              {profile ? (
                isDashboard && (
                  <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-700">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : tCommon("user")}
                      {showRole && `(${tSidebar(profile.role || "user")})`}
                    </span>
                    {onLogout && (
                      <Button variant="ghost" size="sm" onClick={onLogout}>
                        <LogOut className="h-4 w-4 ml-2" />
                        {tCommon("logout")}
                      </Button>
                    )}
                  </div>
                )
              ) : (
                !isDashboard && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Link href="/portal/login">
                      <Button variant="outline">
                        <LogIn className="h-4 w-4 ml-2" />
                        {tCommon("login")}
                      </Button>
                    </Link>
                    <Link href="/portal/register">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                        {tCommon("register")}
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </>
          )}

          {sidebarTrigger}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-teal-600 transition-colors"
                              >
                  {tCommon("home")}
                </Link>
                <Link
                  href="/portal/trainee/all-courses"
                  className="text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {tCommon("courses")}
                </Link>
                {(profile?.role === "trainer" || profile?.role === "admin") && (
                  <Link
                    href="/portal/trainer/students"
                    className="text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    {tCommon("students")}
                  </Link>
                )}
                <Link
                  href="/portal/instructors"
                  className="text-gray-700 hover:text-teal-600 transition-colors"
                >
                  {tCommon("instructors")}
                </Link>
                {profile && (
                  <Link
                    href={profile?.role ? `/portal/${profile.role}/dashboard` : "/"}
                    className="text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    {tCommon("dashboard")}
                  </Link>
                )}
                {!profile && (
                  <>
                    <Link
                      href="/portal/login"
                      className="text-gray-700 hover:text-teal-600 transition-colors"
                    >
                      {tCommon("login")}
                    </Link>
                    <Link
                      href="/portal/register"
                      className="text-gray-700 hover:text-teal-600 transition-colors"
                    >
                      {tCommon("register")}
                    </Link>
                  </>
                )}
              <div className="mt-2 pt-2 border-t">
                <LanguageSwitch />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
