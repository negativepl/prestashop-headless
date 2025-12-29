import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileDock } from "@/components/layout/mobile-dock";
import { ThemeProvider } from "@/components/theme-provider";
import { prestashop } from "@/lib/prestashop/client";
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

export const metadata: Metadata = {
  title: "PrestaShop Headless",
  description: "Next.js frontend for PrestaShop",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];

  try {
    categories = await prestashop.getCategoriesWithChildren(2);
  } catch (e) {
    console.error("Error fetching categories:", e);
  }

  return (
    <html lang="pl" suppressHydrationWarning>
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
