import type { Metadata } from "next";

import "./globals.css";

import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: {
    default: "PeripheralsTalk",
    template: "%s | PeripheralsTalk",
  },
  description: "A structured community knowledge platform for computer peripherals.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
