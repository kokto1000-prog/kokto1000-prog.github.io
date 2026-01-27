import React, { useState, useEffect } from 'react';

const WorkData = ({ rate: propRate, hours: propHours, onSave }) => {
    const [rate, setRate] = useState(propRate || '');
    const [hours, setHours] = useState(propHours || '');

    useEffect(() => {
        setRate(propRate || '');
        setHours(propHours || '');
    }, [propRate, propHours]);

    const handleRateChange = (val) => {
        setRate(val);
        const newRate = parseFloat(val);
        // Debouncing could be good here, but for now direct call
        if (onSave) onSave({ rate: newRate, hours: parseFloat(hours) || 0 });
    };

    const handleHoursChange = (val) => {
        setHours(val);
        const newHours = parseFloat(val);
        if (onSave) onSave({ rate: parseFloat(rate) || 0, hours: newHours });
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
