module.exports = {
  staticFileGlobs: [
    'build/**.html',
    'build/**.bundle.js',
    'build/**.bundle.css',
    'build/assets/**',
    'build/manifest.json',
    'build/sw-registration.js'
  ],
  root: 'build',
  stripPrefix: 'build/',
  navigateFallback: '/index.html',
  importScripts: [
    '/sw.js',
    '/idb-keyval.js'
    ],
  runtimeCaching: [{
    urlPattern: /timeline/,
    handler: 'networkFirst'
  },
  {
    urlPattern: /fonts\.googleapis\.com/,
    handler: 'cacheFirst'
  },
  {
    urlPattern: /fonts\.gstatic\.com/,
    handler: 'cacheFirst'
  },
  {
    urlPattern: /pbs\.twimg\.com/,
    handler: 'cacheFirst'
  }]
};
