module.exports = {
  webpack: (config, { isEnvProduction }) => {
    // Production optimizations
    if (isEnvProduction) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };

      // Reduce bundle size with compression
      config.plugins.push(
        require('compression-webpack-plugin')
      );
    }

    // Import alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
    };

    return config;
  },
};