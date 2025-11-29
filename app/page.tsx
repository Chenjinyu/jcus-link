'use client';

import React from "react";

// Here is the HOME page.
export default function Page() {
  return (
    <div className="w-full h-full overflow-auto py-5 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">
            Welcome to JCUS.LINK
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            This is your home page. Add your content here.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">
                🏠 Home
              </h3>
              <p className="text-sm text-gray-600">
                Welcome to my personal website.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-green-600">
                📝 Articles
              </h3>
              <p className="text-sm text-gray-600">
                Read my latest articles and blog posts.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-purple-600">
                💬 Chat
              </h3>
              <p className="text-sm text-gray-600">
                Chat with me using AI-powered interface.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-orange-600">
                👤 About
              </h3>
              <p className="text-sm text-gray-600">
                Learn more about me and my work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}