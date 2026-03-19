plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    // ... other plugins
    id("com.google.android.libraries.mapsplatform.secrets-gradle-plugin")
}

android {
    // ... existing config (namespace, compileSdk, etc.)

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            
            // Ensure the build doesn't fail if keys are missing during CI
            buildConfigField("String", "SUPABASE_URL", "\"${project.findProperty("SUPABASE_URL") ?: ""}\"")
            buildConfigField("String", "SUPABASE_KEY", "\"${project.findProperty("SUPABASE_KEY") ?: ""}\"")
        }
        debug {
            // Same for debug to allow CI testing
            buildConfigField("String", "SUPABASE_URL", "\"${project.findProperty("SUPABASE_URL") ?: ""}\"")
            buildConfigField("String", "SUPABASE_KEY", "\"${project.findProperty("SUPABASE_KEY") ?: ""}\"")
        }
    }
    
    buildFeatures {
        buildConfig = true // Required to access keys in code
    }
}

secrets {
    // This tells the plugin NOT to fail if local.properties is missing
    defaultPropertiesFileName = "local.defaults.properties"
}