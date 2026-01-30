import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { getSettings } from "@/lib/settings"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(["siteName", "siteDescription", "favicon"])

  const metadata: Metadata = {
    title: settings.siteName || "Dashboard",
    description: settings.siteDescription || "A modern admin dashboard",
  }

  // Add custom favicon if set
  if (settings.favicon) {
    metadata.icons = {
      icon: settings.favicon,
      shortcut: settings.favicon,
    }
  }

  return metadata
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var root = document.documentElement;

                // Apply theme (light/dark/system)
                var themeKey = 'dashboard-theme';
                var theme = localStorage.getItem(themeKey) || 'dark';
                if (theme === 'system') {
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }

                // Apply primary color
                var colorKey = 'dashboard-primary-color';
                var color = localStorage.getItem(colorKey);
                if (color) {
                  // Convert hex to HSL
                  var hex = color.replace('#', '');
                  var r = parseInt(hex.substring(0, 2), 16) / 255;
                  var g = parseInt(hex.substring(2, 4), 16) / 255;
                  var b = parseInt(hex.substring(4, 6), 16) / 255;
                  var max = Math.max(r, g, b);
                  var min = Math.min(r, g, b);
                  var h = 0, s = 0, l = (max + min) / 2;
                  if (max !== min) {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                      case g: h = ((b - r) / d + 2) / 6; break;
                      case b: h = ((r - g) / d + 4) / 6; break;
                    }
                  }
                  var hsl = (h * 360).toFixed(1) + ' ' + (s * 100).toFixed(1) + '% ' + (l * 100).toFixed(1) + '%';
                  root.style.setProperty('--primary', hsl);
                  root.style.setProperty('--ring', hsl);
                  root.style.setProperty('--sidebar-primary', hsl);
                  root.style.setProperty('--sidebar-ring', hsl);
                  root.style.setProperty('--chart-1', hsl);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
