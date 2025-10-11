import express from 'express';
import { getUserByEmail, updateUser, upsertUser } from '../storage.js';
import {
  createAuthState,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  generateAuthUrl,
  storeTokens
} from '../googleAuth.js';

const router = express.Router();

router.get('/google', (req, res) => {
  const state = createAuthState(req.session);
  const url = generateAuthUrl(state);
  res.json({ url });
});

router.get('/google/redirect', async (req, res) => {
  const { code, state } = req.query;
  const { oauthState } = req.session;
  if (!code || !state || state !== oauthState) {
    return res.redirect(`${process.env.FRONTEND_ORIGIN || ''}/auth/error`);
  }

  try {
    delete req.session.oauthState;
    const { client, tokens } = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(client);

    const existing = getUserByEmail(profile.email);
    let userId;
    if (existing) {
      userId = existing.id;
      updateUser(userId, { display_name: profile.name });
    } else {
      userId = profile.id;
      upsertUser({ id: profile.id, email: profile.email, display_name: profile.name });
    }

    storeTokens(userId, tokens);
    req.session.userId = userId;
    req.session.userEmail = profile.email;
    req.session.userName = profile.name;

    const redirectTarget = `${process.env.FRONTEND_ORIGIN || ''}/auth/success`;
    res.redirect(redirectTarget);
  } catch (error) {
    console.error('OAuth callback error', error);
    res.redirect(`${process.env.FRONTEND_ORIGIN || ''}/auth/error`);
  }
});

router.get('/status', (req, res) => {
  if (req.session?.userId) {
    res.json({
      authenticated: true,
      email: req.session.userEmail,
      name: req.session.userName
    });
  } else {
    res.json({ authenticated: false });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

export default router;
