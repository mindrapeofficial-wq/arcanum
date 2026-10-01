import { readFile, writeFile } from "node:fs/promises";

const activityPath = new URL("../android/app/src/main/java/com/arcanum/MainActivity.java", import.meta.url);
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
    @Override protected void onCreate(Bundle savedInstanceState) { super.onCreate(savedInstanceState); enterImmersiveMode(); }
    @Override public void onResume() { super.onResume(); getWindow().getDecorView().post(this::enterImmersiveMode); }
    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) getWindow().getDecorView().postDelayed(this::enterImmersiveMode, 180); }
    private void enterImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT); getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) { getWindow().setNavigationBarContrastEnforced(false); getWindow().setStatusBarContrastEnforced(false); }
        WindowManager.LayoutParams params = getWindow().getAttributes();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        getWindow().setAttributes(params);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setAppearanceLightStatusBars(false); controller.setAppearanceLightNavigationBars(false);
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`;
await writeFile(activityPath, activity, "utf8");

const manifestPath = new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url);
let manifest = await readFile(manifestPath, "utf8");
manifest = manifest.replace(/android:configChanges="([^"]*)"/, (_match, value) => {
  const parts = value.split("|").filter(Boolean); if (!parts.includes("density")) parts.push("density"); return `android:configChanges="${parts.join("|")}"`;
});
if (!manifest.includes("android.permission.INTERNET")) manifest = manifest.replace(/<manifest([^>]*)>/, '<manifest$1>\n    <uses-permission android:name="android.permission.INTERNET" />');
await writeFile(manifestPath, manifest, "utf8");

const nativeCssPath = new URL("../www/assets/css/native.css", import.meta.url);
let nativeCss = await readFile(nativeCssPath, "utf8");
const nativeFix = `\n/* APK-specific mobile polish. Applied only to the packaged www copy. */\n@media(max-width:760px){\n  .brand-mini{min-width:168px;padding:0 2px;overflow:hidden}\n  .brand-mini img{width:220px;max-width:none;height:62px;object-fit:contain;transform:scale(1.48);transform-origin:center}\n  .view-host>.view-header:only-child{margin:18px 0;padding:18px;border:1px solid rgba(190,155,91,.18);background:linear-gradient(180deg,rgba(18,15,11,.88),rgba(5,5,5,.92))}\n  .view-host>.view-header:only-child h2{font-size:clamp(26px,8vw,38px)}\n}\n`;
if (!nativeCss.includes("APK-specific mobile polish")) nativeCss += nativeFix;
await writeFile(nativeCssPath, nativeCss, "utf8");

console.log("Android immersive, network and APK UI patch applied.");
