'use client'
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { I18nextProvider } from "@/i18n/i18n"
import { NotificationProvider } from '@/contexts/notification-context';
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { LightAnimatedBackground } from "@/components/ui/animated-background";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Preloader from "@/components/ui/preloader";
import "./globals.css";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "system");

    const handleLoad = () => setLoading(false);
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`} suppressHydrationWarning>
        {loading && <Preloader />}
        <NotificationProvider>
          {theme && ( // Wait for `theme` to install to avoid hydration error
            <ThemeProvider
              attribute="class"
              defaultTheme={theme}
              enableSystem
              disableTransitionOnChange
            >
              <I18nextProvider>
              <LanguageProvider>
                <div className="relative">
                  <div className="dark:hidden">
                    <LightAnimatedBackground />
                  </div>
                  <div className="hidden dark:block">
                    <AnimatedBackground />
                  </div>
                  <div className="relative z-10">
                    {children}
                    </div>
                </div>
              </LanguageProvider>
              </I18nextProvider>
            </ThemeProvider>
          )}
        </NotificationProvider>
      </body>
    </html>
  );
}