/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@company/contracts"],
  async rewrites() {
    const publicOrigin = process.env.INTERNAL_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "http://web:3000";
    return [{
      source: "/admin-branding/:path*",
      destination: `${publicOrigin.replace(/\/$/, "")}/branding/:path*`,
    }];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }];
  },
};
export default nextConfig;
