import { withPayload } from "@payloadcms/next/withPayload";
export default withPayload({
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer && config.optimization.splitChunks) {
      // Keep the small shared form independent of article-only chart/map
      // entry chunks selected by the client-reference manifest.
      const split = config.optimization.splitChunks;
      split.cacheGroups = {
        ...split.cacheGroups,
        newsletterRegistration: {
          test: /[\\/]src[\\/]components[\\/]NewsletterRegistration\.tsx$/,
          name: "newsletter-registration",
          chunks: "all",
          enforce: true,
          priority: 50,
        },
      };
    }
    return config;
  },
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/social-image/" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
});
