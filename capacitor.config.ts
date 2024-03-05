import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Galeria de fotos',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
