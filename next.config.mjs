import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Tree-shake barrel packages — lucide alone is ~44MB unoptimized
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'fumadocs-ui',
      'fumadocs-core',
      '@noble/hashes',
    ],
  },
  async redirects() {
    return [
      // Connect → Get involved (community)
      {
        source: '/connect',
        destination: '/docs/resources/get-involved',
        permanent: true,
      },
      {
        source: '/connect/:path*',
        destination: '/docs/resources/get-involved/:path*',
        permanent: true,
      },
      {
        source: '/docs/connect',
        destination: '/docs/resources/get-involved',
        permanent: true,
      },
      {
        source: '/docs/connect/:path*',
        destination: '/docs/resources/get-involved/:path*',
        permanent: true,
      },
      // Old network join note → primary join guide
      {
        source: '/docs/resources/get-involved/network',
        destination: '/docs/guides/join-network',
        permanent: false,
      },
      // ADRs moved under Guides
      {
        source: '/docs/resources/adrs',
        destination: '/docs/guides/adrs',
        permanent: true,
      },
      {
        source: '/docs/resources/adrs/:path*',
        destination: '/docs/guides/adrs/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // LLMs redirect - must be before docs catch-all
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
      // Legacy pre-migration paths (no /docs/ prefix)
      {
        source: '/guides/:path*',
        destination: '/docs/guides/:path*',
      },
      {
        source: '/validators/:path*',
        destination: '/docs/guides/:path*',
      },
      {
        source: '/developers/:path*',
        destination: '/docs/guides/:path*',
      },
      {
        source: '/overview/:path*',
        destination: '/docs/overview/:path*',
      },
    ];
  },
};

export default withMDX(config);
