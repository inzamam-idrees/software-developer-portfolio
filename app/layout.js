import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import "./css/globals.scss";
import "./css/card.scss";
import "./css/portfolio.scss";
import "./css/executive.scss";
import "./css/admin.scss";
import "./css/coding.scss";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";
import { pageMetadata } from "@/lib/seo/metadata.mjs";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { settings } = await getCurrentPortfolioView();
  return pageMetadata(settings, { path: null });
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
