import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES.
 * @param {any} data - Data to encrypt (object, string, number, etc.)
 * @param {string} key - The encryption key (derived from PIN)
 * @returns {string} - The encrypted ciphertext string
 */
export const encrypt = (data, key) => {
    if (!key) throw new Error("Encryption key is missing");
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
        return encrypted;
    } catch (error) {
        console.error("Encryption failed:", error);
        throw error;
    }
};

/**
 * Decrypts ciphertext using AES.
 * @param {string} ciphertext - The encrypted string
 * @param {string} key - The encryption key (derived from PIN)
 * @returns {any} - The original data
 */
export const decrypt = (ciphertext, key) => {
    if (!key) throw new Error("Encryption key is missing");
    if (!ciphertext) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) throw new Error("Decryption result is empty (Wrong Key?)");
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Nevarēja atšifrēt datus. Iespējams, nepareizs PIN.");
    }
};

/**
 * Hash the PIN to create a stable key.
 * We don't store the PIN, but we use the hash as the key.
 */
export const hashPin = (pin) => {
    return CryptoJS.SHA256(pin).toString();
};
