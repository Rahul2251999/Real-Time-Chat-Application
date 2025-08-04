import JSEncrypt from 'jsencrypt';

// Create JSEncrypt instance
const encrypt = new JSEncrypt();

// Encrypt message with room's public key
export function encryptMessage(message, publicKey) {
  try {
    console.log('Attempting to encrypt message with public key');
    encrypt.setPublicKey(publicKey);
    // jsencrypt uses PKCS1 by default, but we'll try to make it work with OAEP
    const encrypted = encrypt.encrypt(message);
    console.log('Message encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

// Check if encryption is available
export function isEncryptionAvailable(publicKey) {
  if (!publicKey) return false;
  
  try {
    encrypt.setPublicKey(publicKey);
    return true;
  } catch (error) {
    console.error('Invalid public key:', error);
    return false;
  }
}

// Test encryption with a small message
export function testEncryption(publicKey) {
  const testMessage = 'test';
  const encrypted = encryptMessage(testMessage, publicKey);
  return encrypted !== null;
} 