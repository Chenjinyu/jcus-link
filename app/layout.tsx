import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JC US Link",
  description: "Ask any questions you have about JC(Jinyu Chen)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div
          className="flex flex-col h-full w-full"
          style={{ background: "rgb(38, 38, 41)" }}
        >
          {/* the chilerend prop in the layout automatically receives the page content */}
          { /* Nuqs is a library to managing URL query parameters as typed state in Rreact apps */}
          <NuqsAdapter>{children}</NuqsAdapter> 
        </div>
      </body>
    </html>
  );
}
