// Robust client-side encryption using XOR cipher, TextEncoder/Decoder, and Base64.
// This properly supports all unicode characters and emojis without throwing encoding errors.

const KEY = '2512';

export function encrypt(text) {
  if (!text) return '';
  try {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
    const keyBytes = encoder.encode(KEY);
    
    const xorBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      xorBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert binary bytes to a Latin1 string safe for btoa
    let binString = '';
    for (let i = 0; i < xorBytes.length; i++) {
      binString += String.fromCharCode(xorBytes[i]);
    }
    
    return btoa(binString);
  } catch (e) {
    console.error('Encryption failed:', e);
    return '';
  }
}

export function decrypt(cipherText) {
  if (!cipherText) return '';
  try {
    const binString = atob(cipherText);
    const keyBytes = new TextEncoder().encode(KEY);
    
    const xorBytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      xorBytes[i] = binString.charCodeAt(i);
    }
    
    const textBytes = new Uint8Array(xorBytes.length);
    for (let i = 0; i < xorBytes.length; i++) {
      textBytes[i] = xorBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(textBytes);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
}

export function encryptJSON(obj) {
  return encrypt(JSON.stringify(obj));
}

export function decryptJSON(cipherText) {
  const decryptedText = decrypt(cipherText);
  if (!decryptedText) return null;
  try {
    return JSON.parse(decryptedText);
  } catch (e) {
    console.error('JSON parsing failed after decryption:', e);
    return null;
  }
}
