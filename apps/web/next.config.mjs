/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    
    return config
  },
  turbopack: {},
  experimental: {
    telemetry: {
      disabled: true,
    },
  },
}

export default nextConfig
