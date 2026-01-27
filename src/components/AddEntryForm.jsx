import React, { useState, useEffect } from 'react';
import { TRANSACTION_TYPES } from '../services/db';
import { calculateNetFromBruto } from '../utils/taxCalculator';

const AddEntryForm = ({ onAdd, onClose }) => {
    const [inputMode, setInputMode] = useState('NET'); // 'NET' or 'BRUTO'
    const [amount, setAmount] = useState('');
    const [type, setType] = useState(TRANSACTION_TYPES.CASH);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Tax params
    const [dependents, setDependents] = useState(0);
    const [hasBook, setHasBook] = useState(true);
    const [calculatedNet, setCalculatedNet] = useState(null);

    useEffect(() => {
        if (inputMode === 'BRUTO' && amount) {
            setCalculatedNet(calculateNetFromBruto(amount, dependents, hasBook));
        } else {
            setCalculatedNet(null);
        }
    }, [amount, dependents, hasBook, inputMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        let finalAmount = parseFloat(amount);
        let finalDesc = description;
        let finalType = TRANSACTION_TYPES.TRANSFER; // Default for NET and BRUTO

        if (inputMode === 'BRUTO') {
            // Keep the gross amount as is
            finalAmount = parseFloat(amount);
            if (!finalDesc) {
                finalDesc = `Alga (No Bruto: ${amount}€)`;
            }
        } else if (inputMode === 'CASH') {
            finalType = TRANSACTION_TYPES.CASH;
            if (!finalDesc) {
                finalDesc = 'Alga (Uz rokas)';
            }
        } else {
            // NET mode
            if (!finalDesc) {
                finalDesc = 'Alga';
            }
        }

        onAdd({
            amount: finalAmount,
            type: finalType,
            description: finalDesc,
            date
        });

        // Reset form
        setAmount('');
        setDescription('');
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="animate-enter">

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setInputMode(inputMode === 'BRUTO' ? 'NET' : 'BRUTO')}
                    style={{
                        background: inputMode === 'BRUTO' ? 'var(--bg-card-hover)' : 'transparent',
                        border: inputMode === 'BRUTO' ? '1px solid var(--primary)' : '1px solid transparent',
                        color: inputMode === 'BRUTO' ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        flex: 1,
                        maxWidth: '120px'
                    }}
                >
                    Bruto
                </button>
                <button
                    type="button"
                    onClick={() => setInputMode(inputMode === 'CASH' ? 'NET' : 'CASH')}
                    style={{
                        background: inputMode === 'CASH' ? 'var(--bg-card-hover)' : 'transparent',
                        border: inputMode === 'CASH' ? '1px solid var(--accent-cash)' : '1px solid transparent',
                        color: inputMode === 'CASH' ? 'var(--accent-cash)' : 'var(--text-muted)',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        flex: 1,
                        maxWidth: '120px'
                    }}
                >
                    Uz rokas
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="number"
                    placeholder="Summa (€)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    autoFocus
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        borderColor: inputMode === 'BRUTO' ? 'var(--primary)' : (inputMode === 'CASH' ? 'var(--accent-cash)' : 'var(--glass-border)')
                    }}
                />
                {calculatedNet && (
                    <p style={{ textAlign: 'center', color: 'var(--primary)', marginTop: '0.5rem' }}>
                        Neto: <strong>€ {calculatedNet}</strong>
                    </p>
                )}
            </div>

            {inputMode === 'BRUTO' && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Apgādājamie</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={dependents}
                                onChange={(e) => setDependents(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <input
                                    type="checkbox"
                                    checked={hasBook}
                                    onChange={(e) => setHasBook(e.target.checked)}
                                    style={{ width: '16px', height: '16px', margin: 0 }}
                                />
                                <span>Nodokļu grāmatiņa</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <input
                type="text"
                placeholder="Apraksts (neobligāts)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            <button
                type="submit"
                style={{
                    width: '100%',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem'
                }}
            >
                Pievienot
            </button>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        marginTop: '0.5rem',
                        color: 'var(--text-muted)'
                    }}
                >
                    Atcelt
                </button>
            )}
        </form>
    );
};

export default AddEntryForm;
