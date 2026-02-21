package com.scarmonit.missioncontrol;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.firebasecrashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Explicitly register Firebase Crashlytics plugin to prevent potential
        // initialization issues during startup, especially in test environments.
        registerPlugin(FirebaseCrashlytics.class);

        super.onCreate(savedInstanceState);
    }
}
