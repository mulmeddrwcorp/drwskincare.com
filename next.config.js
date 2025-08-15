/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drwgroup.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.drwgroup.id',
        port: '',
        pathname: '/**',
      },
      // Allow common CDNs just in case
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com', pathname: '/**' },
      // Vercel Blob public storage (any project subdomain)
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com', pathname: '/**' },
  // Clerk hosted images
  { protocol: 'https', hostname: 'img.clerk.com', pathname: '/**' },
  { protocol: 'https', hostname: 'images.clerk.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
