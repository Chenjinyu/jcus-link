import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

import NavigationBar from "@/app/customs/NavigationBar";
import { ThemeProvider } from "@/app/context/ThemeContext";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JCUS.LINK",
  description: "JC(Jinyu Chen) - Personal website with articles and chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col h-screen overflow-hidden`}>
        <ThemeProvider>
          <NavigationBar />  
          <main className="min-h-[calc(100vh-4rem)]">
            {/* the chilerend prop in the layout automatically receives the page content */}
            { /* Nuqs is a library to managing URL query parameters as typed state in Rreact apps */}
            <NuqsAdapter>{children}</NuqsAdapter> 
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
