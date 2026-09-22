import type { Metadata } from "next";
import "@/styles/globals.css";
import { getSiteConfig } from "@/lib/content/loader";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: {
      template: `%s | ${config.siteName}`,
      default: `${config.siteName} - ${config.headline}`,
    },
    description: config.valueProposition,
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: `${config.siteName} - ${config.headline}`,
      description: config.valueProposition,
      siteName: config.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.siteName} - ${config.headline}`,
      description: config.valueProposition,
    },
    robots: {
      index: process.env.NODE_ENV === "production",
      follow: process.env.NODE_ENV === "production",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Structured Data JSON-LD (Person & ProfessionalService)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: config.siteName,
    jobTitle: config.headline,
    description: config.valueProposition,
    url: siteUrl,
    sameAs: [
      config.githubUrl,
      config.linkedinUrl,
      config.zaloUrl,
    ].filter(Boolean),
  };

  return (
    <html lang={config.defaultLocale || "en"} className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-text antialiased selection:bg-blue-100 selection:text-blue-900">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Navbar siteName={config.siteName} contactCta={config.contactCta} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer config={config} />
      </body>
    </html>
  );
}
