import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

const SALT_BYTES = 12;
const KEY_BYTES = 16;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

const scrypt = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_BYTES, SCRYPT_OPTIONS, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key as Buffer);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_BYTES);
  const key = await scrypt(password, salt);
  return `s1$${salt.toString('base64url')}$${key.toString('base64url')}`;
};

export const verifyPasswordHash = async (
  password: string,
  encoded: string
): Promise<boolean> => {
  const [version, saltValue, keyValue, extra] = encoded.split('$');
  if (version !== 's1' || !saltValue || !keyValue || extra !== undefined) {
    return false;
  }

  const salt = Buffer.from(saltValue, 'base64url');
  const expectedKey = Buffer.from(keyValue, 'base64url');
  if (salt.length !== SALT_BYTES || expectedKey.length !== KEY_BYTES) {
    return false;
  }

  const actualKey = await scrypt(password, salt);
  return timingSafeEqual(actualKey, expectedKey);
};
