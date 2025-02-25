/** @type {import('next').NextConfig} */
const nextConfig = {
  // set up images for local development, inside D:\Manga\Storage
  images: {
    // domains: [
    //   'manganaya.com',
    //   'img.manganaya.com',
    //   'googleusercontent.com',
    //   'lh3.googleusercontent.com',
    //   '*.googleusercontent.com',
    //   ...(process.env.NODE_ENV === 'development' ? ['localhost:8000'] : [])
    // ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'manganaya.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.manganaya.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      ...(process.env.NODE_ENV === 'development' ? [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '8000',
          pathname: '**',
        }
      ] : [])
    ]
  },
  output: 'standalone', // for docker
  env: {
    IMG_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://img.manganaya.com',
    API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://api.manganaya.com',
    GOOGLE_CLIENT_ID: '743146176292-fjhqskg2r56shnbva76dkt4i1r0iavcc.apps.googleusercontent.com',
    GOOGLE_REDIRECT_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/oauth/google' : `https://api.manganaya.com/oauth/google`,
  },
}

export default nextConfig;
