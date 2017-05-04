module.exports = {
  staticFileGlobs: [
    'build/**.html',
    'build/**.bundle.js',
    'build/**.bundle.css',
    'build/assets/**'
  ],
  root: 'build',
  stripPrefix: 'build/',
  navigateFallback: '/index.html',
};
