// app/customs/NavigationBar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeColorPicker from '@/app/customs/theme/ThemeColorPicker';
import LoginDropdown from '@/app/customs/LoginDropdown';
import { useTheme, getComponentStyle } from '@/app/context/ThemeContext';
import { Menu, X } from 'lucide-react';

export default function NavigationBar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const themeStyle = getComponentStyle(theme, 'navigator');

  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Article', path: '/article' },
    { name: 'Chat with Author', path: '/chat' },
    { name: 'About', path: '/about' },
  ];


  return (
    <header
      className="sticky top-0 z-50 w-full border-b-4 backdrop-blur-lg"
      style={{
        backgroundColor: themeStyle.backgroundColor,
        borderColor: themeStyle.borderColor,
        color: themeStyle.color,
      }}
    >
      {/* Navigator Bar Menus */}
      <nav className="container mx-auto flex h-16 items-center px-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo_black.png"
            alt="JCUS.LINK Logo"
            width={120}
            height={40}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </Link>

        {/* Hamburger - mobile only */}
        <button
          className="ml-auto sm:hidden flex items-center justify-center rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X size={26} style={{ color: themeStyle.color }} />
          ) : (
            <Menu size={26} style={{ color: themeStyle.color }} />
          )}
        </button>

        {/* Desktop navigation */}
        <div className="hidden sm:flex flex-1 justify-center">
          <div className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="transition-opacity hover:opacity-80"
                  style={{
                    color: themeStyle.color,
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side - desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeColorPicker />

          <div
            className="h-6 w-px"
            style={{ backgroundColor: themeStyle.borderColor }}
          />

          <LoginDropdown
            navbarBg={themeStyle.backgroundColor}
            navbarText={themeStyle.color}
          />
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          className="sm:hidden px-4 pt-3 pb-5 space-y-3 border-t"
          style={{ borderColor: themeStyle.borderColor }}
        >
          {/* Nav items */}
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base font-medium transition-opacity"
                style={{
                  color: themeStyle.color,
                  opacity: active ? 1 : 0.65,
                }}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Theme + Login */}
          <div className="flex justify-between items-center pt-4 border-t"
            style={{ borderColor: themeStyle.borderColor }}
          >
            <ThemeColorPicker />

            <LoginDropdown
              navbarBg={themeStyle.backgroundColor}
              navbarText={themeStyle.color}
            />
          </div>
        </div>
      )}
    </header>
  );
}
