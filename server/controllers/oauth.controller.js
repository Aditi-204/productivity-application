const https = require('https');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const generateAccessToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth/callback';

// POST request helper using native https
const httpsPost = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => chunks += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// GET request helper
const httpsGet = (url) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
    };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => chunks += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch { resolve(chunks); }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

// Helper: create or login user by email
const findOrCreateUser = async (email, name, avatar) => {
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: Math.random().toString(36).slice(-12) + 'Aa1!',
      role: 'employee',
      department: 'General',
      avatar: avatar || '',
    });
  }
  return user;
};

// Helper: mark attendance
const markAttendance = async (userId) => {
  const today = formatDate(new Date());
  const existing = await Attendance.findOne({ user: userId, date: today });
  if (!existing) {
    await Attendance.create({ user: userId, date: today, status: 'present', loginTime: new Date() });
  }
};

// Helper: return HTML that posts result to parent window
const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:4173';

// --- OAuth Initiate ---
const initiateOAuth = (req, res) => {
  const { provider } = req.params;
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];

  if (provider === 'google' && clientId) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
      access_type: 'offline',
      prompt: 'consent',
      state: 'google',
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  if (provider === 'microsoft' && clientId) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: CALLBACK_URL,
      response_type: 'code',
      scope: 'User.Read Mail.Read Mail.Send offline_access',
      state: 'microsoft',
    });
    return res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
  }

  // Demo fallback
  const appName = provider === 'google' ? 'Google' : provider === 'microsoft' ? 'Microsoft' : provider;
  res.send(`
    <!DOCTYPE html>
    <html><head><title>OAuth Demo - Workflow</title>
    <style>
      body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh;
             background:#0B0F17; font-family:system-ui,sans-serif; color:#fff; }
      .card { background:rgba(20,28,41,.95); backdrop-filter:blur(20px); border-radius:24px;
              padding:40px; max-width:400px; text-align:center; border:1px solid rgba(255,255,255,.08); }
      h2 { margin:0 0 8px; font-size:22px; }
      p { color:#6B7280; font-size:14px; margin:8px 0 24px; }
      .btn { background:linear-gradient(135deg,#C4B5FD,#A5F3FC); color:#0B0F17; border:none;
             padding:12px 32px; border-radius:16px; font-size:15px; font-weight:600; cursor:pointer; }
      .btn:hover { opacity:.9; }
      .avatar { width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,.06);
                display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:28px; }
      .hint { font-size:12px; color:#4B5563; margin-top:12px; }
    </style></head><body>
    <div class="card">
      <div class="avatar">${provider === 'google' ? '🔵' : '🟦'}</div>
      <h2>Connect ${appName}</h2>
      <p>No ${appName} OAuth credentials configured.<br>Use demo mode instead.</p>
      <button class="btn" onclick="demoLogin()">Continue as demo@workflow.com</button>
      <div class="hint">To enable real OAuth: add ${provider.toUpperCase()}_CLIENT_ID to server/.env</div>
    </div>
    <script>
      function demoLogin() {
        window.location.href = '/api/auth/oauth/demo-login?provider=${provider}';
      }
    </script>
    </body></html>
  `);
};

// --- OAuth Callback ---
const oauthCallback = async (req, res) => {
  try {
    const { code, state: provider } = req.query;
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      return res.status(400).send('OAuth not configured. Missing client credentials.');
    }

    // Exchange code for tokens
    let tokenData;
    if (provider === 'google') {
      tokenData = await httpsPost('https://oauth2.googleapis.com/token', {
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: CALLBACK_URL, grant_type: 'authorization_code',
      });
    } else if (provider === 'microsoft') {
      tokenData = await httpsPost('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: CALLBACK_URL, grant_type: 'authorization_code',
      });
    } else {
      return res.status(400).send('Unknown provider');
    }

    if (!tokenData.access_token) {
      return res.status(400).send('Failed to obtain access token.');
    }

    // Get user info from provider
    let userInfo;
    if (provider === 'google') {
      userInfo = await httpsGet(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    } else if (provider === 'microsoft') {
      userInfo = await httpsGet('https://graph.microsoft.com/v1.0/me');
    }

    const email = userInfo.email || userInfo.userPrincipalName || `${provider}_${Date.now()}@workflow.demo`;
    const name = userInfo.name || userInfo.displayName || email.split('@')[0];
    const avatar = userInfo.picture || '';

    const user = await findOrCreateUser(email, name, avatar);
    await markAttendance(user._id);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userJson = encodeURIComponent(JSON.stringify(user.toJSON()));
    res.redirect(`${FRONTEND_URL}/auth/callback?accessToken=${accessToken}&user=${userJson}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent(error.message)}`);
  }
};

// --- Demo Login (used by consent page) ---
const demoOAuthLogin = async (req, res) => {
  try {
    const { provider } = req.query;
    let user = await User.findOne({ email: 'demo@workflow.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo User', email: 'demo@workflow.com',
        password: 'demo123', role: 'employee', department: 'General',
      });
    }
    await markAttendance(user._id);
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userJson = encodeURIComponent(JSON.stringify(user.toJSON()));
    res.redirect(`${FRONTEND_URL}/auth/callback?accessToken=${accessToken}&user=${userJson}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}/auth/callback?error=${encodeURIComponent(error.message)}`);
  }
};

module.exports = { initiateOAuth, oauthCallback, demoOAuthLogin };
