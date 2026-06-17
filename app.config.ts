import {ExpoConfig} from 'expo/config';

const config: ExpoConfig = {
  name: 'Discipline',
  slug: 'discipline',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon-light.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: {
      dark: './assets/images/icon-dark.png',
      light: './assets/images/icon-light.png',
    },
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.gymtracker2',
    appleTeamId: 'SGDX27QAU8',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: 'Discipline allows to scan barcodes and take photos of your food.',
      NSMicrophoneUsageDescription: 'Discipline allows to record audio for video recordings.',
      NSLocalNetworkUsageDescription: 'This app needs access to devices on your local network.',
      UIBackgroundModes: ['location'],
      NSLocationWhenInUseUsageDescription: 'We need your location to track your trips.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'We need your location in the background to continue tracking your trips.',
      NSLocationAlwaysUsageDescription: 'We need your location in the background to continue tracking your trips.',
      NSAppTransportSecurity: {
        NSExceptionDomains: {
          '192.168.0.16': {
            NSExceptionAllowsInsecureHTTPLoads: true,
          },
        },
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.anonymous.gymtracker',
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
  },
  plugins: [
    ['expo-localization'],
    [
      'expo-build-properties', {
        ios: {
          deploymentTarget: '17.0',
        },
      },
    ],
    [
      'react-native-maps',
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you share them with your followers.',
        cameraPermission: 'The app accesses your camera to let you take photos of your food.',
        colors: {
          cropToolbarColor: '#000000',
        },
        dark: {
          colors: {
            cropToolbarColor: '#000000',
          },
        },
      },
    ],
    [
      'expo-router',
      {
        root: './routes',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/images/splash-icon-dark.png',
          backgroundColor: '#262626',
        },
      },
    ],
    [
      'expo-sqlite',
      {
        enableFTS: true,
        useSQLCipher: true,
        android: {
          enableFTS: false,
          useSQLCipher: false,
        },
        ios: {
          customBuildFlags: [
            '-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1',
          ],
        },
      },
    ],
    'expo-secure-store',
    [
      '@kingstinct/react-native-healthkit',
      {
        NSHealthShareUsageDescription: 'Read and understand health data.',
        NSHealthUpdateUsageDescription: 'Share workout data with other apps.',
        NSHealthClinicalHealthRecordsShareUsageDescription: 'Read and understand clinical health data.',
        background: true,
      },
    ],
    'expo-font',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
      root: './routes',
    },
    eas: {
      projectId: '4a2d84db-74ba-4b5e-981f-6e07fac3387d',
    },
  },
  owner: 'freddis',
};

export default config;
