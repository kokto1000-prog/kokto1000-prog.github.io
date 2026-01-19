import React, { useState, useEffect } from 'react';
import { calculateNetFromBruto } from '../utils/taxCalculator';

const SalaryCalculator = ({ onClose }) => {
    const [bruto, setBruto] = useState('');
    const [dependents, setDependents] = useState(0);
    const [hasBook, setHasBook] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (bruto && bruto > 0) {
            const net = calculateNetFromBruto(bruto, dependents, hasBook);
            setResult(net);
        } else {
            setResult(null);
        }
    }, [bruto, dependents, hasBook]);

    return (
        <div className="glass-card animate-enter" style={{ position: 'relative' }}>
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    padding: '0.2rem'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Algas Kalkulators</h2>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Bruto alga (€)
                </label>
                <input
                    type="number"
                    value={bruto}
                    onChange={(e) => setBruto(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Apgādājamie
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        value={dependents}
                        onChange={(e) => setDependents(Number(e.target.value))}
                    />
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={hasBook}
                            onChange={(e) => setHasBook(e.target.checked)}
                            style={{ width: '20px', height: '20px', margin: 0 }}
                        />
                        <span>Nodokļu grāmatiņa</span>
                    </label>
                </div>
            </div>

            {result !== null && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aprēķinātais Neto (Uz rokas)</p>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                        € {result.toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SalaryCalculator;
