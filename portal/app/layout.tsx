import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifest Mailbox Studio",
  description: "Review, approve, and shape the daily manifestation emails.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
