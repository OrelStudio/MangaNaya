/** @type {import('next').NextConfig} */
const nextConfig = {
  // set up images for local development, inside D:\Manga\Storage
  images: {
    domains: [
      'manganaya.com',
      'img.manganaya.com',
      'googleusercontent.com',
      'lh3.googleusercontent.com',
      '*.googleusercontent.com',
    ],
  },
  output: 'standalone', // for docker
  env: {
    IMG_URL: 'http://img.manganaya.com',
    API_URL: 'http://api.manganaya.com',
    GOOGLE_CLIENT_ID: '743146176292-fjhqskg2r56shnbva76dkt4i1r0iavcc.apps.googleusercontent.com',
    GOOGLE_REDIRECT_URL: `http://api.manganaya.com/oauth/google`,
  },
}

export default nextConfig;
