'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import CircuitBackground from "@/app/customs/CircuitBackground";
import { useTheme, Theme, THEME_STYLES } from './context/ThemeContext';

export default function HomePage() {
  const { theme } = useTheme();
  const themeStyle = THEME_STYLES[theme];

  // Determine if theme is light or dark used to change the content font color
  const isLightTheme = theme === Theme.LIGHT || theme === Theme.LIGHT_ORANGE;

  return (
    <div className="relative min-h-screen overflow-visible">
      {/* Animated Circuit Board Background */}
      <CircuitBackground />

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="relative h-20 w-20 sm:h-32 sm:w-32">
              <Image
                src="/logo_black_no_radius.png"
                alt="JCUS.link Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 animate-fade-in-up">
            <span className="text-gray-400" style={{ color: themeStyle.color }}>JCUS.LINK</span>
          </h1>

          {/* Subtitle */}
          <div className="animate-fade-in-up animation-delay-200">
            <p
              className="text-lg sm:text-2xl md:text-4xl text-gray-300 font-light mb-1"
              style={{ color: themeStyle.color, opacity: 0.85 }}
            >
              YOUR GATEWAY
            </p>
            <p
              className="text-lg sm:text-2xl md:text-4xl text-gray-300 font-light mb-8 sm:mb-12"
              style={{ color: themeStyle.color, opacity: 0.85 }}
            >
              TO MY KNOWLEDGE
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 animate-fade-in-up animation-delay-400">
            <Link
              href="/article"
              className="w-full sm:w-auto px-6 py-3 border-2 rounded-lg transition-all duration-300 font-medium text-center"
              style={{
                borderColor: themeStyle.color,
                color: themeStyle.color,
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isLightTheme ? '#004059ff' : themeStyle.color;
                e.currentTarget.style.color = isLightTheme ? '#ffffff' : themeStyle.backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = themeStyle.color;
              }}
            >
              READ ARTICLES
            </Link>

            <Link
              href="/chat"
              className="w-full sm:w-auto px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-center"
              style={{
                backgroundColor: '#004059ff',
                color: '#ffffff',
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#146585ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#004059ff';
              }}
            >
              ASK ME ANYTHING
            </Link>
          </div>

          {/* Articles Section Title */}
          <div className="mt-16 sm:mt-24 animate-fade-in-up animation-delay-600">
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-300 tracking-widest"
              style={{ color: themeStyle.color, opacity: 0.7 }}
            >
              ARTICLES
            </h2>
          </div>
        </div>
      </div>

      {/* Inline animations (kept for convenience) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 1s ease-in; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}
