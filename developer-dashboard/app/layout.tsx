import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Dyzo Developer Dashboard | API Documentation & Resources",
  description:
    "Official Dyzo Developer Portal. Access API documentation, project management tools, and developer resources for the Dyzo ecosystem.",
  keywords: [
    "Dyzo",
    "API Documentation",
    "Developer Dashboard",
    "Project Management API",
  ],
  authors: [{ name: "Dyzo Team" }],
  robots: "index, follow",
  icons: {
    icon: "/dyzo-ai-logo.png",
    shortcut: "/dyzo-ai-logo.png",
    apple: "/dyzo-ai-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
