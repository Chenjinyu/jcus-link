'use client';

import React from 'react';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full h-full overflow-auto py-5 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            About Me
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Welcome to My Space
                </h2>
                <p className="text-gray-700 mb-4">
                  Hi, I'm JCUS. This is my personal website where I share my thoughts, 
                  articles, and projects. I'm passionate about web development, AI, 
                  and building innovative solutions.
                </p>
                <p className="text-gray-700 mb-4">
                  I created this space to document my learning journey, share insights 
                  with the community, and connect with like-minded individuals.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  What I Do
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Full-stack web development</li>
                  <li>AI-powered applications</li>
                  <li>Technical writing and documentation</li>
                  <li>Open source contributions</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  Technologies I Use
                </h2>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'React', 'TypeScript', 'Node.js', 'AI/ML', 'Tailwind CSS'].map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">
                  Connect With Me
                </h3>
                <div className="space-y-3">
                  <a 
                    href="mailto:your@email.com" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Email
                  </a>
                  <a 
                    href="https://github.com/Chenjinyu" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5 mr-2" />
                    LinkedIn
                  </a>
                  <a 
                    href="https://twitter.com" 
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Twitter
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Articles Published</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Built</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years Experience</span>
                    <span className="font-semibold">5+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}