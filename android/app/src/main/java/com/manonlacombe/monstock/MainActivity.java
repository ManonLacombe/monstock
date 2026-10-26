package com.manonlacombe.monstock;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
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

    // Hauteur des barres du système (statut, navigation), en pixels.
    // Depuis Android 15 l'affichage bord à bord est imposé : le contenu
    // passe sous les touches Retour / Accueil / Historique. La WebView
    // n'expose alors pas de valeur utilisable via env(safe-area-inset-*),
    // donc on la mesure ici et on la transmet au CSS.
    private int margeHautPx = 0;
    private int margeBasPx = 0;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        setContentView(web);

        web.setOnApplyWindowInsetsListener((vue, insets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                int[] barres = barresRecent(insets);
                margeHautPx = barres[0];
                margeBasPx = barres[1];
            } else {
                margeHautPx = insets.getSystemWindowInsetTop();
                margeBasPx = insets.getSystemWindowInsetBottom();
            }
            injecterMarges();
            return insets;
        });
        // Force la première distribution des marges système.
        web.requestApplyInsets();

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

            @Override
            public void onPageFinished(WebView view, String url) {
                injecterMarges();   // la page est là : on peut appliquer
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

        // Filet de sécurité : selon la façon dont la page est chargée
        // (restauration après rotation, par exemple), `onPageFinished` peut
        // ne pas être rappelé. Deux relances couvrent ces cas.
        final Runnable relance = new Runnable() {
            @Override
            public void run() {
                injecterMarges();
            }
        };
        web.postDelayed(relance, 600);
        web.postDelayed(relance, 2000);
    }

    /**
     * Hauteurs des barres système à partir d'Android 11.
     * Isolé dans une méthode annotée : `android.graphics.Insets` n'existe pas
     * sur les anciens Android (minSdk 24) et ne doit être résolu que si la
     * version le permet.
     */
    @android.annotation.TargetApi(Build.VERSION_CODES.R)
    private static int[] barresRecent(WindowInsets insets) {
        Insets barres = insets.getInsets(WindowInsets.Type.systemBars());
        return new int[]{barres.top, barres.bottom};
    }

    /**
     * Communique au CSS la hauteur réelle des barres système, en pixels CSS.
     * On n'écrase la valeur que si elle est non nulle : si la WebView gère
     * déjà env(safe-area-inset-*), on garde sa valeur et il n'y a pas de
     * double marge.
     */
    private void injecterMarges() {
        if (web == null) return;
        if (margeHautPx <= 0 && margeBasPx <= 0) return;

        float densite = getResources().getDisplayMetrics().density;
        int haut = Math.round(margeHautPx / densite);
        int bas = Math.round(margeBasPx / densite);

        StringBuilder js = new StringBuilder(
                "(function(){var r=document.documentElement;if(!r)return;");
        if (haut > 0) {
            js.append("r.style.setProperty('--marge-haut','").append(haut).append("px');");
        }
        if (bas > 0) {
            js.append("r.style.setProperty('--marge-bas','").append(bas).append("px');");
        }
        js.append("})();");

        web.evaluateJavascript(js.toString(), null);
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