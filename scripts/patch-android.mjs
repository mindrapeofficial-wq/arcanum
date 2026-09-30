import { readFile, writeFile } from "node:fs/promises";

const activityPath = new URL(
  "../android/app/src/main/java/com/arcanum/MainActivity.java",
  import.meta.url
);

const activity = `package com.arcanum;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enterImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        getWindow().getDecorView().post(this::enterImmersiveMode);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            getWindow().getDecorView().postDelayed(this::enterImmersiveMode, 180);
        }
    }

    private void enterImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setNavigationBarContrastEnforced(false);
            getWindow().setStatusBarContrastEnforced(false);
        }

        WindowManager.LayoutParams params = getWindow().getAttributes();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            params.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            params.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        getWindow().setAttributes(params);

        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());

        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`;

await writeFile(activityPath, activity, "utf8");

const manifestPath = new URL(
  "../android/app/src/main/AndroidManifest.xml",
  import.meta.url
);
let manifest = await readFile(manifestPath, "utf8");
manifest = manifest.replace(
  /android:configChanges="([^"]*)"/,
  (_match, value) => {
    const parts = value.split("|").filter(Boolean);
    if (!parts.includes("density")) parts.push("density");
    return `android:configChanges="${parts.join("|")}"`;
  }
);
await writeFile(manifestPath, manifest, "utf8");

console.log("Android immersive fullscreen patch applied.");
