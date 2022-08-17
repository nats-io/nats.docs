const withMarkdoc = require('@markdoc/next.js')
const redirects = require("./redirects.json")

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
    let redirectData = Object.keys(redirects).map((k) => {
      return { source: k, destination: redirects[k], permanent: false }
    })

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
      ...redirectData]
  }
}

module.exports = withMarkdoc()(nextConfig)
