const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});

app.use('/api/', apiLimiter);

// Static files (APK downloads, assets)
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Multi-Vendor Food & Grocery Delivery API',
  });
});

// Direct APK download route
app.get(['/QuickBite.apk', '/download/apk'], (req, res) => {
  const apkPath = path.join(__dirname, 'public', 'QuickBite.apk');
  res.download(apkPath, 'QuickBite.apk', (err) => {
    if (err) {
      res.status(404).send('APK file not found. Please build or copy QuickBite.apk into server/public directory.');
    }
  });
});

// Mobile download landing page
app.get('/download', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download QuickBite Android App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #1e293b; border-radius: 20px; max-width: 480px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; }
    .badge { display: inline-block; background: #059669; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px; }
    h1 { font-size: 26px; font-weight: 800; color: #f8fafc; margin-bottom: 8px; }
    p.sub { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .btn { display: block; background: #f97316; color: white; text-decoration: none; font-weight: 700; font-size: 16px; padding: 16px 24px; border-radius: 12px; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4); margin-bottom: 24px; }
    .btn:hover { background: #ea580c; transform: translateY(-2px); }
    .btn:active { transform: translateY(0); }
    .info-box { background: #0f172a; border-radius: 12px; padding: 16px; text-align: left; font-size: 13px; color: #cbd5e1; border: 1px solid #334155; }
    .info-box ol { padding-left: 20px; margin-top: 8px; }
    .info-box li { margin-bottom: 6px; }
    .tag { color: #38bdf8; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Android Native App</div>
    <h1>QuickBite Delivery</h1>
    <p class="sub">Multi-Vendor Food & Grocery Delivery with real-time Phone Notifications and Fatepura 389172 Delivery Zone</p>
    <a href="/QuickBite.apk" class="btn" download>📥 Download QuickBite.apk</a>
    <div class="info-box">
      <strong>Installation Steps on Phone:</strong>
      <ol>
        <li>Tap the orange <strong>Download</strong> button above.</li>
        <li>Open the downloaded <span class="tag">QuickBite.apk</span> file from notifications or Downloads folder.</li>
        <li>If prompted, tap <em>Settings</em> and allow <em>"Install unknown apps"</em> for your browser.</li>
        <li>Tap <strong>Install</strong> and open the app.</li>
        <li>Grant <strong>Notification permission</strong> when prompted so alerts buzz and chime on your phone!</li>
      </ol>
    </div>
  </div>
</body>
</html>`);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/delivery-partners', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
