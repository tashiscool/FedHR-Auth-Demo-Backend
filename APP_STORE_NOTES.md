# App Store Review Notes

## Demo Backend Information

**Backend URL:** https://YOUR-APP.vercel.app (replace after deployment)

**QR Code Generator:** https://YOUR-APP.vercel.app/qr

---

## How to Test the App

### Step 1: Access Demo Backend
Visit: https://YOUR-APP.vercel.app/qr

### Step 2: Scan QR Code
1. Open the FedHR Authenticator mobile app
2. Tap "Scan QR Code" button
3. Point camera at the QR code displayed on screen
4. App will automatically register with the demo server

### Step 3: Wait for Auth Request
- After registration, wait approximately 30 seconds
- An authentication request will appear automatically
- No manual action needed on backend

### Step 4: Approve or Deny
- Tap **"Approve"** button to approve the request
- Or tap **"Deny"** button to reject the request
- The app will send a cryptographically signed response to the server

### Step 5: Verify (Optional)
You can verify the flow worked by visiting:
- **All Requests:** https://YOUR-APP.vercel.app/api/admin/requests
- **Registered Devices:** https://YOUR-APP.vercel.app/api/admin/devices

You should see your device and the approved/denied status.

---

## Testing Multiple Requests

The backend automatically generates new auth requests every 30 seconds. You can:
1. Approve the first request
2. Wait 30 seconds
3. Deny the second request
4. Wait 30 seconds
5. Continue testing as needed

---

## What This App Does

FedHR Authenticator is a FIPS-compliant device authentication app that:

1. **Registers devices** via QR code scanning
2. **Polls for authentication requests** from registered web applications
3. **Uses hardware-backed cryptography** (Secure Enclave on iOS, AndroidKeyStore on Android)
4. **Signs approve/deny responses** with ECDSA P-256 signatures
5. **Provides non-repudiation** through device fingerprinting

---

## Security Features

- ✅ Hardware-backed key storage (cannot be extracted)
- ✅ FIPS 140-2 validated cryptography
- ✅ ECDSA P-256 digital signatures
- ✅ SHA-256 hashing
- ✅ Encrypted local storage
- ✅ No push notifications (polling-based for privacy)

---

## Privacy & Data Collection

**Data Collected:**
- Device ID (for app functionality only)
- Device fingerprint (hardware info, not linked to user identity)

**Data Sharing:**
- No third-party sharing
- Data sent only to user-configured endpoints

**Data Storage:**
- All data encrypted at rest (iOS Keychain / Android EncryptedSharedPreferences)
- Public keys stored on server (registration only)

---

## Demo Backend Details

The demo backend is a test server that:
- Accepts device registrations
- Auto-generates mock authentication requests every 30 seconds
- Accepts approve/deny responses
- Stores data in-memory (resets on restart)
- **This is for demonstration purposes only** - not a production service

---

## Contact Information

**Developer Email:** support@fedhr.com (replace with your email)
**Website:** https://fedhr.com (replace with your website)
**Support URL:** https://github.com/EconSys/FedHR-Auth (replace with your support URL)

---

## Additional Notes for Reviewers

1. **No Account Required:** The app works by scanning QR codes - no user registration needed
2. **No Subscription:** The app is free with no in-app purchases
3. **No Ads:** The app does not display advertisements
4. **Offline-First:** The app works offline until an auth request arrives
5. **Camera Permission:** Required for QR code scanning only

---

## Known Limitations (Demo Mode)

- Demo backend generates random auth requests every 30 seconds
- In production, auth requests come from real web applications
- Demo backend has no user accounts (all requests are generic)
- Data is not persisted (in-memory storage only)

---

## Screenshots Locations

Screenshots are included with the app submission showing:
1. Home screen with "Scan QR Code" button
2. QR scanner interface
3. Registered app list
4. Authentication request approval screen
5. Approved/Denied confirmation

---

## If You Have Issues

1. **QR Code won't scan?**
   - Try downloading the QR code image from `/qr/download`
   - Ensure camera permissions are granted

2. **No auth requests appearing?**
   - Wait 30 seconds after registration
   - Check that device is registered at `/api/admin/devices`

3. **App crashes?**
   - Please provide crash logs - we will fix immediately

**Contact:** support@fedhr.com for any review-related questions.
