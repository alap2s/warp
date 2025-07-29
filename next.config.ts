import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public",
  register: true,
  sw: "src/app/sw.ts",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
