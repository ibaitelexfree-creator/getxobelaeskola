import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.scarmonit.missioncontrol',
    appName: 'Mission Control',
    webDir: 'out',
    android: {
        allowMixedContent: true,
    },
    server: {
        androidScheme: 'https',
        hostname: 'localhost',
        cleartext: true,
    },
    plugins: {
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#010409',
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
    },
};

export default config;
