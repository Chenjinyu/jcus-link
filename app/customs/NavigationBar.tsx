// frontend/app/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeColorPicker from './theme/ThemeColorPicker';
import LoginDropdown from './LoginDropdown';
import { useTheme, THEME_STYLES } from '@/app/context/ThemeContext';

export default function NavigationBar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const themeStyle = THEME_STYLES[theme];

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Article', path: '/article' },
    { name: 'Chat with Author', path: '/chat' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur"
      style={{ 
        backgroundColor: themeStyle.navbarBg,
        borderColor: themeStyle.navbarBorder,
        color: themeStyle.navbarText,
      }}
    >
      <nav className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold" style={{ color: themeStyle.navbarText }}>
              JCUS.link
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <div className="flex flex-1 items-center">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="transition-colors hover:opacity-80"
                  style={{ 
                    color: isActive ? themeStyle.navbarText : `${themeStyle.navbarText}99`,
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Theme & Login */}
        <div className="flex items-center gap-4">
          {/* Theme Color Picker */}
          <ThemeColorPicker />
          
          {/* Divider */}
          <div 
            className="h-6 w-px" 
            style={{ backgroundColor: themeStyle.navbarBorder }}
          />
          
          {/* Login Dropdown */}
          <LoginDropdown />
        </div>
      </nav>
    </header>
  );
}