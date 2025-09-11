const generateIV = () => window.crypto.getRandomValues(new Uint8Array(12));

// Base64url helpers
const toBase64Url = (bytes) => {
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (str) => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
  const padded = base64 + '='.repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// Site-specific salt for PBKDF2. You can change the version string to rotate.
const getSiteSalt = () => {
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost';
  return new TextEncoder().encode(`encryption-tool.salt.v1::${host}`);
};

// Accept either a base64url-encoded 128/256-bit key, or derive from passphrase
const importKey = async (rawKey) => {
  try {
    // Try base64url path first
    const maybeBytes = fromBase64Url(rawKey);
    if (maybeBytes && (maybeBytes.length === 16 || maybeBytes.length === 32)) {
      return await window.crypto.subtle.importKey(
        'raw',
        maybeBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    }
  } catch (_) {
    console.log('Error importing key', _);
  }

  // Derive a 256-bit key from passphrase using PBKDF2
  const passphraseBytes = new TextEncoder().encode(rawKey);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const salt = getSiteSalt();
  const derivedKey = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return derivedKey;
};

export const encryptData = async (data, rawKey) => {
  const iv = generateIV();
  const key = await importKey(rawKey);
  const encodedData = new TextEncoder().encode(data);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  return {
    iv: Array.from(iv),
    encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
  };
};

export const decryptData = async (encryptedData, iv, rawKey) => {
  const key = await importKey(rawKey);
  const encryptedBuffer = new Uint8Array(encryptedData).buffer;
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encryptedBuffer
  );
  return new TextDecoder().decode(decryptedBuffer);
};

export const encryptFile = async (file, rawKey) => {
  const iv = generateIV();
  const key = await importKey(rawKey);
  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );
  return {
    iv: Array.from(iv),
    encryptedData: Array.from(new Uint8Array(encryptedBuffer)),
    name: file.name,
    type: file.type || 'application/octet-stream',
  };
};

export const decryptFile = async (encryptedData, iv, rawKey, mimeType) => {
  const key = await importKey(rawKey);
  const encryptedBuffer = new Uint8Array(encryptedData).buffer;
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encryptedBuffer
  );
  return new Blob([decryptedBuffer], { type: mimeType || '' });
};

export const generateKeyString = (lengthBytes = 32) => {
  const bytes = new Uint8Array(lengthBytes);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};
