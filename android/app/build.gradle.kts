import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
}

/* ----------------------------------------------------------------------
 * Signature : si android/keystore.properties existe, la version release
 * est signée avec ta clé personnelle (nécessaire pour publier des mises à
 * jour). Sinon on retombe sur la signature debug, qui suffit à installer
 * l'APK sur ton téléphone.
 * Déclaré hors du bloc `android` : `java` y désignerait l'extension Java.
 * -------------------------------------------------------------------- */
val fichierCle = rootProject.file("keystore.properties")
val propsCle = Properties()
if (fichierCle.exists()) {
    fichierCle.inputStream().use { propsCle.load(it) }
}
val aUneCle = propsCle.getProperty("storeFile") != null

android {
    namespace = "com.manonlacombe.monstock"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.manonlacombe.monstock"
        minSdk = 24
        targetSdk = 37
        versionCode = 3
        versionName = "1.7.0"
    }

    signingConfigs {
        if (aUneCle) {
            create("release") {
                storeFile = rootProject.file(propsCle.getProperty("storeFile"))
                storePassword = propsCle.getProperty("storePassword")
                keyAlias = propsCle.getProperty("keyAlias")
                keyPassword = propsCle.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (aUneCle) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    packaging {
        resources.excludes += setOf("META-INF/*.kotlin_module")
    }
}

/* ----------------------------------------------------------------------
 * Une seule source de vérité : le dossier docs/ de la racine du dépôt est
 * à la fois le site publié par GitHub Pages et la base copiée dans les
 * assets de l'APK. Les données de l'utilisateur restent sur le téléphone
 * (localStorage).
 * -------------------------------------------------------------------- */
val synchroniserWeb = tasks.register<Sync>("synchroniserWeb") {
    description = "Copie docs/ dans les assets Android"
    from(rootProject.file("../docs")) {
        exclude("sw.js")          // pas de service worker hors ligne dans l'APK
        exclude("docs/**")
        exclude("*.apk")
        exclude("qrcode-*.png")
        exclude("qr-*.png")
    }
    into(layout.projectDirectory.dir("src/main/assets/web"))
}

tasks.matching { it.name == "preBuild" }.configureEach { dependsOn(synchroniserWeb) }

dependencies {
    implementation(libs.webkit)
}