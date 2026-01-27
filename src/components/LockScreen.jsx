import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { encrypt, decrypt, hashPin } from '../utils/encryption';

const LockScreen = ({ onUnlock }) => {
    const { currentUser } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, setup, unlock
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkSecurityStatus();
    }, [currentUser]);

    const checkSecurityStatus = async () => {
        if (!currentUser) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, 'security', 'check');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setStatus('unlock');
            } else {
                setStatus('setup');
            }
        } catch (error) {
            console.error("Failed to check security:", error);
            setError("Kļūda pārbaudot drošību.");
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        if (pin.length < 4) {
            setError("PIN jābūt vismaz 4 zīmēm");
            return;
        }
        if (pin !== confirmPin) {
            setError("PIN kodi nesakrīt");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const key = hashPin(pin);
            // Create a security check document encrypted with this key
            // We store a known value. If we can decrypt it later and get the known value, the PIN is correct.
            const payload = { status: 'OK', timestamp: Date.now() };
            const encrypted = encrypt(payload, key);

            await setDoc(doc(db, 'users', currentUser.uid, 'security', 'check'), {
                content: encrypted
            });

            // Unlock immediately
            onUnlock(key);
        } catch (err) {
            console.error(err);
            setError("Kļūda iestatot PIN.");
        }
        setLoading(false);
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const key = hashPin(pin);
            const docRef = doc(db, 'users', currentUser.uid, 'security', 'check');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const encryptedContent = docSnap.data().content;
                // Try to decrypt
                const data = decrypt(encryptedContent, key);

                if (data && data.status === 'OK') {
                    onUnlock(key);
                } else {
                    setError("Nepareizs PIN kods");
                }
            } else {
                // Should not happen if status is unlock, but reset to setup if missing
                setStatus('setup');
            }
        } catch (err) {
            console.error(err);
            setError("Nepareizs PIN kods vai kļūda.");
        }
        setLoading(false);
    };

    if (status === 'loading') {
        return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Pārbauda drošību...</div>;
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '1rem',
            background: 'var(--bg-gradient)'
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <h2 style={{ marginBottom: '1rem' }}>
                    {status === 'setup' ? 'Iestatiet Datu PIN' : 'Ievadiet Datu PIN'}
                </h2>

                {status === 'setup' && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Izdomājiet drošu PIN kodu. Tas tiks izmantots visu jūsu datu šifrēšanai.
                        <br /><strong style={{ color: 'var(--expense)' }}> Ja aizmirsīsiet PIN, dati būs zaudēti!</strong>
                    </p>
                )}

                {error && <div style={{ color: 'var(--expense)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={status === 'setup' ? handleSetup : handleUnlock}>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN kods"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.5rem',
                            textAlign: 'center',
                            letterSpacing: '0.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'white',
                            marginBottom: '1rem'
                        }}
                    />

                    {status === 'setup' && (
                        <input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            placeholder="Atkārtojiet PIN"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                letterSpacing: '0.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                marginBottom: '1rem'
                            }}
                        />
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="submit-btn"
                    >
                        {loading ? 'Apstrādā...' : (status === 'setup' ? 'Šifrēt un Sākt' : 'Atslēgt Datus')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LockScreen;
