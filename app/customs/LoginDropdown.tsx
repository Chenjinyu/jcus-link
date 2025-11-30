'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface LoginDropdownProps {
  navbarBg?: string;
  navbarText?: string;
  isDarkTheme?: boolean;
}

export default function LoginDropdown({ navbarBg, navbarText, isDarkTheme = false }: LoginDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hoverStyle = hoveredButton
    ? {
        backgroundColor: '#146585ff',
        color: '#ffffff',
      }
    : {};

  const oauthBtnBaseStyle = {
    borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : '#d1d5db',
    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff',
    color: navbarText,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setHoveredButton('trigger')}
        onMouseLeave={() => setHoveredButton(null)}
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm"
        style={
          hoveredButton === 'trigger'
            ? hoverStyle
            : { backgroundColor: 'transparent', color: navbarText }
        }
      >
        <User className="w-5 h-5" />
        <span>Login</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Popup */}
          <div
            className="
              absolute right-0 mt-2 rounded-2xl shadow-2xl border z-50 
              w-72 sm:w-80
            "
            style={{
              backgroundColor: navbarBg || '#ffffff',
              borderColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
            }}
          >
            <div className="p-5 sm:p-6">
              {/* Title */}
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: navbarText }}
              >
                Welcome Back
              </h2>
              <p
                className="text-sm opacity-70 mb-4 sm:mb-6"
                style={{ color: navbarText }}
              >
                Sign in to save your chat history.
              </p>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                {/* GOOGLE */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full flex items-center justify-center gap-3
                    px-4 py-3 rounded-lg border transition-colors font-medium text-sm
                  "
                  style={oauthBtnBaseStyle}
                >
                  <img src="/icons/google.svg" className="w-5 h-5" />
                  Continue with Google
                </button>

                {/* FACEBOOK */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full flex items-center justify-center gap-3
                    px-4 py-3 rounded-lg 
                    bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium text-sm
                  "
                >
                  <img src="/icons/facebook.svg" className="w-5 h-5" />
                  Continue with Facebook
                </button>

                {/* APPLE */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full flex items-center justify-center gap-3
                    px-4 py-3 rounded-lg 
                    bg-black hover:bg-gray-900 text-white font-medium text-sm
                  "
                >
                  <img src="/icons/apple.svg" className="w-5 h-5" />
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: isDarkTheme ? 'rgba(255,255,255,0.15)' : '#d1d5db' }}
                  />
                </div>
              </div>

              {/* Guest */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: navbarText }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
