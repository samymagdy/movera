/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@company/contracts"],
  images: { unoptimized: true },
  async rewrites() {
    // Browser-facing API URLs can be localhost or a public host. Server-side
    // rewrites run inside the web container and must use the internal API DNS
    // name so uploaded media never loops back to the web container itself.
    const apiOrigin = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    return [{ source: "/uploads/:path*", destination: `${apiOrigin.replace(/\/$/, "")}/uploads/:path*` }];
  },
  async headers() {
    const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:3001";
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: `frame-ancestors 'self' ${adminOrigin}` },
    ] }];
  },
};
export default nextConfig;
