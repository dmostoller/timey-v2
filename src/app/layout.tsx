import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/SessionProvider";
import type React from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timey",
  description: "Smart Timer for Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="min-h-screen bg-background text-foreground">
                <Nav />
                <main className="mx-auto p-4">{children}</main>
                <Toaster />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
