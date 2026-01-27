import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WorkData from './components/WorkData';
import EntryList from './components/EntryList';
import AddEntryForm from './components/AddEntryForm';
import DateSelector from './components/DateSelector';
import SalaryCalculator from './components/SalaryCalculator';
import Login from './components/Login';
import LockScreen from './components/LockScreen';
import { useAuth } from './contexts/AuthContext';
import * as db from './services/db';
import { exportYearlyReport, exportYearlyCSV } from './utils/exportUtils';
import { TRANSACTION_TYPES } from './services/db';
import { getEntries as getOldEntries, getAllMetadata as getOldMetadata, getBalanceCorrection as getOldCorrection } from './utils/salaryStorage';

function App() {
  const { currentUser, logout } = useAuth();
  const [encryptionKey, setEncryptionKey] = useState(null);

  const [allEntries, setAllEntries] = useState([]);
  const [allMetadata, setAllMetadata] = useState({});
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMigrate, setShowMigrate] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dashboard Data
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [transferTotal, setTransferTotal] = useState(0);
  const [cashTotal, setCashTotal] = useState(0);
  const [cumulativeBalance, setCumulativeBalance] = useState(0);
  const [balanceCorrection, setBalanceCorrection] = useState(0);

  // Current Month Metadata
  const [rate, setRate] = useState(0);
  const [hours, setHours] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [hasBook, setHasBook] = useState(true);

  // Initial Load - Only when we have User AND Key
  useEffect(() => {
    if (currentUser && encryptionKey) {
      loadData();
    }
  }, [currentUser, encryptionKey]);

  // Check for migration opportunity
  useEffect(() => {
    // Show migrate only if user is logged in, key is set (so we can check DB), and DB is empty
    if (currentUser && encryptionKey && allEntries.length === 0) {
      const old = getOldEntries();
      if (old && old.length > 0) {
        setShowMigrate(true);
      }
    } else {
      setShowMigrate(false);
    }
  }, [currentUser, encryptionKey, allEntries]);

  // Process data on change
  useEffect(() => {
    if (currentUser && encryptionKey) {
      processData();
      updateCurrentMonthMeta();
    }
  }, [allEntries, allMetadata, selectedDate, balanceCorrection]);

  const loadData = async () => {
    try {
      const entries = await db.getEntries(currentUser.uid, encryptionKey);
      const meta = await db.getAllMetadata(currentUser.uid, encryptionKey);
      const correction = await db.getBalanceCorrection(currentUser.uid, encryptionKey);

      setAllEntries(entries);
      setAllMetadata(meta);
      setBalanceCorrection(correction);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const updateCurrentMonthMeta = () => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
    const meta = allMetadata[key] || {};

    setRate(meta.rate || 0);
    setHours(meta.hours || 0);
    setDependents(meta.dependents || 0);
    setHasBook(meta.hasBook !== undefined ? meta.hasBook : true);
  };

  const processData = () => {
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    // Filter list
    const filtered = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === targetMonth && entryDate.getFullYear() === targetYear;
    });
    setFilteredEntries(filtered);

    // Calc totals
    let totalTransfer = 0;
    let totalCash = 0;
    filtered.forEach(entry => {
      if (entry.type === TRANSACTION_TYPES.CASH) {
        totalCash += Number(entry.amount);
      } else {
        totalTransfer += Number(entry.amount);
      }
    });

    setTransferTotal(totalTransfer);
    setCashTotal(totalCash);
    setReceivedTotal(totalTransfer + totalCash);

    // Calc Cumulative Balance
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();
    let previousBalance = 0;

    const monthSet = new Set();
    Object.keys(allMetadata).forEach(key => monthSet.add(key));
    allEntries.forEach(entry => {
      const d = new Date(entry.date);
      monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    monthSet.forEach(key => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        const mMeta = allMetadata[key] || {};
        const mRate = mMeta.rate || 0;
        const mHours = mMeta.hours || 0;
        const mExpected = mRate * mHours;

        let mTransfer = 0;
        let mCash = 0;
        allEntries.forEach(entry => {
          const d = new Date(entry.date);
          if (d.getFullYear() === year && d.getMonth() === month) {
            if (entry.type === TRANSACTION_TYPES.CASH) {
              mCash += Number(entry.amount);
            } else {
              mTransfer += Number(entry.amount);
            }
          }
        });
        previousBalance += (mExpected - mTransfer - mCash);
      }
    });

    setCumulativeBalance(previousBalance);
  };

  const handleWorkDataSave = async (data) => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
    const newMeta = { ...allMetadata[key], ...data };

    setAllMetadata(prev => ({
      ...prev,
      [key]: newMeta
    }));

    await db.saveMonthMetadata(currentUser.uid, selectedDate.getFullYear(), selectedDate.getMonth(), data, encryptionKey);
  };

  const handleCorrectionChange = async (newAmount) => {
    const val = Number(newAmount);
    setBalanceCorrection(val);
    await db.saveBalanceCorrection(currentUser.uid, val, encryptionKey);
  };

  const handleAdd = async (entryData) => {
    const newEntry = await db.addEntry(currentUser.uid, entryData, encryptionKey);
    setAllEntries(prev => [newEntry, ...prev]);
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Vai tiešām dzēst šo ierakstu?')) {
      await db.deleteEntry(currentUser.uid, id);
      setAllEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleExport = () => {
    exportYearlyReport(selectedDate.getFullYear(), allEntries, allMetadata, balanceCorrection);
  };

  const handleExportCSV = () => {
    exportYearlyCSV(selectedDate.getFullYear(), allEntries, allMetadata, balanceCorrection);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setEncryptionKey(null); // Clear key on logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Vai tiešām importēt vecos datus? Tas pievienos visus ierakstus no šīs ierīces šim kontam.')) return;

    try {
      // 1. Migrate Entries
      const oldEntries = getOldEntries();
      for (const entry of oldEntries) {
        const { id, ...rest } = entry;
        // Add with encryption key
        await db.addEntry(currentUser.uid, rest, encryptionKey);
      }

      // 2. Migrate Metadata
      const oldMeta = getOldMetadata();
      for (const [key, value] of Object.entries(oldMeta)) {
        const [year, month] = key.split('-');
        await db.saveMonthMetadata(currentUser.uid, parseInt(year), parseInt(month), value, encryptionKey);
      }

      // 3. Migrate Correction
      const oldCorrection = getOldCorrection();
      if (oldCorrection) {
        await db.saveBalanceCorrection(currentUser.uid, oldCorrection, encryptionKey);
      }

      alert('Dati veiksmīgi importēti!');
      await loadData(); // Reload from DB

    } catch (error) {
      console.error("Migration failed", error);
      alert('Kļūda importējot datus.');
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  // If locked, show LockScreen
  if (!encryptionKey) {
    return <LockScreen onUnlock={setEncryptionKey} />;
  }

  const expectedTotal = rate * hours;
  const months = ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'];
  const label = `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <div className="container">
      <Header
        onOpenCalculator={() => setShowCalculator(true)}
        onExport={handleExport}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
        onMigrate={handleMigrate}
        showMigrate={showMigrate}
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
            label={label}
            dependents={dependents}
            hasBook={hasBook}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <WorkData date={selectedDate} rate={rate} hours={hours} onSave={handleWorkDataSave} />
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

          <EntryList entries={filteredEntries} onDelete={handleDelete} dependents={dependents} hasBook={hasBook} />
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
