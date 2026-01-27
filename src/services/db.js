import { db } from '../firebase';
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    setDoc,
    query,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { encrypt, decrypt } from '../utils/encryption';

export const TRANSACTION_TYPES = {
    TRANSFER: 'TRANSFER',
    CASH: 'CASH',
};

// Users Collection Reference
// Structure: users/{uid}/entries/{entryId}
// Structure: users/{uid}/metadata/{year-month}
// User Doc: users/{uid} (contains balanceCorrection)

export const getEntries = async (userId, key) => {
    if (!userId) return [];
    try {
        const q = query(collection(db, 'users', userId, 'entries'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            if (data.content && key) {
                try {
                    const decrypted = decrypt(data.content, key);
                    return { id: doc.id, createdAt: data.createdAt, ...decrypted };
                } catch (e) {
                    console.error("Failed to decrypt entry", doc.id, e);
                    return { id: doc.id, ...data, error: 'Decryption failed' };
                }
            }
            // Fallback for unencrypted data
            return {
                id: doc.id,
                ...data
            };
        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        return [];
    }
};

export const addEntry = async (userId, entry, key) => {
    if (!userId) return null;
    try {
        const entriesRef = collection(db, 'users', userId, 'entries');
        const createdAt = new Date().toISOString();

        let payload = { createdAt, ...entry };

        if (key) {
            // Encrypt the sensitive data (everything except createdAt to maintain sorting)
            const content = encrypt(entry, key);
            payload = {
                createdAt,
                content
            };
        }

        const docRef = await addDoc(entriesRef, payload);
        // Return cleartext for UI to update without reload
        return { id: docRef.id, createdAt, ...entry };
    } catch (error) {
        console.error('Error adding entry:', error);
        throw error;
    }
};

export const deleteEntry = async (userId, entryId) => {
    if (!userId) return;
    try {
        await deleteDoc(doc(db, 'users', userId, 'entries', entryId));
        return true;
    } catch (error) {
        console.error('Error deleting entry:', error);
        throw error;
    }
};

export const getBalanceCorrection = async (userId, key) => {
    if (!userId) return 0;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const val = userDoc.data().balanceCorrection;
            if (val === undefined) return 0;

            // If it's a string and we have a key, try to decrypt. 
            // If it's a number, return it (legacy).
            if (typeof val === 'string' && key) {
                try {
                    return Number(decrypt(val, key));
                } catch (e) {
                    return 0;
                }
            }
            return Number(val);
        }
        return 0;
    } catch (error) {
        console.error('Error fetching balance correction:', error);
        return 0;
    }
};

export const saveBalanceCorrection = async (userId, amount, key) => {
    if (!userId) return;
    try {
        const userRef = doc(db, 'users', userId);
        let valToSave = Number(amount);

        if (key) {
            valToSave = encrypt(amount, key);
        }

        await setDoc(userRef, { balanceCorrection: valToSave }, { merge: true });
        return Number(amount);
    } catch (error) {
        console.error('Error saving balance correction:', error);
    }
};

export const getMonthMetadata = async (userId, year, month, key) => {
    if (!userId) return { rate: 0, hours: 0 };
    try {
        const docKey = `${year}-${month}`;
        const metaDoc = await getDoc(doc(db, 'users', userId, 'metadata', docKey));
        const data = metaDoc.exists() ? metaDoc.data() : { rate: 0, hours: 0 };

        if (data.content && key) {
            try {
                return decrypt(data.content, key);
            } catch (e) {
                return { rate: 0, hours: 0 };
            }
        }

        return data;
    } catch (error) {
        console.error('Error fetching month metadata:', error);
        return { rate: 0, hours: 0 };
    }
};

export const getAllMetadata = async (userId, key) => {
    if (!userId) return {};
    try {
        const q = query(collection(db, 'users', userId, 'metadata'));
        const sn = await getDocs(q);
        const meta = {};
        sn.forEach(doc => {
            const data = doc.data();
            if (data.content && key) {
                try {
                    meta[doc.id] = decrypt(data.content, key);
                } catch (e) {
                    meta[doc.id] = { rate: 0, hours: 0 };
                }
            } else {
                meta[doc.id] = data;
            }
        });
        return meta;
    } catch (error) {
        console.error('Error fetching all metadata:', error);
        return {};
    }
};

export const saveMonthMetadata = async (userId, year, month, data, key) => {
    if (!userId) return;
    try {
        const docKey = `${year}-${month}`;
        const metaRef = doc(db, 'users', userId, 'metadata', docKey);

        if (key) {
            const content = encrypt(data, key);
            await setDoc(metaRef, { content }, { merge: true });
        } else {
            await setDoc(metaRef, data, { merge: true });
        }

        return data;
    } catch (error) {
        console.error('Error saving metadata:', error);
    }
};
