const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getAppName = () => {
  if (IS_DEV) return 'Crotchet (Dev)';
  if (IS_STAGING) return 'Crotchet (Staging)';
  return 'Crotchet';
};

const getBundleIdentifier = () => {
  if (IS_DEV) return 'tz.co.akil.crotchet.dev';
  if (IS_STAGING) return 'tz.co.akil.crotchet.staging';
  return 'tz.co.akil.crotchet';
};

const getAndroidPackage = () => {
  if (IS_DEV) return 'tz.co.akil.crotchet.dev';
  if (IS_STAGING) return 'tz.co.akil.crotchet.staging';
  return 'tz.co.akil.crotchet';
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

const getAndroidForegroundImage = () => {
  if (IS_DEV) return './assets/images/android-icon-foreground-dev.png';
  if (IS_STAGING) return './assets/images/android-icon-foreground-staging.png';
  return './assets/images/android-icon-foreground.png';
};

const getAndroidBackgroundImage = () => {
  if (IS_DEV) return './assets/images/android-icon-background-dev.png';
  if (IS_STAGING) return './assets/images/android-icon-background-staging.png';
  return './assets/images/android-icon-background.png';
};

const getAndroidMonochromeImage = () => {
  if (IS_DEV) return './assets/images/android-icon-monochrome-dev.png';
  if (IS_STAGING) return './assets/images/android-icon-monochrome-staging.png';
  return './assets/images/android-icon-monochrome.png';
};

const getSplashIcon = () => {
  if (IS_DEV) return './assets/images/splash-icon-dev.png';
  if (IS_STAGING) return './assets/images/splash-icon-staging.png';
  return './assets/images/splash-icon.png';
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: 'Crotchet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: getIcon(),
    scheme: getScheme(),
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleIdentifier(),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: getAndroidPackage(),
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: getAndroidForegroundImage(),
        backgroundImage: getAndroidBackgroundImage(),
        monochromeImage: getAndroidMonochromeImage(),
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
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
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '9894f611-7fb9-47f4-9551-1c32df1c68e3',
      },
    },
  },
};
