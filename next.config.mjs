import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // Smaller bundles in production
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 3600, // Increase cache TTL for better performance
  },
  // Optimize package imports to reduce bundle size and improve navigation speed
  optimizePackageImports: ['lucide-react', '@heroicons/react'],
  
  // Standalone output for efficient deployment
  output: 'standalone',

  webpack(config, { dev, isServer }) {
    // Only use component-tagger in development to avoid production overhead
    if (dev) {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: '@dhiwise/component-tagger/nextLoader',
        }],
      });

      const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      config.watchOptions = {
        ignored: ignoredPaths.length
          ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
          : undefined,
      };
    }
    
    return config;
  },
};
export default nextConfig;