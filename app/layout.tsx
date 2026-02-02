import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  variable: "--font-sora",
  weight: "400", // Monospace fonts often have fewer weights, specifying 400 is safe
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneDrop",
  description: "One-time Secure File Sharing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sora.className}>
      <body
        className={`${sora.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
