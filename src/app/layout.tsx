import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "DJARA",
  description: "Le talent des femmes, tout près de vous",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}