import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arcanum',
  appName: 'ARCANUM: Las Cinco Escuelas',
  webDir: 'www',
  server: {
    url: 'https://arcanum-las-cinco-escuelas.onrender.com',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
