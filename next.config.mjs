/** @type {import('next').NextConfig} */
const nextConfig = {
  // This configuration tells Next.js to treat certain packages as external
  // during the server-side rendering build process, which is often necessary
  // for packages with native bindings like bcrypt or argon2. It helps prevent
  // bundling issues in serverless environments.
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  },
};

export default nextConfig;