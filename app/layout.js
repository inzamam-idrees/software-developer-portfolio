import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import "./css/globals.scss";
import "./css/card.scss";
import "./css/portfolio.scss";
import "./css/executive.scss";
import "./css/admin.scss";
import "./css/coding.scss";
import { getSiteOrigin } from "@/lib/site-origin.mjs";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { settings } = await getCurrentPortfolioView();
  const { seo } = settings;
  const origin = getSiteOrigin();
  return {
  ...(origin ? { metadataBase: new URL(origin) } : {}),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    type: "website",
    ...(origin
      ? {
          images: [
            {
              url: seo.openGraph.imagePath,
              width: 1200,
              height: 630,
              alt: seo.openGraph.imageAlt,
            },
          ],
        }
      : {}),
    locale: settings.site.locale.replace("-", "_"),
    siteName: seo.openGraph.siteName,
    title: seo.openGraph.title,
    description: seo.openGraph.description,
  },
  twitter: {
    card: seo.twitter.card,
    ...(origin ? { images: [seo.twitter.imagePath] } : {}),
    title: seo.twitter.title,
    description: seo.twitter.description,
  },
  };
}

export default async function RootLayout({ children }) {
  const portfolio = await getCurrentPortfolioView();
  const { settings } = portfolio;
  return (
    <html lang={settings.site.locale}>
      <body className={inter.className}>
        {children}
        {/^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM || "") && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
        )}
      </body>
    </html>
  );
}
