import React, { useState } from 'react';
import { calculateNetFromBruto } from '../utils/taxCalculator';

const Dashboard = ({ receivedTotal, transferTotal = 0, cashTotal = 0, expectedTotal, cumulativeBalance = 0, balanceCorrection = 0, onCorrectionChange, label, dependents = 0, hasBook = true }) => {
    const [isEditingCorrection, setIsEditingCorrection] = useState(false);
    const [tempCorrection, setTempCorrection] = useState(balanceCorrection.toString());

    // Formula: Iekšā = Pienākas - Bruto - Uz rokas + Korekcija
    // transferTotal is Bruto. cashTotal is Cash (Net).
    // Saņemts (Display) should be Net = Net(Transfer) + Cash

    // We assume transferTotal is Bruto. Calculate Net for display.
    const netTransfer = calculateNetFromBruto(transferTotal, dependents, hasBook);
    const totalReceived = netTransfer + cashTotal;

    const balance = expectedTotal - transferTotal - cashTotal;

    const finalBalance = balance + (cumulativeBalance || 0) + (balanceCorrection || 0);

    const isPositive = finalBalance > 0; // Means we are owed money (positive "Iekšā")
    const isNegative = finalBalance < 0; // Means we were overpaid

    const handleSaveCorrection = () => {
        if (onCorrectionChange) {
            onCorrectionChange(tempCorrection);
        }
        setIsEditingCorrection(false);
    };

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
                {/* Expected (Pienākas) */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Pienākas</p>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        € {expectedTotal.toFixed(2)}
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Iekšā (Atlikums)
                    </p>
                    <button
                        onClick={() => {
                            setTempCorrection(balanceCorrection.toString());
                            setIsEditingCorrection(!isEditingCorrection);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7
                        }}
                        title="Labot korekciju"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>

                {isEditingCorrection ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input
                            type="number"
                            value={tempCorrection}
                            onChange={(e) => setTempCorrection(e.target.value)}
                            style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--text-muted)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                width: '80px',
                                textAlign: 'center'
                            }}
                            autoFocus
                        />
                        <button
                            onClick={handleSaveCorrection}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        margin: 0,
                        color: isPositive ? 'var(--accent-cash)' : (isNegative ? 'var(--text-muted)' : 'var(--text-primary)'),
                        textShadow: isPositive ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none'
                    }}>
                        € {finalBalance.toFixed(2)}
                    </h2>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {(cumulativeBalance !== 0 || balanceCorrection !== 0) && (
                        <span>
                            (Mēnesī: {balance > 0 ? '+' : ''}{balance.toFixed(2)}
                            {cumulativeBalance !== 0 && ` | Iepriekš: ${cumulativeBalance > 0 ? '+' : ''}${cumulativeBalance.toFixed(2)}`}
                            {balanceCorrection !== 0 && ` | Korekcija: ${balanceCorrection > 0 ? '+' : ''}${balanceCorrection.toFixed(2)}`}
                            )
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
