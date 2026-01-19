import React from 'react';

const Dashboard = ({ receivedTotal, transferTotal = 0, cashTotal = 0, expectedTotal, cumulativeBalance = 0, label }) => {
    // Formula: Iekšā = Pienākas - (Neto + Uz rokas)
    // "Saņemts" section now shows sum of Neto (Transfer) and Uz rokas (Cash)
    const totalReceived = transferTotal + cashTotal;
    const balance = expectedTotal - totalReceived;

    const isPositive = balance > 0; // Means we are owed money (positive "Iekšā")
    const isNegative = balance < 0; // Means we were overpaid

    return (
        <div className="glass-card animate-enter" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.75rem',
                    marginBottom: '0.2rem'
                }}>
                    {label}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
                {/* Expected (Pienākas) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Pienākas</p>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        € {expectedTotal.toFixed(2)}
                    </p>
                </div>

                {/* Received (Bruto -> Neto) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Neto</p>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-transfer)' }}>
                        € {transferTotal.toFixed(2)}
                    </p>
                </div>

                {/* Received (Summa) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Saņemts</p>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        € {totalReceived.toFixed(2)}
                    </p>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

            {/* Balance (Iekšā / Atlikums) */}
            <div style={{ textAlign: 'center' }}>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    Iekšā (Atlikums)
                </p>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    margin: 0,
                    color: isPositive ? 'var(--accent-cash)' : (isNegative ? 'var(--text-muted)' : 'var(--text-primary)'),
                    textShadow: isPositive ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none'
                }}>
                    € {(balance + (cumulativeBalance || 0)).toFixed(2)}
                </h2>
                {cumulativeBalance !== 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        (Mēnesī: {balance > 0 ? '+' : ''}{balance.toFixed(2)} | Iepriekš: {cumulativeBalance > 0 ? '+' : ''}{cumulativeBalance.toFixed(2)})
                    </p>
                )}
            </div>

        </div>
    );
};

export default Dashboard;
