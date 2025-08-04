import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  swSrc: "src/lib/sw.ts",
  disable: false, // Enabled for development to allow testing
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
