// src/lib/security/crypto.ts

import crypto from "crypto";

const secret = process.env.ENCRYPTION_KEY;

// 1. Perform the check at the top level.
if (!secret || secret.length !== 32) {
  throw new Error(
    "ENCRYPTION_KEY environment variable must be a 32-character string."
  );
}

// 2. Create the key Buffer once, after the check.
//    Now, TypeScript knows `key` is of type Buffer, not undefined.
const key = Buffer.from(secret);
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a piece of text.
 * @param text The text to encrypt.
 * @returns The encrypted string, including the IV for decryption.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv); // Use the pre-made key
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts a piece of text.
 * @param text The encrypted text (including the IV).
 * @returns The original, decrypted text.
 */
export function decrypt(text: string): string {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv); // Use the pre-made key
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}