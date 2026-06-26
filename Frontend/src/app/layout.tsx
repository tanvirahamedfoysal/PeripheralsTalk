import type { Metadata } from "next";
import Script from "next/script";

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
      <head>
        <Script id="mathjax-configuration" strategy="beforeInteractive">
          {`window.MathJax = {
            tex: {
              inlineMath: [['\\\\(', '\\\\)']],
              displayMath: [['\\\\[', '\\\\]']],
              processEscapes: true,
              processEnvironments: true
            },
            options: {
              enableMenu: false,
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            },
            startup: { typeset: false }
          };`}
        </Script>
        <Script
          id="mathjax-runtime"
          src="/mathjax/es5/tex-mml-chtml.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
