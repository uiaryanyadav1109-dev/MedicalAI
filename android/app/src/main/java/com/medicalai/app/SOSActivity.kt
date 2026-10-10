package com.medicalai.app

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.view.WindowManager
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * SOSActivity: Renders directly over the Android Lock Screen (Keyguard)
 * Configured with:
 * - setShowWhenLocked(true)
 * - setTurnScreenOn(true)
 * - PowerManager Screen Bright WakeLock
 * - Full-screen emergency presentation bypassing authentication
 */
class SOSActivity : Activity() {

    private var wakeLock: PowerManager.WakeLock? = null
    private var webView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Configure Android Lock-Screen Bypass and Screen Awakening
        configureLockScreenDisplay()

        // 2. Acquire temporary bright screen wake lock
        acquireEmergencyWakeLock()

        // 3. Initialize Fullscreen Emergency UI & Bridge
        initializeEmergencyBridge()
    }

    private fun configureLockScreenDisplay() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)

            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            keyguardManager?.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        // Keep screen on during emergency interaction
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun acquireEmergencyWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            wakeLock = powerManager?.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "MedicalAI:EmergencySOSWakeLock"
            )
            // Hold wake lock for maximum 3 minutes during distress
            wakeLock?.acquire(3 * 60 * 1000L)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun initializeEmergencyBridge() {
        webView = WebView(this)
        setContentView(webView)

        webView?.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.setGeolocationEnabled(true)
            settings.cacheMode = WebSettings.LOAD_DEFAULT

            webChromeClient = object : WebChromeClient() {
                override fun onGeolocationPermissionsShowPrompt(
                    origin: String?,
                    callback: GeolocationPermissions.Callback?
                ) {
                    // Always grant emergency geolocation when invoked from SOSActivity
                    callback?.invoke(origin, true, false)
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    // Handle telephone emergency calls natively
                    if (url != null && url.startsWith("tel:")) {
                        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                        startActivity(dialIntent)
                        return true
                    }
                    return false
                }
            }

            // Load the SOS trigger route directly (bypassing auth and starting 5s countdown)
            loadUrl("http://localhost:3000/?action=sos")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        webView?.destroy()
    }
}
