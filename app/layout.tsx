import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileDock } from "@/components/layout/mobile-dock";
import { ThemeProvider } from "@/components/theme-provider";
import { prestashop } from "@/lib/prestashop/client";
import { getSEO } from "@/lib/cms/client";
import type { Category } from "@/lib/prestashop/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO();

  const title = seo?.metaTitle || "Home Screen";
  const description = seo?.metaDescription || "Sklep internetowy";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: seo?.metaKeywords,
    robots: {
      index: seo?.robotsIndex ?? true,
      follow: seo?.robotsFollow ?? true,
    },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      type: (seo?.ogType === "website" || seo?.ogType === "article" ? seo.ogType : "website") as "website" | "article",
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
    twitter: {
      card: seo?.twitterCard || "summary_large_image",
      site: seo?.twitterSite,
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
    },
    verification: {
      google: seo?.googleVerification,
      other: seo?.bingVerification ? { "msvalidate.01": seo.bingVerification } : {},
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];
  const seo = await getSEO();

  try {
    categories = await prestashop.getCategoriesWithChildren(2);
  } catch (e) {
    console.error("Error fetching categories:", e);
  }

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://presta.trkhspl.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://presta.trkhspl.com" />

        {/* Google Tag Manager */}
        {seo?.googleTagManagerId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${seo.googleTagManagerId}');`}
          </Script>
        )}

        {/* Google Analytics */}
        {seo?.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seo.googleAnalyticsId}');`}
            </Script>
          </>
        )}

        {/* Facebook Pixel */}
        {seo?.facebookPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${seo.facebookPixelId}');
            fbq('track', 'PageView');`}
          </Script>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileDock categories={categories} />
        </ThemeProvider>
      </body>
    </html>
  );
}
