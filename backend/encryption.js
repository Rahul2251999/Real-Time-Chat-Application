const NodeRSA = require('node-rsa');
const crypto = require('crypto');

// Store RSA key pairs for each room
const roomKeys = new Map(); // roomId -> { publicKey, privateKey }

// Generate RSA key pair for a room
function generateRoomKeys(roomId) {
  const key = new NodeRSA({ b: 2048 });
  // Use OAEP encryption scheme (modern secure standard)
  key.setOptions({ encryptionScheme: 'oaep' });
  const publicKey = key.exportKey('public');
  const privateKey = key.exportKey('private');
  
  roomKeys.set(roomId, {
    publicKey,
    privateKey,
    key
  });
  
  return { publicKey, privateKey };
}

// Get or generate keys for a room
function getRoomKeys(roomId) {
  if (!roomKeys.has(roomId)) {
    console.log(`Generating new RSA keys for room: ${roomId}`);
    generateRoomKeys(roomId);
  }
  return roomKeys.get(roomId);
}

// Encrypt message with room's public key
function encryptMessage(message, roomId) {
  const keys = getRoomKeys(roomId);
  const key = new NodeRSA(keys.publicKey);
  key.setOptions({ encryptionScheme: 'oaep' });
  
  // Encrypt the message
  const encrypted = key.encrypt(message, 'base64');
  return encrypted;
}

// Decrypt message with room's private key
function decryptMessage(encryptedMessage, roomId) {
  const keys = getRoomKeys(roomId);
  const key = new NodeRSA(keys.privateKey);
  key.setOptions({ encryptionScheme: 'oaep' });
  
  try {
    console.log(`Attempting to decrypt message for room: ${roomId}`);
    const decrypted = key.decrypt(encryptedMessage, 'utf8');
    console.log(`Successfully decrypted message for room: ${roomId}`);
    return decrypted;
  } catch (error) {
    console.error(`Failed to decrypt message for room ${roomId}:`, error);
    return null;
  }
}

// Get public key for a room (for clients to encrypt messages)
function getRoomPublicKey(roomId) {
  const keys = getRoomKeys(roomId);
  return keys.publicKey;
}

// Remove keys when room is deleted
function removeRoomKeys(roomId) {
  roomKeys.delete(roomId);
}

module.exports = {
  generateRoomKeys,
  getRoomKeys,
  encryptMessage,
  decryptMessage,
  getRoomPublicKey,
  removeRoomKeys
}; 