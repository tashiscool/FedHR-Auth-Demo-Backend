const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

// QR code generator page
router.get('/qr', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const registrationData = {
      action: 'register',
      token: 'demo_token_' + Date.now(),
      userId: 'demo_user',
      accountId: 'demo_account',
      endpoint: `${baseUrl}/api`,
      appName: 'Demo App'
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(registrationData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 400,
      margin: 2
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FedHR Auth - QR Code Generator</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          h1 { color: #333; }
          .qr-container {
            margin: 30px 0;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 10px;
            display: inline-block;
          }
          .qr-image {
            border: 10px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 10px;
          }
          .json-data {
            text-align: left;
            background: #f4f4f4;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            overflow-x: auto;
          }
          pre {
            margin: 0;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            font-weight: bold;
          }
          .button:hover {
            background: #45a049;
          }
          .instructions {
            text-align: left;
            background: #e3f2fd;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <h1>📱 FedHR Authenticator - Demo QR Code</h1>

        <div class="qr-container">
          <img src="${qrDataUrl}" alt="Registration QR Code" class="qr-image">
        </div>

        <div class="instructions">
          <h3>📋 How to Test:</h3>
          <ol>
            <li>Open the <strong>FedHR Authenticator</strong> app on your mobile device</li>
            <li>Tap <strong>"Scan QR Code"</strong></li>
            <li>Point your camera at the QR code above</li>
            <li>The app will register with this demo server</li>
            <li>Wait 30 seconds and a demo auth request will appear</li>
            <li>Tap <strong>Approve</strong> or <strong>Deny</strong> to test the flow</li>
          </ol>
        </div>

        <h3>📄 QR Code Data:</h3>
        <div class="json-data">
          <pre>${JSON.stringify(registrationData, null, 2)}</pre>
        </div>

        <div>
          <a href="/" class="button">← Back to Home</a>
          <a href="/qr" class="button">🔄 Generate New QR Code</a>
          <a href="/api/admin/devices" class="button">👥 View Devices</a>
        </div>

        <h3>🔗 API Endpoint</h3>
        <p><code>${baseUrl}/api</code></p>

        <div style="margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 5px;">
          <h4>⚠️ For App Store Reviewers:</h4>
          <p>This QR code can be scanned to register a test device. After registration, authentication requests will appear automatically every 30 seconds for testing.</p>
          <p>You can monitor activity at: <a href="/api/admin/devices">/api/admin/devices</a> and <a href="/api/admin/requests">/api/admin/requests</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).send('Error generating QR code');
  }
});

// Download QR code as image
router.get('/qr/download', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const registrationData = {
      action: 'register',
      token: 'demo_token_' + Date.now(),
      userId: 'demo_user',
      accountId: 'demo_account',
      endpoint: `${baseUrl}/api`,
      appName: 'Demo App'
    };

    const qrBuffer = await QRCode.toBuffer(JSON.stringify(registrationData), {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 400,
      margin: 2
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="fedhr-auth-qr.png"');
    res.send(qrBuffer);
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).send('Error generating QR code');
  }
});

module.exports = router;
