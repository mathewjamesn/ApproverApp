package com.gmt.approver.prototype;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * Hosts the Approver prototype (a self-contained HTML app in assets/) in a full-screen WebView.
 * Phone, SMS, WhatsApp and Google Maps links open the real apps.
 */
public class MainActivity extends Activity {
    private static final int REQ_FILE = 1;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        setContentView(web);
        // Android 15 draws edge-to-edge; keep the page clear of the status and navigation bars.
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);

        web.addJavascriptInterface(new Bridge(), "AndroidApp");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equals(uri.getScheme())) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "No app found to open this link", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) {
                    fileCallback.onReceiveValue(null);
                }
                fileCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.hwBack ? window.hwBack() : false", value -> {
            if (!"true".equals(value)) {
                finish();
            }
        });
    }

    /** Runs one HTTP request off the UI thread and hands the result to window.__http(id, status, body). */
    private void runHttp(final int id, final String method, final String url, final String body,
                         final String token, final String multipartField, final String fileName,
                         final String mime) {
        new Thread(() -> {
            int status = 0;
            String text;
            try {
                java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
                c.setConnectTimeout(20000);
                c.setReadTimeout(30000);
                c.setRequestMethod(method);
                c.setRequestProperty("Accept", "application/json");
                if (token != null && token.length() > 0) c.setRequestProperty("Authorization", "Bearer " + token);
                if (multipartField != null) {
                    String boundary = "----approver" + System.currentTimeMillis();
                    c.setDoOutput(true);
                    c.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
                    byte[] data = android.util.Base64.decode(body, android.util.Base64.DEFAULT);
                    java.io.OutputStream o = c.getOutputStream();
                    o.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + multipartField
                            + "\"; filename=\"" + fileName + "\"\r\nContent-Type: " + mime + "\r\n\r\n").getBytes("UTF-8"));
                    o.write(data);
                    o.write(("\r\n--" + boundary + "--\r\n").getBytes("UTF-8"));
                    o.close();
                } else {
                    c.setRequestProperty("Content-Type", "application/json");
                    if (!"GET".equals(method) && body != null && body.length() > 0) {
                        c.setDoOutput(true);
                        java.io.OutputStream o = c.getOutputStream();
                        o.write(body.getBytes("UTF-8"));
                        o.close();
                    }
                }
                status = c.getResponseCode();
                java.io.InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
                if (in != null) {
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                    in.close();
                }
                text = bo.toString("UTF-8");
            } catch (Exception e) {
                text = String.valueOf(e.getMessage());
            }
            final String js = "window.__http(" + id + "," + status + "," + org.json.JSONObject.quote(text) + ")";
            runOnUiThread(() -> web.evaluateJavascript(js, null));
        }).start();
    }

    /** Exposed to the page as window.AndroidApp. */
    private class Bridge {
        /** JSON request; the result comes back through window.__http. */
        @JavascriptInterface
        public void http(int id, String method, String url, String body, String token) {
            runHttp(id, method, url, body, token, null, null, null);
        }

        /** Multipart upload of a base64 file under the given form field. */
        @JavascriptInterface
        public void upload(int id, String url, String field, String fileName, String mime, String base64, String token) {
            runHttp(id, "POST", url, base64, token, field, fileName, mime);
        }

        @JavascriptInterface
        public void copy(String text) {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            cm.setPrimaryClip(ClipData.newPlainText("text", text));
        }

        /** Google Maps key from the manifest (see app/build.gradle); empty when none was configured. */
        @JavascriptInterface
        public String mapsKey() {
            try {
                android.content.pm.ApplicationInfo ai = getPackageManager()
                        .getApplicationInfo(getPackageName(), android.content.pm.PackageManager.GET_META_DATA);
                String key = ai.metaData != null ? ai.metaData.getString("tok.MAPS_API_KEY") : null;
                return key != null ? key : "";
            } catch (Exception e) {
                return "";
            }
        }
    }
}
