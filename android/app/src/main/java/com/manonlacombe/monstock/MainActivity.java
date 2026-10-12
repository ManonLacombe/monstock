package com.manonlacombe.monstock;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * MonStock — coquille Android.
 *
 * L'application est écrite en HTML/CSS/JS dans ../../web et affichée dans
 * une WebView. Les assets sont servis via https://appassets.androidplatform.net
 * afin de disposer d'une origine sécurisée : le localStorage y est fiable,
 * ce qui garantit que le stock, les goûts et la liste de courses survivent
 * à la fermeture de l'application.
 */
public class MainActivity extends Activity {

    private static final String URL_APP =
            "https://appassets.androidplatform.net/assets/web/index.html";

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);     // indispensable : localStorage
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);      // tout passe par le loader d'assets
        s.setAllowContentAccess(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, WebResourceRequest request) {
                // L'application est autonome : on ne sort jamais de l'APK.
                return true;
            }
        });

        // La caméra est utilisée uniquement quand tu lances un scan de
        // code-barres : on n'accorde la ressource que pour cette origine,
        // et seulement si la permission a déjà été donnée à l'utilisateur.
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Uri origine = request.getOrigin();
                        boolean autorisee = checkSelfPermission(
                                android.Manifest.permission.CAMERA)
                                == PackageManager.PERMISSION_GRANTED;
                        boolean attendue = origine != null && origine.toString()
                                .startsWith("https://appassets.androidplatform.net");
                        if (autorisee && attendue) {
                            request.grant(request.getResources());
                        } else {
                            request.deny();
                        }
                    }
                });
            }
        });

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(URL_APP);
        }

        // La caméra sert uniquement au scan de code-barres. Si tu la refuses,
        // tout le reste de l'application fonctionne sans elle.
        if (checkSelfPermission(android.Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                    new String[]{android.Manifest.permission.CAMERA}, 1);
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (web != null) web.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}