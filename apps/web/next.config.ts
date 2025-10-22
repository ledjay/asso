import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/database",
    "@repo/email",
    "@repo/auth",
    "@repo/types",
  ],
  experimental: {
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig);
