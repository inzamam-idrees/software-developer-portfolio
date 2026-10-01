import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import "./css/globals.scss";
import "./css/portfolio.scss";
import { getSiteOrigin } from "@/lib/site-origin.mjs";
const origin = getSiteOrigin();
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  ...(origin ? { metadataBase: new URL(origin) } : {}),
  title: "Inzamam Idrees | Senior Software Engineer",
  description: "Inzamam Idrees is a Senior Software Engineer in Lahore, Pakistan, building web applications with React, Angular, Next.js and Node.js.",
  openGraph: { type: "website", locale: "en_US", siteName: "Inzamam Idrees", title: "Inzamam Idrees | Senior Software Engineer", description: "Web applications, thoughtful systems and readable interfaces." },
  twitter: { card: "summary_large_image", title: "Inzamam Idrees | Senior Software Engineer", description: "Web applications, thoughtful systems and readable interfaces." },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}

        </main>
        <Footer />
        {/^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM || "") && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />}
      </body>
    </html>
  );
}
