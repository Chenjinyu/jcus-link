// app/page.tsx
'use client';

import React from "react";

// Here is the HOME page.
export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Welcome to JCUS.LINK
        </h1>
        <p className="text-lg opacity-70 mb-8">
          This is your home page. Add your content here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-current border-opacity-20 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">📝 Articles</h3>
            <p className="opacity-70">
              Read my latest articles and blog posts.
            </p>
          </div>
          
          <div className="p-6 border border-current border-opacity-20 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">💬 Chat</h3>
            <p className="opacity-70">
              Chat with me using AI-powered interface.
            </p>
          </div>
          
          <div className="p-6 border border-current border-opacity-20 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">👤 About</h3>
            <p className="opacity-70">
              Learn more about me and my work.
            </p>
          </div>
          
          <div className="p-6 border border-current border-opacity-20 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">🚀 Get Started</h3>
            <p className="opacity-70">
              Explore the navigation menu above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}