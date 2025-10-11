import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-character hex string');
  }
  return Buffer.from(key, 'hex');
}

export function encrypt(value) {
  if (!value) return value;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), encrypted.toString('hex'), authTag.toString('hex')].join(':');
}

export function decrypt(payload) {
  if (!payload) return payload;
  const [ivHex, encryptedHex, authTagHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
