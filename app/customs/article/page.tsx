'use client';

import React from 'react';

export default function ArticlePage() {
  // Sample articles - replace with real data later
  const articles = [
    {
      id: 1,
      title: "Getting Started with Next.js 14",
      excerpt: "Learn the basics of Next.js 14 and how to build modern web applications with the app router.",
      date: "2024-11-20",
      author: "JCUS",
      category: "Web Development"
    },
    {
      id: 2,
      title: "Understanding React Server Components",
      excerpt: "A deep dive into React Server Components and how they revolutionize React development.",
      date: "2024-11-15",
      author: "JCUS",
      category: "React"
    },
    {
      id: 3,
      title: "Building AI-Powered Chat Applications",
      excerpt: "Explore how to integrate AI features into your web applications using modern AI SDKs.",
      date: "2024-11-10",
      author: "JCUS",
      category: "AI"
    }
  ];

  return (
    <div className="w-full h-full overflow-auto py-5 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            Articles
          </h1>
          
          <div className="space-y-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 hover:text-blue-600">
                  {article.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{article.author}</span>
                  <span className="mx-2">•</span>
                  <span>{article.date}</span>
                </div>
                <p className="text-gray-700 mb-4">
                  {article.excerpt}
                </p>
                <button className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                  Read more →
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}