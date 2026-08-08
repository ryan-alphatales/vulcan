import type { NextConfig } from "next";

function allowedDevelopmentOrigins(): string[] {
  const appUrl = process.env.APP_URL;
  if (!appUrl) return [];

  try {
    return [new URL(appUrl).host];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // A locally configured tunnel is the browser origin during remote device
  // testing. Next.js otherwise blocks its development assets before forms can
  // submit through that origin.
  allowedDevOrigins: allowedDevelopmentOrigins(),
  serverExternalPackages: ["bullmq", "ioredis"],
};

export default nextConfig;
