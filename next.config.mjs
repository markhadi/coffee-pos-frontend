/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * API Route Rewrites Configuration
   *
   * Redirects all /api/* requests to the backend server
   * This allows the frontend to make API calls as if they were on the same domain,
   * avoiding CORS issues in development
   *
   * @example
   * Frontend call to /api/auth/login will be rewritten to:
   * https://coffee-pos-backend.up.railway.app/api/auth/login
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://coffee-pos-backend.up.railway.app/api/:path*',
        basePath: false,
      },
    ];
  },

  /**
   * Custom HTTP Headers Configuration
   *
   * Sets CORS (Cross-Origin Resource Sharing) headers for all routes
   * These headers are necessary for:
   * 1. Allowing credentials in cross-origin requests
   * 2. Specifying allowed origin
   * 3. Defining allowed HTTP methods
   * 4. Setting allowed request headers
   *
   * Important: These headers are crucial for secure communication
   * between the frontend and backend services
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://coffee-pos-backend.up.railway.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie, Set-Cookie',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
