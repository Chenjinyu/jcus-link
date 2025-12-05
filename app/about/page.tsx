// app/about/page.tsx
'use client';

import React from 'react';
import { useTheme, getComponentStyle } from '../context/ThemeContext';

export default function AboutPage() {
  const { theme } = useTheme();
  const themeStyle = getComponentStyle(theme, 'navigator');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div 
          className="p-8 rounded-lg border-2"
          style={{ borderColor: themeStyle.borderColor }}
        >
          <h1 className="text-4xl font-bold mb-8">About Me</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
              <p className="opacity-80 leading-relaxed">
                Hi, I'm JCUS. This is my personal website where I share my thoughts, 
                articles, and projects. I'm passionate about web development, AI, 
                and building innovative solutions.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">What I Do</h2>
              <ul className="list-disc list-inside space-y-2 opacity-80">
                <li>Full-stack web development</li>
                <li>AI-powered applications</li>
                <li>Technical writing and documentation</li>
                <li>Open source contributions</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'TypeScript', 'Node.js', 'AI/ML', 'Tailwind CSS'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-3 py-1 rounded-full text-sm border border-current border-opacity-30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Connect</h2>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/Chenjinyu" 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a 
                  href="mailto:your@email.com" 
                  className="text-blue-600 hover:underline"
                >
                  Email
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}