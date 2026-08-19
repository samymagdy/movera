import "./globals.css";
import "./theme.css";
import "./movera-light.css";
export const metadata = {
  title: "MOVERA CMS",
  description: "Structured content administration",
  icons: {
    icon: "/admin-branding/movera-mark.svg",
    shortcut: "/admin-branding/movera-mark.svg",
    apple: "/admin-branding/movera-mark.svg",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { const themeBootstrap = `document.documentElement.dataset.theme = "light"`; return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head><body>{children}</body></html>; }
