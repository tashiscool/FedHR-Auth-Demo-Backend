# FedHR Auth Demo Backend

A lightweight demo backend for testing the FedHR Authenticator mobile app. This server provides device registration, authentication request polling, and signature verification endpoints.

## Features

- ✅ **Device Registration** - Register mobile devices via QR code
- ✅ **Auto-generated Auth Requests** - Creates demo auth requests every 30 seconds
- ✅ **Approve/Deny Responses** - Accepts signed responses from devices
- ✅ **QR Code Generator** - Built-in QR code generator for easy testing
- ✅ **Admin Dashboard** - View registered devices and auth requests
- ✅ **Zero Configuration** - Works out of the box, no database required
- ✅ **CORS Enabled** - Works with mobile apps and web apps

## Quick Start

### Local Development

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

### Test with Mobile App

1. Start the server locally
2. Visit `http://localhost:3000/qr` to generate a QR code
3. Scan the QR code with the FedHR Authenticator app
4. Wait 30 seconds for an auth request to appear
5. Approve or deny the request

## API Endpoints

### Device Registration

```
POST /api/register
Content-Type: application/json

{
  "deviceId": "unique-device-id",
  "userId": "user-id",
  "accountId": "account-id",
  "appName": "Demo App",
  "publicKey": "base64-encoded-public-key",
  "deviceInfo": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "deviceId": "unique-device-id",
  "registeredAt": "2025-10-03T05:30:00.000Z"
}
```

### Poll for Auth Requests

```
GET /api/poll/:deviceId
```

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "requestId": "demo_abc123",
      "appName": "Demo App",
      "action": "login",
      "metadata": {
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 Demo Browser",
        "location": "San Francisco, CA"
      },
      "timestamp": 1696345800000
    }
  ],
  "polledAt": "2025-10-03T05:30:00.000Z"
}
```

### Respond to Auth Request

```
POST /api/respond
Content-Type: application/json

{
  "requestId": "demo_abc123",
  "deviceId": "unique-device-id",
  "response": "approved",  // or "denied"
  "signature": "base64-encoded-signature",
  "timestamp": 1696345800000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "requestId": "demo_abc123",
  "status": "approved"
}
```

### Admin Endpoints

**View All Devices:**
```
GET /api/admin/devices
```

**View All Auth Requests:**
```
GET /api/admin/requests
```

## QR Code Format

The mobile app expects QR codes in this format:

```json
{
  "action": "register",
  "token": "demo_token_12345",
  "userId": "demo_user",
  "accountId": "demo_account",
  "endpoint": "https://your-backend.com/api",
  "appName": "Demo App"
}
```

Generate a QR code at `/qr`

## Deployment

### Deploy to Vercel (Free)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy

The app will be live at `https://your-project.vercel.app`

### Deploy to Railway (Free Tier)

1. Create account at https://railway.app
2. Create new project
3. Connect GitHub repo or use CLI:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Deploy to Heroku

```bash
heroku create fedhr-auth-demo
git push heroku main
heroku open
```

## Environment Variables

No environment variables required! The server works out of the box.

Optional:
- `PORT` - Server port (default: 3000)

## For App Store Reviewers

### How to Test

1. Visit the deployed backend URL (e.g., `https://fedhr-demo.vercel.app`)
2. Click "Generate QR Code" or visit `/qr`
3. Scan the QR code with the FedHR Authenticator mobile app
4. The app will register with this server
5. Wait 30 seconds - an authentication request will appear automatically
6. Tap "Approve" or "Deny" to complete the flow

### Monitoring

- **Registered Devices:** Visit `/api/admin/devices`
- **Auth Requests:** Visit `/api/admin/requests`
- **Health Check:** Visit `/health`

### Demo Features

- ✅ Auto-generates auth requests every 30 seconds
- ✅ No manual setup required
- ✅ Works with any device
- ✅ Simulates real authentication flow
- ✅ All data stored in-memory (resets on restart)

## Architecture

- **Express.js** - Web server
- **In-memory storage** - No database required (Map objects)
- **CORS enabled** - Works with mobile apps
- **Auto-cleanup** - Old requests deleted after 5 minutes
- **QR Code generation** - Built-in QR code library

## Security Notes

⚠️ **This is a DEMO server** - Do not use in production!

- No authentication/authorization
- In-memory storage (data lost on restart)
- No rate limiting
- No signature verification (accepts any signature)
- Public admin endpoints

For production use, implement:
- Proper authentication
- Database (PostgreSQL, MongoDB)
- Rate limiting
- Signature verification
- API keys/tokens
- HTTPS only
- Protected admin endpoints

## License

MIT

## Support

For issues or questions:
- GitHub: https://github.com/EconSys/FedHR-Auth
- Email: support@fedhr.com
