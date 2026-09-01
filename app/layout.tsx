import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { siteConfig } from "@/lib/site-config";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: siteConfig.meta.title,
  description: siteConfig.meta.description,
  metadataBase: new URL(siteConfig.siteUrl),
  openGraph: {
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    url: siteConfig.siteUrl,
    siteName: "TIMESHOP",
    locale: "es_MX",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <CartProvider>
          <div className="shell">
            <Header />
            <main className="page-wrap">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
