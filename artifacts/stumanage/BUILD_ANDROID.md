# StuManage — Android AAB Build Guide

## What's Already Done (by Replit)
- Full web app migrated and built
- Capacitor Android project initialized
- App icons generated at all densities from your logo
- 512×512 store icon generated (`android/store-icon-512.png`)
- Gradle signing config wired up (reads from `android/key.properties`)

## What You Need (on your local machine)
- [Android Studio](https://developer.android.com/studio) — free download
- Java 17+ (comes bundled with Android Studio)
- The keystore file (generate once, keep forever — see below)

---

## Step 1 — Generate Your Signing Keystore (one-time)

Run this command inside the `artifacts/stumanage/android/app/` directory:

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore stumanage-release.keystore \
  -alias stumanage \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=StuManage, OU=Development, O=StuManage, L=, S=, C=IN"
```

You will be prompted to set a password — use something strong and save it securely.

## Step 2 — Create key.properties

In the `artifacts/stumanage/android/` directory, copy the example file:

```bash
cp key.properties.example key.properties
```

Then edit `key.properties` and fill in your password:

```
storeFile=app/stumanage-release.keystore
storePassword=<your_password>
keyAlias=stumanage
keyPassword=<your_password>
```

**Never commit `key.properties` or the `.keystore` file to git** — they're already in `.gitignore`.

## Step 3 — Build the AAB in Android Studio

1. Open Android Studio → "Open an existing project"
2. Select the `artifacts/stumanage/android` folder
3. Wait for Gradle sync to complete (first time: 5-10 minutes)
4. Go to: `Build → Generate Signed Bundle / APK`
5. Choose **Android App Bundle**
6. Point to `app/stumanage-release.keystore` and enter your password
7. Select **release** variant → click **Finish**

The `.aab` file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Step 4 — Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → "StuManage"
3. Go to **Release → Production** (or Internal Testing first)
4. Click **Create new release** → Upload your `app-release.aab`
5. Fill in release notes → Save → Review → Rollout

---

## App Details

| Field | Value |
|---|---|
| Package Name | `com.stumanage.app` |
| Version | 1.0 (code: 1) |
| App Name | StuManage |
| Min Android | API 22 (Android 5.1+) |
| Target Android | API 35 (Android 15) |

## Google Play Store Listing

- **App icon**: `android/store-icon-512.png` (512×512, already generated)
- **Short description**: Manage your study center — students, seats, fees & WhatsApp reminders
- **Full description**: StuManage helps reading room and study center owners manage students, track monthly fees, assign seats, and send WhatsApp payment reminders with one tap.
- **Category**: Education or Business
- **Content rating**: Everyone
- **Privacy Policy URL**: Your deployed app URL + `/privacy`

## SHA-1 Fingerprint (for Google Sign-In setup)

After generating the keystore, run this to get the SHA-1:

```bash
keytool -list -v \
  -keystore android/app/stumanage-release.keystore \
  -alias stumanage
```

You'll need this SHA-1 when configuring Google OAuth in Supabase and Google Cloud Console.

---

## IMPORTANT — Back Up Your Keystore

**If you lose the keystore file or forget the password, you cannot update your app on Google Play.** Keep a secure backup:
- Password manager (1Password, Bitwarden, etc.)
- Encrypted cloud storage
- Printed copy of the password stored safely
