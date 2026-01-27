import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { signup, login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            if (isLogin) {
                await login(emailRef.current.value, passwordRef.current.value);
            } else {
                await signup(emailRef.current.value, passwordRef.current.value);
            }
        } catch (err) {
            console.error(err);
            setError(isLogin ? 'Failed to log in: ' + err.message : 'Failed to create an account: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isLogin ? 'Pieslēgties' : 'Reģistrēties'}
                </h2>
                {error && <div style={{ color: 'var(--expense)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label>Epasts</label>
                        <input type="email" ref={emailRef} required placeholder="piemers@epasts.lv" />
                    </div>
                    <div className="form-group">
                        <label>Parole</label>
                        <input type="password" ref={passwordRef} required placeholder="******" />
                    </div>

                    <button disabled={loading} type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                        {isLogin ? 'Ienākt' : 'Reģistrēties'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    {isLogin ? 'Nav konta? ' : 'Jau ir konts? '}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isLogin ? 'Izveidot' : 'Pieslēgties'}
                    </span>
                </div>
            </div>
        </div>
    );
}
