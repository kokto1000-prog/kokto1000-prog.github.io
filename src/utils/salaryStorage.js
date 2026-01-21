const STORAGE_KEY = 'maks_salary_tracker_v1';

export const TRANSACTION_TYPES = {
    TRANSFER: 'TRANSFER', // Pārskaitījums
    CASH: 'CASH',         // Uz rokas
};

// Helper to generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const getEntries = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage', error);
        return [];
    }
};

export const addEntry = (entry) => {
    const entries = getEntries();
    const newEntry = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...entry, // expects amount, type, date, description
    };
    entries.unshift(newEntry); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
};

export const deleteEntry = (id) => {
    const entries = getEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
};

const CORRECTION_KEY = 'maks_balance_correction_v1';

export const getBalanceCorrection = () => {
    try {
        const data = localStorage.getItem(CORRECTION_KEY);
        return data ? Number(data) : 0;
    } catch (error) {
        console.error('Error reading correction', error);
        return 0;
    }
};

export const saveBalanceCorrection = (amount) => {
    try {
        localStorage.setItem(CORRECTION_KEY, amount.toString());
        return Number(amount);
    } catch (error) {
        console.error('Error saving correction', error);
    }
};

const METADATA_KEY = 'maks_salary_metadata_v1';

export const getMonthMetadata = (year, month) => {
    try {
        const data = localStorage.getItem(METADATA_KEY);
        const allMetadata = data ? JSON.parse(data) : {};
        const key = `${year}-${month}`;

        // Get specific month data
        const monthData = allMetadata[key] || { rate: 0, hours: 0 };

        // If rate is 0, try to find the most recent previous rate (inheritance)
        if (!monthData.rate) {
            // Simple fallback: check up to 12 months back
            for (let i = 1; i <= 12; i++) {
                let prevMonth = month - i;
                let prevYear = year;
                if (prevMonth < 0) {
                    prevMonth += 12;
                    prevYear -= 1;
                }
                const prevKey = `${prevYear}-${prevMonth}`;
                if (allMetadata[prevKey] && allMetadata[prevKey].rate) {
                    monthData.rate = allMetadata[prevKey].rate;
                    break;
                }
            }
        }

        return monthData;
    } catch (error) {
        console.error('Error reading metadata', error);
        return { rate: 0, hours: 0 };
    }
};

export const saveMonthMetadata = (year, month, metadata) => {
    try {
        const data = localStorage.getItem(METADATA_KEY);
        const allMetadata = data ? JSON.parse(data) : {};
        const key = `${year}-${month}`;

        allMetadata[key] = { ...allMetadata[key], ...metadata };
        localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
        return allMetadata[key];
    } catch (error) {
        console.error('Error saving metadata', error);
    }
};

export const getAllMetadata = () => {
    try {
        const data = localStorage.getItem(METADATA_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error reading all metadata', error);
        return {};
    }
};

export const calculateMonthlyTotal = (entries, date = new Date()) => {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    return entries.reduce((total, entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear) {
            return total + Number(entry.amount);
        }
        return total;
    }, 0);
};
