import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const isCapacitor = process.env.IS_CAPACITOR === 'true';

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-storage',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 31536000 // 1 year
          }
        }
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 604800 // 7 days
          }
        }
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:mp3|wav|m4a)$/i,
        handler: 'CacheFirst',
        options: {
          rangeRequests: true,
          cacheName: 'static-audio-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:mp4|webm)$/i,
        handler: 'CacheFirst',
        options: {
          rangeRequests: true,
          cacheName: 'static-video-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-js-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-style-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-data',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-data-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          }
        }
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          // Cache academy, tools pages
          if (pathname.startsWith('/academy/') || pathname.startsWith('/tools/')) return true;
          return false;
        },
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'pages',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          },
          plugins: [{
            cacheWillUpdate: async ({ request, response }) => {
                if (response && response.status === 200) {
                    return response;
                }
                return null;
            }
          }]
        }
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          return isSameOrigin && !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'others',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400 // 24 hours
          },
          networkTimeoutSeconds: 10
        }
      }
    ]
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        unoptimized: isCapacitor, // Only unoptimized for Capacitor/Static export
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    compress: true,
    poweredByHeader: false,
    output: isCapacitor ? 'export' : 'standalone',
    staticPageGenerationTimeout: 300, // Increase timeout to 5 minutes
    transpilePackages: [
        '@capacitor/core',
        '@capacitor/android',
        '@capacitor/ios',
        '@capacitor/geolocation',
        '@capacitor/network',
        '@capacitor/push-notifications'
    ],
    ...(isCapacitor ? {} : {
        async headers() {
            return [
                {
                    source: '/:path*',
                    headers: [
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY',
                        },
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff',
                        },
                        {
                            key: 'Referrer-Policy',
                            value: 'strict-origin-when-cross-origin',
                        },
                        {
                            key: 'Permissions-Policy',
                            value: 'camera=(), microphone=(), geolocation=()',
                        },
                    ],
                },
            ];
        },
    }),
};

export default withPWA(withNextIntl(nextConfig));
