/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps for better debugging experience
  productionBrowserSourceMaps: false, // Set to true if you want source maps in production (slower builds)
  
  // Turbopack configuration (default in Next.js 16)
  // Source maps are enabled by default in development mode with Turbopack
  
  // Optional: If you need webpack instead of Turbopack, uncomment the webpack config below
  // and use `npm run dev:webpack` instead of `npm run dev`
  // webpack: (config, { isServer }) => {
  //   // Enable source maps in development
  //   if (!isServer) {
  //     config.devtool = 'eval-source-map';
  //   }
  //   return config;
  // },
};

export default nextConfig;
