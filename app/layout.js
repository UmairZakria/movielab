import { Poppins, Comfortaa } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { AdProvider } from "@/context/AdContext";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import PageTransition from "./components/PageTransition";
import MicrosoftClarity from "./components/MicrosoftClarity";
import GoogleAnalytics from "./components/GoogleAnalytics";
import MaintenanceGuard from "./components/MaintenanceGuard";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  metadataBase: new URL("https://movieslab.online"),
  title: {
    default: "Movieslab - Watch Free Movies & TV Series Online (HD 1080p)",
    template: "%s | Movieslab",
  },
  description:
    "Movieslab lets you discover and stream trending movies and TV series for free in HD 1080p with no registration. Browse Hollywood, Bollywood, Korean, Anime, web series and more.",
  authors: [{ name: "Umair Lab" }],
  creator: "Movieslab",
  publisher: "Movieslab",
  applicationName: "Movieslab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Root openGraph/twitter intentionally omit `images` so that every
  // child page renders its own dynamic card backed by a TMDB absolute URL.
  // Social crawlers (Facebook, Twitter, LinkedIn, WhatsApp, etc.) require
  // absolute, hot-linkable image URLs at least 600px wide. We previously
  // pointed at /og-image.jpg but that file was never created, so crawlers
  // received a 404 and rendered a blank/white box.
  openGraph: {
    title: "Movieslab - Watch Free Movies & TV Series Online (HD)",
    description:
      "Stream trending movies and TV series for free in HD 1080p on Movieslab. No registration, daily updates, no ads.",
    url: "https://movieslab.online",
    siteName: "Movieslab",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Movieslab - Watch Free Movies & TV Series Online (HD)",
    description:
      "Stream trending movies and TV series for free in HD 1080p on Movieslab. No registration required.",
  },
  alternates: {
    canonical: "https://movieslab.online",
  },
  referrer: "origin",
  verification: {
    google: "VBh8Z5n2gYt-blPxDnyzDu5KU9JOBHYSdaEZmv-s3bk",
    yandex: "03632b5675884ef5",
  },
  other: {
    "viewport-fit": "cover",
    "theme-color": "#000000",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Movieslab",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://image.tmdb.org"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${poppins.variable} ${comfortaa.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Movieslab",
              url: "https://movieslab.online",
            }),
          }}
        />

        <MicrosoftClarity />
        <GoogleAnalytics />

        <AdProvider>
        <AuthProvider>
          <SmoothScrollProvider>
            <MaintenanceGuard>
            <PageTransition>{children}</PageTransition>
            </MaintenanceGuard>
          </SmoothScrollProvider>
        </AuthProvider>
        </AdProvider>
      </body>
    </html>
  );
}
