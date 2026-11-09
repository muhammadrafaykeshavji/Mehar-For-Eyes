import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CoutureBackgroundPrint } from "@/components/CoutureBackgroundPrint";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { HomePageSkeleton } from "@/components/PageSkeletons";
import { StoreChromeWrapper } from "@/components/StoreChromeWrapper";
import { ThemeStyleInjector } from "@/components/ThemeStyleInjector";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${settings.shopName} | Eyewear and optical shop`,
      template: `%s | ${settings.shopName}`,
    },
    description: settings.metaDescription,
    openGraph: {
      siteName: settings.shopName,
      type: "website",
      locale: "en_PK",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeStyleInjector settings={settings} />
        <Suspense fallback={null}>
          <StoreChromeWrapper>
            <CoutureBackgroundPrint
              initialPrint={settings.bgPrint}
              initialIntensity={settings.printIntensity}
              themePreset={settings.themePreset}
            />
            <AnnouncementBar settings={settings} />
            <Header />
          </StoreChromeWrapper>
        </Suspense>
        <main className="relative z-10 flex-1">
          <Suspense fallback={<HomePageSkeleton />}>{children}</Suspense>
        </main>
        <Suspense fallback={null}>
          <StoreChromeWrapper>
            <Footer />
          </StoreChromeWrapper>
        </Suspense>
        <Suspense fallback={null}>
          <LocalBusinessJsonLd />
        </Suspense>
        <Suspense fallback={null}>
          <WhatsAppFloat
            whatsappNumber={settings.whatsappNumber}
            shopName={settings.shopName}
          />
        </Suspense>
      </body>
    </html>
  );
}
