import * as XLSX from 'xlsx';
import { TRANSACTION_TYPES } from './salaryStorage';

export const exportToExcel = (entries, summaryData, fileName = 'Maks_Parskats') => {
    try {
        // 1. Format Entries for Excel
        const formattedEntries = entries.map(entry => ({
            Datums: new Date(entry.date).toLocaleDateString('lv-LV'),
            Summa: Number(entry.amount),
            Veids: entry.type === TRANSACTION_TYPES.CASH ? 'Uz rokas' : 'Pārskaitījums',
            Apraksts: entry.description || ''
        }));

        // 2. Create Summary Data
        const explanation = [
            ['Kopsavilkums', ''],
            ['Pienākas (Aprēķināts)', summaryData.expectedTotal],
            ['Neto (Pārskaitījums)', summaryData.transferTotal],
            ['Uz rokas (Skaidra nauda)', summaryData.cashTotal],
            ['Kopā saņemts', summaryData.receivedTotal],
            ['', ''],
            ['Bilance', ''],
            ['Mēneša bilance', summaryData.balance],
            ['Uzkrātais atlikums', summaryData.cumulativeBalance],
            ['Korekcija', summaryData.balanceCorrection],
            ['Gala bilance (Iekšā)', summaryData.finalBalance]
        ];

        // 3. Create Workbook and Sheets
        const wb = XLSX.utils.book_new();

        // Sheet 1: Entries
        const wsEntries = XLSX.utils.json_to_sheet(formattedEntries);

        // Auto-width for columns
        const wscols = [
            { wch: 12 }, // Date
            { wch: 10 }, // Amount
            { wch: 15 }, // Type
            { wch: 30 }  // Description
        ];
        wsEntries['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, wsEntries, "Ieraksti");

        // Sheet 2: Summary
        const wsSummary = XLSX.utils.aoa_to_sheet(explanation);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Kopsavilkums");

        // 4. Generate File Name with Date
        const dateStr = new Date().toISOString().split('T')[0];
        const fullFileName = `${fileName}_${dateStr}.xlsx`;

        // 5. Save File
        XLSX.writeFile(wb, fullFileName);

        return true;
    } catch (error) {
        console.error('Export failed:', error);
        return false;
    }
};
