const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qrRouter = require('./qr-generator');
const testRouter = require('./test-page');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for demo purposes
const devices = new Map(); // deviceId -> { userId, accountId, appName, publicKey, registeredAt }
const authRequests = new Map(); // requestId -> { deviceId, appName, action, timestamp, status }

// Make storage available to routes
app.locals.devices = devices;
app.locals.authRequests = authRequests;

// QR code routes
app.use('/', qrRouter);

// Test page routes
app.use('/', testRouter);

// Cleanup old auth requests every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [requestId, request] of authRequests.entries()) {
    if (request.timestamp < fiveMinutesAgo) {
      authRequests.delete(requestId);
    }
  }
}, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    devices: devices.size,
    activeRequests: authRequests.size
  });
});

// Device registration endpoint (new API - for JSON QR codes)
app.post('/api/register', (req, res) => {
  try {
    const { deviceId, userId, accountId, appName, publicKey, deviceInfo } = req.body;

    if (!deviceId || !userId || !accountId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['deviceId', 'userId', 'accountId']
      });
    }

    // Store device registration
    devices.set(deviceId, {
      userId,
      accountId,
      appName: appName || 'Demo App',
      publicKey,
      deviceInfo,
      registeredAt: new Date().toISOString()
    });

    console.log(`✓ Device registered: ${deviceId} (${appName || 'Demo App'})`);

    res.json({
      success: true,
      message: 'Device registered successfully',
      deviceId,
      registeredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Device registration endpoint (legacy API - for pipe-separated QR codes)
app.post('/fhrnavigator/device/register', (req, res) => {
  try {
    const { deviceId, deviceName, publicKey } = req.body;

    if (!deviceId || !deviceName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['deviceId', 'deviceName']
      });
    }

    // Store device registration
    devices.set(deviceId, {
      userId: 'legacy-user',
      accountId: 'legacy-account',
      appName: deviceName,
      publicKey,
      deviceInfo: null,
      registeredAt: new Date().toISOString()
    });

    console.log(`✓ Device registered (legacy): ${deviceId} (${deviceName})`);

    res.json({
      success: true,
      message: 'Device registered successfully',
      deviceId,
      registeredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Polling endpoint (new API) - returns pending auth requests for a device
app.get('/api/poll/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!devices.has(deviceId)) {
      return res.status(404).json({
        error: 'Device not registered',
        deviceId
      });
    }

    // Find pending auth requests for this device
    const pendingRequests = [];
    for (const [requestId, request] of authRequests.entries()) {
      if (request.deviceId === deviceId && request.status === 'pending') {
        pendingRequests.push({
          requestId,
          appName: request.appName,
          action: request.action,
          metadata: request.metadata,
          timestamp: request.timestamp
        });
      }
    }

    // Auto-generate a demo auth request every 30 seconds if none exist
    if (pendingRequests.length === 0) {
      const device = devices.get(deviceId);
      const lastRequest = Array.from(authRequests.values())
        .filter(r => r.deviceId === deviceId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      const thirtySecondsAgo = Date.now() - 30000;

      if (!lastRequest || lastRequest.timestamp < thirtySecondsAgo) {
        // Create a new demo auth request
        const requestId = `demo_${crypto.randomBytes(8).toString('hex')}`;
        const newRequest = {
          deviceId,
          appName: device.appName,
          action: Math.random() > 0.5 ? 'login' : 'approve_transaction',
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 Demo Browser',
            location: 'San Francisco, CA'
          },
          timestamp: Date.now(),
          status: 'pending'
        };

        authRequests.set(requestId, newRequest);

        pendingRequests.push({
          requestId,
          appName: newRequest.appName,
          action: newRequest.action,
          metadata: newRequest.metadata,
          timestamp: newRequest.timestamp
        });

        console.log(`✓ Auto-generated auth request: ${requestId} for device ${deviceId}`);
      }
    }

    res.json({
      success: true,
      requests: pendingRequests,
      polledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Polling error:', error);
    res.status(500).json({
      error: 'Polling failed',
      message: error.message
    });
  }
});

// Polling endpoint (legacy API) - POST version for mobile app
app.post('/fhrnavigator/device/poll-auth-requests', (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        error: 'Missing deviceId'
      });
    }

    if (!devices.has(deviceId)) {
      return res.status(404).json({
        error: 'Device not registered',
        deviceId
      });
    }

    // Find pending auth requests for this device
    let pendingRequest = null;
    for (const [requestId, request] of authRequests.entries()) {
      if (request.deviceId === deviceId && request.status === 'pending') {
        pendingRequest = {
          sessionId: requestId,
          timestamp: request.timestamp,
          details: `${request.action} request from ${request.appName}`
        };
        break; // Only return one request at a time
      }
    }

    // Auto-generate a demo auth request every 30 seconds if none exist
    if (!pendingRequest) {
      const device = devices.get(deviceId);
      const lastRequest = Array.from(authRequests.values())
        .filter(r => r.deviceId === deviceId)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      const thirtySecondsAgo = Date.now() - 30000;

      if (!lastRequest || lastRequest.timestamp < thirtySecondsAgo) {
        // Create a new demo auth request
        const requestId = `demo_${crypto.randomBytes(8).toString('hex')}`;
        const newRequest = {
          deviceId,
          appName: device.appName,
          action: Math.random() > 0.5 ? 'login' : 'approve_transaction',
          metadata: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 Demo Browser',
            location: 'San Francisco, CA'
          },
          timestamp: Date.now(),
          status: 'pending'
        };

        authRequests.set(requestId, newRequest);

        pendingRequest = {
          sessionId: requestId,
          timestamp: newRequest.timestamp,
          details: `${newRequest.action} request from ${newRequest.appName}`
        };

        console.log(`✓ Auto-generated auth request: ${requestId} for device ${deviceId}`);
      }
    }

    res.json({
      authRequest: pendingRequest
    });
  } catch (error) {
    console.error('Polling error:', error);
    res.status(500).json({
      error: 'Polling failed',
      message: error.message
    });
  }
});

// Auth response endpoint (new API - approve/deny)
app.post('/api/respond', (req, res) => {
  try {
    const { requestId, deviceId, response, signature, timestamp } = req.body;

    if (!requestId || !deviceId || !response) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['requestId', 'deviceId', 'response']
      });
    }

    if (!authRequests.has(requestId)) {
      return res.status(404).json({
        error: 'Auth request not found',
        requestId
      });
    }

    const request = authRequests.get(requestId);

    if (request.deviceId !== deviceId) {
      return res.status(403).json({
        error: 'Device mismatch',
        message: 'This request belongs to a different device'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Request already processed',
        status: request.status
      });
    }

    // Update request status
    request.status = response; // 'approved' or 'denied'
    request.signature = signature;
    request.respondedAt = timestamp || Date.now();

    console.log(`✓ Auth request ${response}: ${requestId}`);

    res.json({
      success: true,
      message: `Request ${response} successfully`,
      requestId,
      status: request.status
    });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({
      error: 'Response failed',
      message: error.message
    });
  }
});

// Auth response endpoint (legacy API) - for mobile app
app.post('/fhrnavigator/device/auth-response', (req, res) => {
  try {
    const { sessionId, deviceId, action, signature, timestamp } = req.body;

    if (!sessionId || !deviceId || !action) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['sessionId', 'deviceId', 'action']
      });
    }

    if (!authRequests.has(sessionId)) {
      return res.status(404).json({
        error: 'Auth request not found',
        sessionId
      });
    }

    const request = authRequests.get(sessionId);

    if (request.deviceId !== deviceId) {
      return res.status(403).json({
        error: 'Device mismatch',
        message: 'This request belongs to a different device'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Request already processed',
        status: request.status
      });
    }

    // Update request status (convert APPROVE/DENY to approved/denied)
    request.status = action === 'APPROVE' ? 'approved' : 'denied';
    request.signature = signature;
    request.respondedAt = timestamp || Date.now();

    console.log(`✓ Auth request ${request.status}: ${sessionId}`);

    res.json({
      success: true,
      message: `Request ${request.status} successfully`,
      sessionId,
      status: request.status
    });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({
      error: 'Response failed',
      message: error.message
    });
  }
});

// Admin endpoint - view all registered devices (for debugging)
app.get('/api/admin/devices', (req, res) => {
  const deviceList = Array.from(devices.entries()).map(([deviceId, data]) => ({
    deviceId,
    ...data
  }));

  res.json({
    count: deviceList.length,
    devices: deviceList
  });
});

// Admin endpoint - view all auth requests (for debugging)
app.get('/api/admin/requests', (req, res) => {
  const requestList = Array.from(authRequests.entries()).map(([requestId, data]) => ({
    requestId,
    ...data
  }));

  res.json({
    count: requestList.length,
    requests: requestList
  });
});

// Home page with API documentation
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FedHR Auth Demo Backend</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .endpoint { margin: 20px 0; padding: 15px; border-left: 4px solid #4CAF50; background: #f9f9f9; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 3px; font-weight: bold; color: white; margin-right: 10px; }
        .post { background: #4CAF50; }
        .get { background: #2196F3; }
      </style>
    </head>
    <body>
      <h1>FedHR Auth Demo Backend</h1>
      <p>This is a demo backend for testing the FedHR Authenticator mobile app.</p>

      <h2>API Endpoints</h2>

      <div class="endpoint">
        <span class="method post">POST</span>
        <strong>/api/register</strong>
        <p>Register a new device</p>
        <pre>{
  "deviceId": "unique-device-id",
  "userId": "user-id",
  "accountId": "account-id",
  "appName": "Demo App",
  "publicKey": "base64-encoded-public-key"
}</pre>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span>
        <strong>/api/poll/:deviceId</strong>
        <p>Poll for pending auth requests. Auto-generates demo requests every 30 seconds.</p>
      </div>

      <div class="endpoint">
        <span class="method post">POST</span>
        <strong>/api/respond</strong>
        <p>Respond to an auth request (approve/deny)</p>
        <pre>{
  "requestId": "request-id",
  "deviceId": "device-id",
  "response": "approved", // or "denied"
  "signature": "base64-signature",
  "timestamp": 1234567890
}</pre>
      </div>

      <h2>Admin Endpoints</h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <strong>/api/admin/devices</strong>
        <p>View all registered devices</p>
      </div>

      <div class="endpoint">
        <span class="method get">GET</span>
        <strong>/api/admin/requests</strong>
        <p>View all auth requests</p>
      </div>

      <h2>QR Code Registration</h2>
      <p>To test with the mobile app, scan a QR code with this format:</p>
      <pre>{
  "action": "register",
  "token": "demo_token_12345",
  "userId": "demo_user",
  "accountId": "demo_account",
  "endpoint": "${req.protocol}://${req.get('host')}/api",
  "appName": "Demo App"
}</pre>

      <p><a href="/qr">Generate QR Code →</a></p>

      <h2>Status</h2>
      <p>
        <strong>Registered Devices:</strong> ${devices.size}<br>
        <strong>Active Requests:</strong> ${authRequests.size}
      </p>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 FedHR Auth Demo Backend');
  console.log('='.repeat(60));
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log('');
  console.log('API Endpoints:');
  console.log(`  POST ${PORT === 3000 ? 'http://localhost:3000' : ''}/api/register`);
  console.log(`  GET  ${PORT === 3000 ? 'http://localhost:3000' : ''}/api/poll/:deviceId`);
  console.log(`  POST ${PORT === 3000 ? 'http://localhost:3000' : ''}/api/respond`);
  console.log('='.repeat(60));
});

module.exports = app;
