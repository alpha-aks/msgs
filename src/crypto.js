// Simple client-side encryption using XOR cipher and Base64 encoding
// This turns any JSON string into scrambled gibberish, decryptable only with the correct passcode

const KEY = '2512';

export function encrypt(text) {
  if (!text) return '';
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyChar = KEY.charCodeAt(i % KEY.length);
      // XOR the character code with the key character code
      const xorValue = charCode ^ keyChar;
      result += String.fromCharCode(xorValue);
    }
    // Encode to base64 to make it safe for HTTP transmission
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    console.error('Encryption failed:', e);
    return text;
  }
}

export function decrypt(cipherText) {
  if (!cipherText) return '';
  try {
    const rawString = decodeURIComponent(escape(atob(cipherText)));
    let result = '';
    for (let i = 0; i < rawString.length; i++) {
      const charCode = rawString.charCodeAt(i);
      const keyChar = KEY.charCodeAt(i % KEY.length);
      const xorValue = charCode ^ keyChar;
      result += String.fromCharCode(xorValue);
    }
    return result;
  } catch (e) {
    console.error('Decryption failed. Passcode might be incorrect.');
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
    return null;
  }
}
