import React from 'react';
import { calculateNetFromBruto } from '../utils/taxCalculator';
import { TRANSACTION_TYPES } from '../utils/salaryStorage';

const EntryList = ({ entries, onDelete, dependents = 0, hasBook = true }) => {
    if (entries.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>Vēl nav ierakstu.</p>
            </div>
        );
    }

    return (
        <div className="animate-enter" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}>Vēsture</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {entries.map((entry) => (
                    <div key={entry.id} className="glass-card" style={{
                        padding: '1rem',
                        marginBottom: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: entry.type === TRANSACTION_TYPES.TRANSFER
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(245, 158, 11, 0.2)',
                                color: entry.type === TRANSACTION_TYPES.TRANSFER
                                    ? 'var(--accent-transfer)'
                                    : 'var(--accent-cash)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {entry.type === TRANSACTION_TYPES.TRANSFER ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                                        <path d="M12 18V6"></path>
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{entry.description}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(entry.date).toLocaleDateString('lv-LV')}
                                </p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                + €{
                                    entry.description && entry.description.includes('No Bruto')
                                        ? calculateNetFromBruto(entry.amount, dependents, hasBook)
                                        : Number(entry.amount).toFixed(2)
                                }
                            </p>
                            <button
                                onClick={() => onDelete(entry.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    padding: '0.2rem',
                                    fontSize: '0.8rem',
                                    marginTop: '0.2rem'
                                }}
                            >
                                Dzēst
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EntryList;
