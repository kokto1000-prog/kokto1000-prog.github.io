import React, { useState, useEffect } from 'react';
import { getMonthMetadata, saveMonthMetadata } from '../utils/salaryStorage';

const WorkData = ({ date, onDataChange }) => {
    const [rate, setRate] = useState('');
    const [hours, setHours] = useState('');

    useEffect(() => {
        // Load data when date changes
        const meta = getMonthMetadata(date.getFullYear(), date.getMonth());
        setRate(meta.rate || '');
        setHours(meta.hours || '');
        // Notify parent of initial load (including inherited rate)
        if (onDataChange) onDataChange(meta);
    }, [date]);

    const handleRateChange = (val) => {
        const newRate = parseFloat(val);
        setRate(val);
        saveMonthMetadata(date.getFullYear(), date.getMonth(), { rate: newRate });
        if (onDataChange) onDataChange({ rate: newRate, hours: parseFloat(hours) || 0 });
    };

    const handleHoursChange = (val) => {
        const newHours = parseFloat(val);
        setHours(val);
        saveMonthMetadata(date.getFullYear(), date.getMonth(), { hours: newHours });
        if (onDataChange) onDataChange({ rate: parseFloat(rate) || 0, hours: newHours });
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0 0.5rem'
        }}>
            <div className="glass-card" style={{ padding: '1rem', marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Likme (€/h)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    placeholder="0.00"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--glass-border)',
                        borderRadius: 0,
                        padding: '0.5rem 0',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        marginBottom: 0
                    }}
                />
            </div>

            <div className="glass-card" style={{ padding: '1rem', marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Stundas</label>
                <input
                    type="number"
                    value={hours}
                    onChange={(e) => handleHoursChange(e.target.value)}
                    placeholder="0"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--glass-border)',
                        borderRadius: 0,
                        padding: '0.5rem 0',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        marginBottom: 0
                    }}
                />
            </div>
        </div>
    );
};

export default WorkData;
