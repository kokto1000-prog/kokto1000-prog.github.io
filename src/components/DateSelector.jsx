import React from 'react';

const DateSelector = ({ currentDate, onChange }) => {
    // Helpers to format date in Latvian
    const formatMonth = (date) => {
        const months = [
            'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
            'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
        ];
        return months[date.getMonth()];
    };

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onChange(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onChange(newDate);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            padding: '0 0.5rem'
        }}>
            <button
                onClick={handlePrev}
                style={{
                    background: 'transparent',
                    padding: '0.5rem',
                    color: 'var(--text-secondary)'
                }}
                aria-label="Iepriekšējais mēnesis"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0' }}>
                    {formatMonth(currentDate)}
                </h2>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {currentDate.getFullYear()}
                </span>
            </div>

            <button
                onClick={handleNext}
                style={{
                    background: 'transparent',
                    padding: '0.5rem',
                    color: 'var(--text-secondary)'
                }}
                aria-label="Nākamais mēnesis"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
};

export default DateSelector;
