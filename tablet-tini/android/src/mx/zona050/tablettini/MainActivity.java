package mx.zona050.tablettini;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;

/**
 * Tablet-Tini · Zona Escolar 050.
 * Muestra la app (index.html) a pantalla completa, sin internet.
 * Si en la memoria o en la microSD existe la carpeta "Tablet-Tini" con un
 * index.html, carga ese archivo; así se puede actualizar el contenido
 * sin reinstalar la app.
 */
public class MainActivity extends Activity {

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setDatabasePath(getDir("datos", MODE_PRIVATE).getPath());
        s.setAllowFileAccess(true);
        // El ajedrez en línea consulta el servidor de la escuela o de la zona desde la página local.
        if (android.os.Build.VERSION.SDK_INT >= 16) s.setAllowUniversalAccessFromFileURLs(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Los niños no salen a internet desde la app.
                return !url.startsWith("file:");
            }
        });
        web.addJavascriptInterface(new Puente(), "Android");
        setContentView(web);

        if (savedInstanceState == null) {
            web.loadUrl(paginaInicial());
        } else {
            web.restoreState(savedInstanceState);
        }
        pantallaCompleta();
    }

    private String paginaInicial() {
        String[] carpetas = {
                Environment.getExternalStorageDirectory().getPath(),
                "/mnt/extsd", "/storage/extsd", "/storage/sdcard1",
                "/mnt/sdcard2", "/mnt/external_sd", "/storage/external_SD"
        };
        for (String c : carpetas) {
            File f = new File(c + "/Tablet-Tini/index.html");
            if (f.exists() && f.canRead()) {
                return "file://" + f.getPath();
            }
        }
        return "file:///android_asset/index.html";
    }

    private void pantallaCompleta() {
        if (Build.VERSION.SDK_INT >= 19) {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) pantallaCompleta();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        // El botón Atrás de la tablet funciona dentro de la app y nunca la cierra.
        web.loadUrl("javascript:window.ttAtras&&window.ttAtras()");
    }

    /** Funciones que la app puede usar desde el modo maestro. */
    private class Puente {
        @JavascriptInterface
        public void ajustes() {
            abrir(new Intent(Settings.ACTION_SETTINGS));
        }

        @JavascriptInterface
        public void navegador() {
            abrir(new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com.mx")));
        }

        @JavascriptInterface
        public void quitarInicio() {
            abrir(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.fromParts("package", getPackageName(), null)));
        }

        @JavascriptInterface
        public String version() {
            try {
                return "v" + getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "v1";
            }
        }

        private void abrir(Intent i) {
            try {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception e) {
                // Si la tablet no tiene esa pantalla, no pasa nada.
            }
        }
    }
}
