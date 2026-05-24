# StuManage — Android AAB Build Guide

## What's Already Done (by Replit)
- Full web app migrated and built
- Capacitor Android project initialized
- App icons generated at all densities from your logo
- Release signing keystore generated (`android/app/stumanage-release.keystore`)
- Gradle signing config is set up
- Web assets synced to Android project

## What You Need (on your local machine)
- [Android Studio](https://developer.android.com/studio) — free download
- Java 17+ (comes with Android Studio)

---

## Step-by-Step: Build the .aab on Your Computer

### 1. Download this project
Download the entire project from Replit (Download as ZIP).

### 2. Open in Android Studio
- Open Android Studio → "Open an existing project"
- Navigate to and select the `artifacts/stumanage/android` folder
- Wait for Gradle sync to finish (first time takes 5-10 minutes)

### 3. Build the AAB
In Android Studio menu:
```
Build → Generate Signed Bundle / APK
→ Choose "Android App Bundle"
→ Key store path: app/stumanage-release.keystore
→ Key store password: stumanage2025
→ Key alias: stumanage
→ Key password: stumanage2025
→ Build variant: release
→ Click Finish
```

The `.aab` file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 4. Upload to Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → "StuManage"
3. Go to **Release → Production** (or Internal Testing first)
4. Click **Create new release**
5. Upload your `app-release.aab`
6. Fill in release notes → Save → Review → Rollout

---

## App Details
| Field | Value |
|---|---|
| Package Name | `com.stumanage.app` |
| Version | 1.0 (code: 1) |
| App Name | StuManage |
| Min Android | API 22 (Android 5.1+) |
| Target Android | API 35 (Android 15) |

## Keystore Details (KEEP SECRET)
See `KEYSTORE_INFO.txt` for full fingerprint details.

| Field | Value |
|---|---|
| File | `android/app/stumanage-release.keystore` |
| Password | `stumanage2025` |
| Alias | `stumanage` |
| SHA-1 | `4E:24:06:E3:4E:63:64:D6:71:EA:2C:83:45:34:5D:02:92:48:B8:10` |

**IMPORTANT:** Never lose the keystore file — you cannot update your Play Store app without it!

---

## Google Play Store Listing (you'll need these)
- **App icon**: `android/store-icon-512.png` (512×512, already generated)
- **Short description**: Manage your study center — students, seats, fees & WhatsApp reminders
- **Full description**: StuManage helps reading room and tuition center owners manage students, track fees, assign seats, and send WhatsApp payment reminders easily.
- **Category**: Education or Business
- **Content rating**: Everyone
- **Privacy Policy URL**: Add your deployed app URL + `/privacy`
