// Client-side encryption utilities using Web Crypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// Derive an encryption key from user's password/id
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data: string, userSecret: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(userSecret, salt);

    const encryptedContent = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
      key,
      encoder.encode(data)
    );

    // Combine salt + iv + encrypted content
    const combined = new Uint8Array(
      salt.length + iv.length + encryptedContent.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data
export async function decryptData(encryptedData: string, userSecret: string): Promise<string> {
  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted content
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encryptedContent = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(userSecret, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
      key,
      encryptedContent.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Encrypt an object (for JSON data)
export async function encryptObject<T extends object>(obj: T, userSecret: string): Promise<string> {
  const jsonString = JSON.stringify(obj);
  return encryptData(jsonString, userSecret);
}

// Decrypt an object
export async function decryptObject<T>(encryptedData: string, userSecret: string): Promise<T> {
  const jsonString = await decryptData(encryptedData, userSecret);
  return JSON.parse(jsonString) as T;
}

// Hash sensitive data (one-way, for comparison)
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate a secure random encryption key for the user
export function generateEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Derive a deterministic encryption key from user ID
// This ensures the same key is generated on any device for the same user
export async function deriveUserEncryptionKey(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  // Use a fixed salt combined with userId to create a deterministic key
  const data = encoder.encode(userId + '-lovable-finance-encryption-salt-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

// Store encryption key securely in session storage (cleared on browser close)
export function storeEncryptionKey(key: string): void {
  sessionStorage.setItem('_ek', key);
}

// Retrieve encryption key from session storage
export function getEncryptionKey(): string | null {
  return sessionStorage.getItem('_ek');
}

// Clear encryption key from session storage
export function clearEncryptionKey(): void {
  sessionStorage.removeItem('_ek');
}
