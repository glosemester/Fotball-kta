import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "75 Hard",
  description: "Følg med på 75 Hard-utfordringen din: avkryssing av dagens oppgaver og nedtelling.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
