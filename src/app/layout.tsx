import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "Taskora",
    template: "%s | Taskora",
  },
  description:
    "A production-style project management platform built with Next.js, Prisma, Auth.js, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const saved = localStorage.getItem('taskora-theme');
              const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = saved || (preferredDark ? 'dark' : 'light');
              document.documentElement.dataset.theme = theme;
            } catch (error) {
              document.documentElement.dataset.theme = 'light';
            }
          `}
        </Script>
      </head>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
