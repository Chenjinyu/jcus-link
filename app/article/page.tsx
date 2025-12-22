'use client';

import React from 'react';

export default function ArticlePage() {
  const articles = [
    {
      id: 1,
      title: "Getting Started with Next.js 14",
      excerpt: "Learn the basics of Next.js 14 and how to build modern web applications.",
      date: "2024-11-20",
      category: "Web Development"
    },
    {
      id: 2,
      title: "Understanding React Server Components",
      excerpt: "A deep dive into React Server Components and their benefits.",
      date: "2024-11-15",
      category: "React"
    },
    {
      id: 3,
      title: "Building AI-Powered Chat Applications",
      excerpt: "Explore how to integrate AI features into your web applications.",
      date: "2024-11-10",
      category: "AI"
    },
    {
      id: 4,
      title: "Red waves are just a 'Polite suggestion' from a static analysis tool that might not have the full picture.",
      excerpt: "Explore how to integrate AI features into your web applications.",
      date: "2024-11-10",
      category: "AI"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Articles</h1>
        
        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="p-6 border border-current border-opacity-20 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {article.category}
                </span>
                <span className="text-sm opacity-70">{article.date}</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                {article.title}
              </h2>
              <p className="opacity-70 mb-4">
                {article.excerpt}
              </p>
              <button className="text-blue-600 hover:underline text-sm font-medium">
                Read more →
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}