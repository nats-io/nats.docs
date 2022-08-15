const withMarkdoc = require('@markdoc/next.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md'],
  experimental: {
    newNextLinkBehavior: true,
    images: {
      allowFutureImage: true,
    },
  },

  async redirects() {
    return [
      {
        source: "/:path*/readme",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/:path*/readme.md",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/:path*.md",
        destination: "/:path*",
        permanent: false,
      },
    ]
  }
}

module.exports = withMarkdoc()(nextConfig)
