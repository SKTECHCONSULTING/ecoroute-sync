import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from "@/components/configure-amplify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoRoute Sync Admin",
  description: "Logistics monitoring for community organizers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}
