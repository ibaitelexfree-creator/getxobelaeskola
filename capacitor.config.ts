import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getxo.belaeskola',
  appName: 'Getxo Sailing School',
  webDir: 'out',
  android: {
    allowMixedContent: true
  },
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    cleartext: true
  }
};

export default config;
