import withMarkdoc from '@markdoc/next.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'md'],
  experimental: {
    scrollRestoration: true,
  },
};

export default withMarkdoc()(nextConfig);
