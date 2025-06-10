// next.config.mjs

// By importing the env file here, we ensure that it is loaded and
// validated at build time and when the dev server starts.
// We are now importing the .mjs file directly.
import "./src/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This configuration is important for password hashing (bcrypt/argon2)
  // and must be preserved.
  experimental: {
    serverComponentsExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  },
};

export default nextConfig;