const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getAppName = () => {
  if (IS_DEV) return 'Crotchet (Dev)';
  if (IS_STAGING) return 'Crotchet (Staging)';
  return 'Crotchet';
};

const getBundleId = () => {
  if (IS_DEV) return 'com.crotchet.mobile.dev';
  if (IS_STAGING) return 'com.crotchet.mobile.staging';
  return 'com.crotchet.mobile';
};

const getScheme = () => {
  if (IS_DEV) return 'crotchet-dev';
  if (IS_STAGING) return 'crotchet-staging';
  return 'crotchet';
};

const getIcon = () => {
  if (IS_DEV) return './assets/images/icon-dev.png';
  if (IS_STAGING) return './assets/images/icon-staging.png';
  return './assets/images/icon.png';
};

const getSplashIcon = () => {
  if (IS_DEV) return './assets/images/splash-icon-dev.png';
  if (IS_STAGING) return './assets/images/splash-icon-staging.png';
  return './assets/images/splash-icon.png';
};

const getAndroidForegroundImage = () => {
  if (IS_DEV) return './assets/images/android-icon-foreground-dev.png';
  if (IS_STAGING) return './assets/images/android-icon-foreground-staging.png';
  return './assets/images/android-icon-foreground.png';
};

const getAndroidMonochromeImage = () => {
  if (IS_DEV) return './assets/images/android-icon-monochrome-dev.png';
  if (IS_STAGING) return './assets/images/android-icon-monochrome-staging.png';
  return './assets/images/android-icon-monochrome.png';
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: 'crotchet-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: getIcon(),
    scheme: getScheme(),
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleId(),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: getBundleId(),
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        backgroundColor: '#c8f0e8',
        foregroundImage: getAndroidForegroundImage(),
        monochromeImage: getAndroidMonochromeImage(),
      },
    },
    web: {
      output: 'static',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: getSplashIcon(),
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: '',
      },
    },
  },
};
