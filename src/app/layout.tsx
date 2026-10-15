import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "DJARA — Le talent des femmes, tout près de vous",
  description: "Trouvez des femmes talentueuses près de chez vous. Cuisine, beauté, couture, cours, artisanat, digital... DJARA connecte les femmes par leurs savoir-faire.",
  applicationName: "DJARA",
  keywords: ["femmes", "services", "algérie", "marketplace", "talents", "prestataires"],
  authors: [{ name: "DJARA" }],
  openGraph: {
    title: "DJARA — Le talent des femmes, tout près de vous",
    description: "Marketplace communautaire géolocalisée pour les femmes en Algérie.",
    type: "website",
    locale: "fr_DZ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#59364A",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#FAF7F2" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}