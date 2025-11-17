/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark twilio as external to avoid bundling it
      config.externals = config.externals || []
      config.externals.push('twilio')
    }
    return config
  },
}

module.exports = nextConfig
