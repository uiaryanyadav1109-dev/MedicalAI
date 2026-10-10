package com.medicalai.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.DownloadListener
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

/**
 * MainActivity: Primary Application Activity for Medical AI PWA & Native Bridge
 * Provides:
 * - Full-featured WebView container for Doctors Portal & Patient Portal
 * - File Chooser integration for lab report uploads (PDF, PNG, JPG, JPEG, WEBP)
 * - Secure report downloading bridge for clinical documents
 * - Deep link routing for report reviews (/doctor/reports, /patient/reports)
 */
class MainActivity : Activity() {

    private var webView: WebView? = null
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        handleIntent(intent)
    }

    private fun setupWebView() {
        webView?.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                setSupportMultipleWindows(true)
                javaScriptCanOpenWindowsAutomatically = true
            }

            webChromeClient = object : WebChromeClient() {
                // File chooser support for medical document uploads (PDF, images)
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    fileUploadCallback?.onReceiveValue(null)
                    fileUploadCallback = filePathCallback

                    val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                        val mimeTypes = arrayOf(
                            "application/pdf",
                            "image/png",
                            "image/jpeg",
                            "image/webp"
                        )
                        putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
                    }

                    try {
                        startActivityForResult(
                            Intent.createChooser(intent, "Select Medical Document or Report"),
                            FILE_CHOOSER_REQUEST_CODE
                        )
                    } catch (e: Exception) {
                        fileUploadCallback?.onReceiveValue(null)
                        fileUploadCallback = null
                        Toast.makeText(this@MainActivity, "File picker unavailable", Toast.LENGTH_SHORT).show()
                        return false
                    }
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url != null && (url.startsWith("tel:") || url.startsWith("mailto:"))) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    return false
                }
            }

            // Secure download listener for clinical report downloads
            setDownloadListener(DownloadListener { url, _, contentDisposition, mimeType, _ ->
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(Uri.parse(url), mimeType)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
                }
                try {
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, "No application found to view this document", Toast.LENGTH_SHORT).show()
                }
            })

            // Default web application entry URL
            loadUrl("http://localhost:3000/")
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null) {
            val path = data.path
            if (path != null && (path.contains("reports") || path.contains("doctor") || path.contains("patient") || path.contains("handoff") || path.contains("appointment") || path.contains("referral"))) {
                webView?.loadUrl("http://localhost:3000$path")
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback == null) return

            val results: Array<Uri>? = if (resultCode == RESULT_OK && data != null) {
                if (data.data != null) {
                    arrayOf(data.data!!)
                } else if (data.clipData != null) {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                } else {
                    null
                }
            } else {
                null
            }

            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onBackPressed() {
        if (webView?.canGoBack() == true) {
            webView?.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webView?.destroy()
    }
}
