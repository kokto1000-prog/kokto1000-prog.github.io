import React from 'react';

const SummaryCard = ({ total, label = "Šis mēnesis" }) => {
    return (
        <div className="glass-card animate-enter" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 41, 59, 0.7) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            textAlign: 'center',
            padding: '2.5rem 1.5rem'
        }}>
            <p style={{
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.75rem',
                marginBottom: '0.5rem'
            }}>
                {label}
            </p>
            <h2 style={{
                fontSize: '3rem',
                fontWeight: '800',
                background: 'linear-gradient(to right, #fff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
            }}>
                € {total.toFixed(2)}
            </h2>
        </div>
    );
};

export default SummaryCard;
