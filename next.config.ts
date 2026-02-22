import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/?open=about",
        permanent: false,
      },
      {
        source: "/work",
        destination: "/?open=work",
        permanent: false,
      },
      {
        source: "/projects",
        destination: "/?open=work",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/?open=contact",
        permanent: false,
      },
      {
        source: "/writing",
        destination: "/?open=writing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
