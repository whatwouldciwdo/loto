/** @type {import('next').NextConfig} */
const nextConfig = {
    // Produce a standalone build for small, self-contained Docker images.
    // Skip on Windows dev machines: `output: standalone` triggers a known
    // font-manifest.json prerender bug on Windows. Docker (Linux) sets
    // BUILD_STANDALONE=1 so the standalone output is produced there.
    output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
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
