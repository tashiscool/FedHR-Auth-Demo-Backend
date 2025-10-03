const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// Test page to manually trigger auth requests
router.get('/test', (req, res) => {
  // Access parent app's devices and authRequests
  const devices = req.app.locals.devices;
  const authRequests = req.app.locals.authRequests;

  const deviceList = Array.from(devices.entries()).map(([deviceId, device]) => ({
    deviceId,
    ...device
  }));

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FedHR Auth - Test Trigger</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1000px;
          margin: 50px auto;
          padding: 20px;
        }
        h1 { color: #333; }
        .device-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          border: 1px solid #ddd;
        }
        .device-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .device-name {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .device-id {
          font-size: 12px;
          color: #666;
          font-family: monospace;
          background: #fff;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .device-info {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background: #007AFF;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          margin: 5px 5px 5px 0;
        }
        .button:hover {
          background: #0051D5;
        }
        .button.success {
          background: #34C759;
        }
        .button.success:hover {
          background: #248A3D;
        }
        .empty {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        .info-box {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>📱 FedHR Auth - Test Trigger</h1>

      <div class="info-box">
        <strong>Instructions:</strong>
        <ol>
          <li>Registered devices appear below</li>
          <li>Click "Send Auth Request" to trigger an authentication request</li>
          <li>The mobile app will receive the request within 5 seconds</li>
          <li>Tap Approve or Deny in the app to test the flow</li>
        </ol>
      </div>

      <h2>Registered Devices (${deviceList.length})</h2>

      ${deviceList.length === 0 ? `
        <div class="empty">
          <p>No devices registered yet.</p>
          <p>Scan the QR code from <a href="/qr">/qr</a> to register a device.</p>
        </div>
      ` : deviceList.map(device => `
        <div class="device-card">
          <div class="device-header">
            <div>
              <div class="device-name">${device.appName || 'Unknown App'}</div>
              <div class="device-info">User: ${device.userId} | Account: ${device.accountId}</div>
              <div class="device-id">${device.deviceId}</div>
            </div>
          </div>
          <div>
            <button class="button" onclick="sendAuthRequest('${device.deviceId}', 'login')">
              🔐 Send Login Request
            </button>
            <button class="button" onclick="sendAuthRequest('${device.deviceId}', 'approve_transaction')">
              💰 Send Transaction Request
            </button>
            <button class="button" onclick="sendAuthRequest('${device.deviceId}', 'verify_identity')">
              ✅ Send Verify Request
            </button>
          </div>
        </div>
      `).join('')}

      <div style="margin-top: 40px;">
        <a href="/qr" class="button">📱 Generate QR Code</a>
        <a href="/api/admin/devices" class="button">👥 View All Devices</a>
        <a href="/api/admin/requests" class="button">📋 View All Requests</a>
      </div>

      <script>
        async function sendAuthRequest(deviceId, action) {
          try {
            const response = await fetch('/api/test/trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deviceId, action })
            });

            const result = await response.json();

            if (result.success) {
              alert(\`✅ Auth request sent!\\n\\nRequest ID: \${result.requestId}\\nAction: \${action}\\n\\nCheck your mobile app in ~5 seconds.\`);
            } else {
              alert(\`❌ Error: \${result.error}\`);
            }
          } catch (error) {
            alert(\`❌ Error: \${error.message}\`);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint to trigger auth request
router.post('/api/test/trigger', (req, res) => {
  try {
    const devices = req.app.locals.devices;
    const authRequests = req.app.locals.authRequests;

    const { deviceId, action } = req.body;

    if (!devices.has(deviceId)) {
      return res.status(404).json({
        success: false,
        error: 'Device not registered'
      });
    }

    const device = devices.get(deviceId);
    const requestId = `test_${crypto.randomBytes(8).toString('hex')}`;

    const newRequest = {
      deviceId,
      appName: device.appName,
      action: action || 'login',
      metadata: {
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('user-agent') || 'Test Browser',
        location: 'Test Location',
        testMode: true
      },
      timestamp: Date.now(),
      status: 'pending'
    };

    authRequests.set(requestId, newRequest);

    res.json({
      success: true,
      requestId,
      message: `Auth request created for ${device.appName}`,
      action
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
