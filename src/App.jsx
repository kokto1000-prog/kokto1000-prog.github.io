
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WorkData from './components/WorkData';
import EntryList from './components/EntryList';
import AddEntryForm from './components/AddEntryForm';
import DateSelector from './components/DateSelector';
import SalaryCalculator from './components/SalaryCalculator';
import { getEntries, addEntry, deleteEntry, calculateMonthlyTotal, getMonthMetadata, getAllMetadata, getBalanceCorrection, saveBalanceCorrection, TRANSACTION_TYPES } from './utils/salaryStorage';
import { exportYearlyReport, updateExcelReport } from './utils/exportUtils';

function App() {
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dashboard Data
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [transferTotal, setTransferTotal] = useState(0);
  const [cashTotal, setCashTotal] = useState(0);
  const [cumulativeBalance, setCumulativeBalance] = useState(0);
  const [balanceCorrection, setBalanceCorrection] = useState(0);

  const [rate, setRate] = useState(0);
  const [hours, setHours] = useState(0);

  useEffect(() => {
    loadData();
    const correction = getBalanceCorrection();
    setBalanceCorrection(correction);
  }, []);

  useEffect(() => {
    filterData();
    loadMetadata();
  }, [allEntries, selectedDate]);

  const loadData = () => {
    const entries = getEntries();
    setAllEntries(entries);
  };

  const loadMetadata = () => {
    const meta = getMonthMetadata(selectedDate.getFullYear(), selectedDate.getMonth());
    setRate(meta.rate || 0);
    setHours(meta.hours || 0);
  };

  const handleWorkDataChange = (data) => {
    setRate(data.rate);
    setHours(data.hours);
  };

  const handleCorrectionChange = (newAmount) => {
    const val = Number(newAmount);
    setBalanceCorrection(val);
    saveBalanceCorrection(val);
  };

  const filterData = () => {
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    // Filter list for display
    const filtered = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
    });
    setFilteredEntries(filtered);

    // Calculate totals
    let totalTransfer = 0;
    let totalCash = 0;

    filtered.forEach(entry => {
      if (entry.type === TRANSACTION_TYPES.CASH) {
        totalCash += Number(entry.amount);
      } else {
        // Assume everything else is transfer (including legacy or explicit TRANSFER)
        totalTransfer += Number(entry.amount);
      }
    });



    setTransferTotal(totalTransfer);
    setCashTotal(totalCash);
    setReceivedTotal(totalTransfer + totalCash);

    // Calculate Cumulative Balance (Previous Months)
    const allMetadata = getAllMetadata();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth(); // 0-indexed

    let previousBalance = 0;

    // Identify range of months to consider. Simple approach: iterate all months in metadata/entries that are BEFORE current.
    // 1. Get all unique year-month keys from metadata and entries
    const monthSet = new Set();
    Object.keys(allMetadata).forEach(key => monthSet.add(key)); // "YYYY-M"
    allEntries.forEach(entry => {
      const d = new Date(entry.date);
      monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    // 2. Iterate and sum
    monthSet.forEach(key => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      // Check if strictly before current selected month
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        // Re-construct logic for that month
        const meta = allMetadata[key] || { rate: 0, hours: 0 };

        // Get rate. If not in meta, try to fallback (basic version: use 0 or inherit - reused logic from getMonthMetadata broadly)
        // For simplicity, relying on stored meta. If rate is missing in storage for that specific month, it treats as 0 expected. 
        // Improving fallback requires refactoring getMonthMetadata to be pure or reusable. For now strict metadata check.
        const rate = meta.rate || 0;
        const hours = meta.hours || 0;
        const expected = rate * hours;

        const received = allEntries.reduce((total, entry) => {
          const d = new Date(entry.date);
          if (d.getFullYear() === year && d.getMonth() === month) {
            return total + Number(entry.amount);
          }
          return total;
        }, 0);

        previousBalance += (expected - received);
      }
    });

    setCumulativeBalance(previousBalance);
  };

  const handleAdd = (entryData) => {
    addEntry(entryData);
    loadData();
    setShowAddForm(false);
  };

  const handleExport = () => {
    exportYearlyReport(
      selectedDate.getFullYear(),
      allEntries,
      getAllMetadata(),
      balanceCorrection
    );
  };

  const handleUpdateFile = async (file) => {
    try {
      await updateExcelReport(
        file,
        selectedDate.getFullYear(),
        allEntries,
        getAllMetadata(),
        balanceCorrection
      );
    } catch (error) {
      alert('Neizdevās atjaunināt failu. Pārbaudiet vai tas ir pareizais fails.');
    }
  };

  const handleDelete = (id) => {
    if (confirm('Vai tiešām dzēst šo ierakstu?')) {
      deleteEntry(id);
      loadData();
    }
  };

  const getSummaryLabel = () => {
    const months = [
      'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
      'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
    ];
    return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  // Expected total based on rate * hours
  const expectedTotal = rate * hours;

  return (
    <div className="container">
      <Header
        onOpenCalculator={() => setShowCalculator(true)}
        onExport={handleExport}
        onUpdateFile={handleUpdateFile}
      />

      {showCalculator ? (
        <SalaryCalculator onClose={() => setShowCalculator(false)} />
      ) : !showAddForm ? (
        <>
          <DateSelector
            currentDate={selectedDate}
            onChange={setSelectedDate}
          />

          <Dashboard
            receivedTotal={receivedTotal}
            transferTotal={transferTotal}
            cashTotal={cashTotal}
            expectedTotal={expectedTotal}
            cumulativeBalance={cumulativeBalance}
            balanceCorrection={balanceCorrection}
            onCorrectionChange={handleCorrectionChange}
            label={getSummaryLabel()}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <WorkData date={selectedDate} onDataChange={handleWorkDataChange} />
          </div>

          <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '1rem',
                fontSize: '1.2rem',
                borderRadius: '16px',
                background: 'var(--primary)',
                color: 'white',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Pievienot
            </button>
          </div>

          <EntryList entries={filteredEntries} onDelete={handleDelete} />
        </>
      ) : (
        <div className="glass-card animate-enter">
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Jauns ieraksts</h2>
          <AddEntryForm onAdd={handleAdd} onClose={() => setShowAddForm(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
