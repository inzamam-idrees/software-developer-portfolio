const path = require("path");

module.exports = {
  // Separate output when running a parallel local preview.
  distDir: process.env.PORTFOLIO_BUILD_DIR || ".next",
  // Inlined at build time; used for sitemap lastmod and JSON-LD dateModified.
  env: {
    PORTFOLIO_BUILD_TIME: new Date().toISOString(),
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "media.dev.to",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "media2.dev.to",
        pathname: "**",
      },
    ],
  },
};
