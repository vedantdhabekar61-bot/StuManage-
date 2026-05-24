#!/usr/bin/env bash
# =========================================================
#  StuManage — Android .aab Build Script
#  Run this on a machine with Java 17+ and Android SDK
# =========================================================
set -e

echo "🔧 Step 1: Building web app for production..."
pnpm vite build --config vite.capacitor.config.ts

echo "📱 Step 2: Setting up Capacitor Android project..."
npx cap add android 2>/dev/null || echo "Android already added, skipping..."
npx cap sync android

echo "🔑 Step 3: Generating signing keystore (if not exists)..."
KEYSTORE="android/app/stumanage-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE" \
    -alias stumanage \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass stumanage2025 \
    -keypass stumanage2025 \
    -dname "CN=StuManage App, OU=StudyLogic, O=StuManage, L=India, S=India, C=IN"
  echo "✅ Keystore created at $KEYSTORE"
else
  echo "✅ Keystore already exists, skipping..."
fi

echo "🔑 Step 4: Getting SHA-1 and SHA-256 fingerprints..."
keytool -list -v \
  -keystore "$KEYSTORE" \
  -alias stumanage \
  -storepass stumanage2025 2>/dev/null | grep -A2 "Certificate fingerprints"

echo ""
echo "📦 Step 5: Building release .aab..."
cd android

# Write signing config to local.properties
cat > local.properties << EOF
sdk.dir=$ANDROID_HOME
EOF

# Write keystore signing config
cat > key.properties << EOF
storePassword=stumanage2025
keyPassword=stumanage2025
keyAlias=stumanage
storeFile=stumanage-release.keystore
EOF

chmod +x gradlew
./gradlew bundleRelease

echo ""
echo "✅ BUILD COMPLETE!"
echo "📦 Your .aab file is at:"
find . -name "*.aab" -type f 2>/dev/null
echo ""
echo "🔑 IMPORTANT — Save your keystore fingerprints above."
echo "   You need SHA-1 for Google Play Console."
echo "   Keep stumanage-release.keystore safe — you cannot re-upload without it!"
