import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const siteTitle = "Mission Control — Software Developer Portfolio";
const siteDescription =
  "A software developer's portfolio built around a mission-control aesthetic. Showcasing experience, projects, and a passion for the space software industry.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "software developer",
    "portfolio",
    "space software",
    "aerospace",
    "mission control",
  ],
  openGraph: {
    type: "website",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Launch Operations seven-day range status map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="relative z-[1] min-h-screen flex flex-col">
        <Starfield />
        <div className="space-atmosphere" aria-hidden />
        <div className="space-grid" aria-hidden />
        <div className="space-vignette" aria-hidden />
        <Nav />
        <main className="relative z-[2] flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
