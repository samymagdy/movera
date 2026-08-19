import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MOVERA — Mobility intelligence",
  description: "MOVERA connects autonomous systems, intelligent vehicles, and the people who keep mobility moving.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: { icon: "/branding/movera-mark.svg", shortcut: "/branding/movera-mark.svg", apple: "/branding/movera-mark.svg" },
};

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
