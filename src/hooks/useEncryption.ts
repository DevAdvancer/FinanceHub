import { useState, useCallback } from 'react';
import { encryptData, decryptData, getEncryptionKey, storeEncryptionKey, clearEncryptionKey, deriveUserEncryptionKey } from '@/lib/encryption';

// Fields to encrypt for each entity type
const ENCRYPTED_FIELDS = {
  transactions: ['amount', 'description'],
  budgets: ['amount'],
  goals: ['name', 'target_amount', 'current_amount'],
};

export function useEncryption() {
  const [isReady, setIsReady] = useState(false);

  // Initialize encryption key based on user ID - deterministic for cross-device support
  const initializeEncryption = useCallback(async (userId: string) => {
    // Always derive the same key from userId for cross-device compatibility
    const key = await deriveUserEncryptionKey(userId);
    storeEncryptionKey(key);
    setIsReady(true);
    return key;
  }, []);

  // Get the current encryption key
  const getKey = useCallback((): string => {
    const key = getEncryptionKey();
    if (!key) {
      throw new Error('Encryption not initialized');
    }
    return key;
  }, []);

  // Clear encryption on logout
  const clearEncryption = useCallback(() => {
    clearEncryptionKey();
    setIsReady(false);
  }, []);

  // Encrypt a single value
  const encrypt = useCallback(async (value: string | number): Promise<string> => {
    const key = getKey();
    return encryptData(String(value), key);
  }, [getKey]);

  // Decrypt a single value
  const decrypt = useCallback(async (encryptedValue: string): Promise<string> => {
    const key = getKey();
    try {
      return await decryptData(encryptedValue, key);
    } catch (error) {
      // Return original value if decryption fails (for unencrypted legacy data)
      console.warn('Decryption failed, returning original value');
      return encryptedValue;
    }
  }, [getKey]);

  // Check if a value is encrypted (base64 encoded with specific pattern)
  const isEncrypted = useCallback((value: string): boolean => {
    if (typeof value !== 'string') return false;
    // Encrypted values are base64 and have a minimum length
    try {
      const decoded = atob(value);
      return decoded.length >= 28; // SALT_LENGTH + IV_LENGTH minimum
    } catch {
      return false;
    }
  }, []);

  // Encrypt an entity based on its type
  const encryptEntity = useCallback(async <T extends Record<string, any>>(
    entity: T,
    entityType: keyof typeof ENCRYPTED_FIELDS
  ): Promise<T> => {
    const fieldsToEncrypt = ENCRYPTED_FIELDS[entityType];
    const encrypted: Record<string, any> = { ...entity };

    for (const field of fieldsToEncrypt) {
      if (entity[field] !== null && entity[field] !== undefined) {
        encrypted[field] = await encrypt(entity[field]);
      }
    }

    return encrypted as T;
  }, [encrypt]);

  // Decrypt an entity based on its type
  const decryptEntity = useCallback(async <T extends Record<string, any>>(
    entity: T,
    entityType: keyof typeof ENCRYPTED_FIELDS
  ): Promise<T> => {
    const fieldsToDecrypt = ENCRYPTED_FIELDS[entityType];
    const decrypted: Record<string, any> = { ...entity };

    for (const field of fieldsToDecrypt) {
      if (entity[field] !== null && entity[field] !== undefined) {
        const value = entity[field];
        // Check if the value is actually encrypted
        if (typeof value === 'string' && isEncrypted(value)) {
          const decryptedValue = await decrypt(value);
          // Try to parse as number if original was a number field
          if (field === 'amount' || field === 'target_amount' || field === 'current_amount') {
            decrypted[field] = parseFloat(decryptedValue) || 0;
          } else {
            decrypted[field] = decryptedValue;
          }
        }
      }
    }

    return decrypted as T;
  }, [decrypt, isEncrypted]);

  // Batch decrypt entities
  const decryptEntities = useCallback(async <T extends Record<string, any>>(
    entities: T[],
    entityType: keyof typeof ENCRYPTED_FIELDS
  ): Promise<T[]> => {
    return Promise.all(entities.map(entity => decryptEntity(entity, entityType)));
  }, [decryptEntity]);

  return {
    isReady,
    initializeEncryption,
    clearEncryption,
    encrypt,
    decrypt,
    encryptEntity,
    decryptEntity,
    decryptEntities,
    isEncrypted,
  };
}
