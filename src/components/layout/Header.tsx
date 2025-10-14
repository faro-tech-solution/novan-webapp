'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogIn,
  LogOut,
  LayoutDashboard,
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

  const { profile, loading } = useAuth();
  const { tCommon, tSidebar } = useTranslation();
  const pathname = usePathname();

  // Only show NotificationBell on trainee dashboard URLs
  const showNotificationBell = pathname?.startsWith('/portal/trainee/') || false;
  
  // Check if we're on a public page (not in portal)
  const isPublicPage = !pathname?.startsWith('/portal');
  
  // Get portal dashboard URL based on role
  const getPortalUrl = () => {
    if (!profile?.role) return '/portal/login';
    
    switch (profile.role) {
      case 'admin':
        return '/portal/admin/dashboard';
      case 'trainer':
        return '/portal/trainer/dashboard';
      case 'trainee':
        return '/portal/trainee/all-courses';
      default:
        return '/portal/login';
    }
  };

  return (
    <header style={{ width: '100vw', background: 'transparent', boxShadow: 'none', border: 'none', margin: 0, padding: 0 }}>
      <div style={{ margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">آ</span>
            </div>
            <span className="text-xl font-bold text-gray-900 font-yekanbakh">
              {tCommon("portalName")}
            </span>
          </Link>

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
                <>
                  {/* Show Portal link when on public pages */}
                  {isPublicPage && (
                    <Link href={getPortalUrl()}>
                      <Button variant="outline" size="sm">
                        <LayoutDashboard className="h-4 w-4 ml-2" />
                        پورتال
                      </Button>
                    </Link>
                  )}
                  
                  {/* Show user info when in dashboard */}
                  {isDashboard && (
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
                  )}
                </>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
