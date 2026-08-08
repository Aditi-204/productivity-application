const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { initiateOAuth, oauthCallback, demoOAuthLogin } = require('../controllers/oauth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// OAuth routes
router.get('/oauth/:provider', initiateOAuth);
router.get('/callback', oauthCallback);
router.get('/oauth/demo-login', demoOAuthLogin);

module.exports = router;
