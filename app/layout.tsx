// app/layout.tsx 
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import NavigationBar from "@/app/customs/NavigationBar";
import { ThemeProvider } from "@/app/context/ThemeContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JCUS.LINK",
  description: "JC(Jinyu Chen) - Personal website with chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ensures mobile devices render at device-width and allow proper zoom/scale */}
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
      </head>

      <body className={`${inter.className} flex flex-col min-h-screen antialiased`}>
        <ThemeProvider>
          <NavigationBar />  
          {/* make main flexible so content fills remaining space and can scroll */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8">
            {/* the chilerend prop in the layout automatically receives the page content */}
            { /* Nuqs is a library to managing URL query parameters as typed state in Rreact apps */}
            <NuqsAdapter>{children}</NuqsAdapter> 
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
