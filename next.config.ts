import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Dynamically set Kinde URLs to match the current deployment domain.
// This is the official Kinde fix for the "State not found" error on Vercel.
// VERCEL_URL is automatically set by Vercel for every deployment.
const siteUrl =
  process.env.KINDE_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const nextConfig: NextConfig = {
  env: {
    KINDE_SITE_URL: siteUrl,
    KINDE_POST_LOGOUT_REDIRECT_URL:
      process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? `${siteUrl}/en`,
    KINDE_POST_LOGIN_REDIRECT_URL:
      process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? `${siteUrl}/api/auth/creation`,
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "s.gravatar.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

