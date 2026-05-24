#!/usr/bin/env bash
# =========================================================
#  StuManage — Android .aab Build Script
#  Run this on a machine with Java 17+ and Android SDK
#  (or use Android Studio GUI instead — see BUILD_ANDROID.md)
# =========================================================
set -e

echo "Step 1: Building web app for production..."
pnpm vite build --config vite.capacitor.config.ts

echo "Step 2: Syncing Capacitor Android project..."
npx cap sync android

echo "Step 3: Checking signing keystore..."
KEYSTORE="android/app/stumanage-release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo ""
  echo "No keystore found at $KEYSTORE"
  echo "Please generate one with:"
  echo ""
  echo "  cd android/app"
  echo "  keytool -genkeypair -v -storetype PKCS12 \\"
  echo "    -keystore stumanage-release.keystore \\"
  echo "    -alias stumanage -keyalg RSA -keysize 2048 -validity 10000 \\"
  echo "    -dname \"CN=StuManage, OU=Development, O=StuManage, L=, S=, C=IN\""
  echo ""
  echo "Then create android/key.properties (see key.properties.example)."
  echo ""
  exit 1
fi

KEY_PROPS="android/key.properties"
if [ ! -f "$KEY_PROPS" ]; then
  echo ""
  echo "No key.properties found at $KEY_PROPS"
  echo "Copy android/key.properties.example to android/key.properties and fill in your passwords."
  echo ""
  exit 1
fi

echo "Step 4: Building release .aab..."
cd android
chmod +x gradlew
./gradlew bundleRelease

echo ""
echo "BUILD COMPLETE!"
echo "Your .aab file is at:"
find . -name "*.aab" -type f 2>/dev/null
echo ""
echo "Upload it to Google Play Console to publish your app."
