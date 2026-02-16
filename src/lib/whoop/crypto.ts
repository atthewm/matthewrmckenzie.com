// ============================================================================
// TOKEN ENCRYPTION (AES-256-GCM)
// ============================================================================
// Encrypts and decrypts tokens at rest using Node.js built-in crypto.
// The encryption key comes from WHOOP_ENCRYPTION_KEY env var (64 hex chars).
// ============================================================================

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { getEnvVar } from "./config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const hex = getEnvVar("WHOOP_ENCRYPTION_KEY");
  if (hex.length !== 64) {
    throw new Error("WHOOP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string. Returns a base64 string containing
 * iv + ciphertext + auth tag.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Pack: iv (12) + tag (16) + ciphertext
  const packed = Buffer.concat([iv, tag, encrypted]);
  return packed.toString("base64");
}

/**
 * Decrypt a base64 string produced by encrypt(). Returns the original
 * plaintext or throws if the key is wrong or data is tampered.
 */
export function decrypt(encoded: string): string {
  const key = getKey();
  const packed = Buffer.from(encoded, "base64");

  const iv = packed.subarray(0, IV_LENGTH);
  const tag = packed.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
