// Exclude specific native modules from Android autolinking for this build
// This allows creating an APK without optional native deps that break CI/local builds
module.exports = {
  dependencies: {
    'react-native-bluetooth-serial-next': {
      platforms: { android: null },
    },
    'react-native-thermal-receipt-printer': {
      platforms: { android: null },
    },
  },
};


