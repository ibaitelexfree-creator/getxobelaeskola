'use client';

import { useEffect, useRef } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

/**
 * Hook to monitor network status and detect WiFi transitions.
 */
export function useNetworkMonitor(onWifiDisconnect: () => void) {
    const lastNetworkStatus = useRef<ConnectionStatus | null>(null);

    useEffect(() => {
        let listenerHandle: any | null = null;

        const setupNetworkListener = async () => {
            try {
                const status = await Network.getStatus();
                lastNetworkStatus.current = status;

                listenerHandle = await Network.addListener('networkStatusChange', status => {
                    // Logic: If transitioned from WiFi to anything else (or disconnected)
                    if (lastNetworkStatus.current?.connectionType === 'wifi' && status.connectionType !== 'wifi') {
                        onWifiDisconnect();
                    }
                    lastNetworkStatus.current = status;
                });
            } catch (error: unknown) {
                console.error('Error setting up network listener:', error);
            }
        };

        setupNetworkListener();

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [onWifiDisconnect]);
}
