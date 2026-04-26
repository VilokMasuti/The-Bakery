import type { Metadata } from "next";
import { Inter, Playfair_Display, Sora } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./globals.css";
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})


const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'The Bakery',
    template: '%s | The Bakery',
  },
  description: 'Fresh artisan baked goods delivered to your door',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", sora.variable, playfair.variable, inter.variable)}
    >
      <body className="min-h-full ">

        <TooltipProvider delayDuration={120}>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>

      </body>
    </html>
  );
}
