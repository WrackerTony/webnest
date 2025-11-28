import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthProvider, ThemeProvider, CursorProvider } from "./contexts";
import { Navbar } from "./components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebNest - Save & Organize Your Websites",
  description:
    "A platform to save, organize, and rate websites in your personal hierarchical folder system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen transition-colors duration-300`}
      >
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider>
              <CursorProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
              </CursorProvider>
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
