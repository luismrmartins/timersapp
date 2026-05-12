import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

const TITLE = "Timer Tempo - Run Multiple Timers at Once";
const DESCRIPTION =
  "Free online timer tool. Run multiple timers simultaneously. Perfect for cooking, workouts, studying, and more.";

export const metadata: Metadata = {
  metadataBase: new URL("https://timertempo.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Timer Tempo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-mono">{children}</body>
    </html>
  );
}
