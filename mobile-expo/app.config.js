module.exports = {
  expo: {
    name: 'Crotchet',
    slug: 'crotchet-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.crotchet.mobile',
    },
    android: {
      package: 'com.crotchet.mobile',
      edgeToEdgeEnabled: true,
    },
    web: {
      output: 'static',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
  },
};
