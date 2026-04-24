/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: 'minio',
            },
        ],
    },
    // Enable experimental features
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
}

export default nextConfig
