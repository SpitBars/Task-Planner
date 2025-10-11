import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import {
  getTokens as getStoredTokenPayload,
  saveTokens as persistTokens
} from './storage.js';
import { encrypt, decrypt } from './utils/encryption.js';

const OAuth2 = google.auth.OAuth2;

function createOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth environment variables are not configured');
  }
  return new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function generateAuthUrl(state) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent',
    include_granted_scopes: true,
    state
  });
}

export function createAuthState(session) {
  const state = nanoid(24);
  session.oauthState = state;
  return state;
}

export async function exchangeCodeForTokens(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  return { client, tokens };
}

export function storeTokens(userId, tokens) {
  const existingRaw = getStoredTokenPayload(userId);
  const existing = existingRaw
    ? {
        access_token: decrypt(existingRaw.access_token),
        refresh_token: decrypt(existingRaw.refresh_token),
        scope: existingRaw.scope,
        token_type: existingRaw.token_type,
        expiry_date: existingRaw.expiry_date
      }
    : null;

  const accessToken = tokens.access_token || existing?.access_token;
  const refreshToken = tokens.refresh_token || existing?.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error('Missing OAuth tokens');
  }

  persistTokens(userId, {
    access_token: encrypt(accessToken),
    refresh_token: encrypt(refreshToken),
    scope: tokens.scope || existing?.scope || existingRaw?.scope || null,
    token_type: tokens.token_type || existing?.token_type || existingRaw?.token_type || null,
    expiry_date: tokens.expiry_date || existing?.expiry_date || existingRaw?.expiry_date || null
  });
}

export function getStoredTokens(userId) {
  const row = getStoredTokenPayload(userId);
  if (!row) return null;
  return {
    access_token: decrypt(row.access_token),
    refresh_token: decrypt(row.refresh_token),
    scope: row.scope,
    token_type: row.token_type,
    expiry_date: row.expiry_date
  };
}

export async function getAuthorizedClient(userId) {
  const tokens = getStoredTokens(userId);
  if (!tokens) {
    throw new Error('Tokens not found for user');
  }
  const client = createOAuthClient();
  client.setCredentials(tokens);
  client.on('tokens', (updated) => {
    if (updated.access_token || updated.refresh_token) {
      storeTokens(userId, { ...tokens, ...updated });
    }
  });
  return client;
}

export async function fetchGoogleProfile(client) {
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();
  return data;
}
