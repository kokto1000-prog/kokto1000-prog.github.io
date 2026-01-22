import * as XLSX from 'xlsx';
import { TRANSACTION_TYPES } from './salaryStorage';

export const exportYearlyReport = (year, allEntries, allMetadata, balanceCorrection = 0) => {
    try {
        // 1. Prepare Yearly Summary Data
        const summaryRows = [];
        const months = [
            'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
            'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
        ];

        let yearlyExpected = 0;
        let yearlyReceived = 0;
        let yearlyBalance = 0;

        // Header for Summary
        summaryRows.push(['Mēnesis', 'Likme', 'Stundas', 'Pienākas', 'Neto', 'Uz rokas', 'Kopā saņemts', 'Bilance']);

        for (let month = 0; month < 12; month++) {
            // Get Metadata
            const key = `${year}-${month}`;
            const meta = allMetadata[key] || { rate: 0, hours: 0 };

            // Fallback rate logic could go here if strict inheritance is needed, 
            // but relying on stored metadata or 0 is safer for "raw" export.
            const rate = Number(meta.rate || 0);
            const hours = Number(meta.hours || 0);
            const expected = rate * hours;

            // Calculate Received
            let transfer = 0;
            let cash = 0;

            allEntries.forEach(entry => {
                const d = new Date(entry.date);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    if (entry.type === TRANSACTION_TYPES.CASH) {
                        cash += Number(entry.amount);
                    } else {
                        transfer += Number(entry.amount);
                    }
                }
            });

            const received = transfer + cash;
            const balance = expected - received;

            // Totals
            yearlyExpected += expected;
            yearlyReceived += received;
            yearlyBalance += balance;

            summaryRows.push([
                months[month],
                rate || '-',
                hours || '-',
                expected.toFixed(2),
                transfer.toFixed(2),
                cash.toFixed(2),
                received.toFixed(2),
                balance.toFixed(2)
            ]);
        }

        // Yearly Totals
        summaryRows.push(['', '', '', '', '', '', '', '']);
        summaryRows.push(['KOPĀ GADĀ', '', '', yearlyExpected.toFixed(2), '', '', yearlyReceived.toFixed(2), yearlyBalance.toFixed(2)]);

        // Add Correction
        const finalBalance = yearlyBalance + balanceCorrection;
        summaryRows.push(['', '', '', '', '', '', '', '']);
        summaryRows.push(['Korekcija', '', '', '', '', '', '', balanceCorrection.toFixed(2)]);
        summaryRows.push(['GALA BILANCE', '', '', '', '', '', '', finalBalance.toFixed(2)]);
        summaryRows.push(['', '', '', '', '', '', '', '']);

        // Add Timestamp
        const now = new Date();
        const timeStr = now.toLocaleString('lv-LV', { hour12: false });
        summaryRows.push(['Ģenerēts:', timeStr, '', '', '', '', '', '']);


        // 2. Prepare All Entries for Year
        const yearlyEntries = allEntries
            .filter(e => new Date(e.date).getFullYear() === year)
            .map(entry => ({
                Datums: new Date(entry.date).toLocaleDateString('lv-LV'),
                Summa: Number(entry.amount),
                Veids: entry.type === TRANSACTION_TYPES.CASH ? 'Uz rokas' : 'Pārskaitījums',
                Apraksts: entry.description || ''
            }));

        // 3. Create Workbook
        const wb = XLSX.utils.book_new();

        // Sheet 1: Summary
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
        // Column widths
        wsSummary['!cols'] = [{ wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Gada Kopsavilkums");

        // Sheet 2: Entries
        const wsEntries = XLSX.utils.json_to_sheet(yearlyEntries);
        wsEntries['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, wsEntries, "Visi Ieraksti");

        // 4. Save
        const nowFileName = new Date();
        const dateStrFileName = nowFileName.toISOString().split('T')[0];
        const timeStrFileName = nowFileName.toTimeString().split(' ')[0].replace(/:/g, '-');
        const fileName = `Maks_Parskats_${year}_${dateStrFileName}_${timeStrFileName}.xlsx`;
        XLSX.writeFile(wb, fileName);

        return true;

    } catch (error) {
        console.error('Export failed:', error);
        return false;
    }
};

export const updateExcelReport = (file, year, allEntries, allMetadata, balanceCorrection = 0) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });

                // Reuse the generation logic to get new data
                // We'll just essentially call the same logic as exportYearlyReport but allow it to return objects instead of writing file immediately
                // To avoid code duplication, we'll inline the data preparation here for now (or refactor later)

                // 1. Prepare Yearly Summary Data
                const summaryRows = [];
                const months = [
                    'Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs',
                    'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'
                ];

                let yearlyExpected = 0;
                let yearlyReceived = 0;
                let yearlyBalance = 0;

                // Header for Summary
                summaryRows.push(['Mēnesis', 'Likme', 'Stundas', 'Pienākas', 'Neto', 'Uz rokas', 'Kopā saņemts', 'Bilance']);

                for (let month = 0; month < 12; month++) {
                    const key = `${year}-${month}`;
                    const meta = allMetadata[key] || { rate: 0, hours: 0 };
                    const rate = Number(meta.rate || 0);
                    const hours = Number(meta.hours || 0);
                    const expected = rate * hours;

                    let transfer = 0;
                    let cash = 0;

                    allEntries.forEach(entry => {
                        const d = new Date(entry.date);
                        if (d.getFullYear() === year && d.getMonth() === month) {
                            if (entry.type === TRANSACTION_TYPES.CASH) {
                                cash += Number(entry.amount);
                            } else {
                                transfer += Number(entry.amount);
                            }
                        }
                    });

                    const received = transfer + cash;
                    const balance = expected - received;

                    yearlyExpected += expected;
                    yearlyReceived += received;
                    yearlyBalance += balance;

                    summaryRows.push([
                        months[month],
                        rate || '-',
                        hours || '-',
                        expected.toFixed(2),
                        transfer.toFixed(2),
                        cash.toFixed(2),
                        received.toFixed(2),
                        balance.toFixed(2)
                    ]);
                }

                summaryRows.push(['', '', '', '', '', '', '', '']);
                summaryRows.push(['KOPĀ GADĀ', '', '', yearlyExpected.toFixed(2), '', '', yearlyReceived.toFixed(2), yearlyBalance.toFixed(2)]);

                const finalBalance = yearlyBalance + balanceCorrection;
                summaryRows.push(['', '', '', '', '', '', '', '']);
                summaryRows.push(['Korekcija', '', '', '', '', '', '', balanceCorrection.toFixed(2)]);
                summaryRows.push(['GALA BILANCE', '', '', '', '', '', '', finalBalance.toFixed(2)]);
                summaryRows.push(['', '', '', '', '', '', '', '']);

                // Add Timestamp
                const now = new Date();
                const timeStr = now.toLocaleString('lv-LV', { hour12: false });
                summaryRows.push(['Ģenerēts:', timeStr, '', '', '', '', '', '']);

                // 2. Prepare All Entries
                const yearlyEntries = allEntries
                    .filter(e => new Date(e.date).getFullYear() === year)
                    .map(entry => ({
                        Datums: new Date(entry.date).toLocaleDateString('lv-LV'),
                        Summa: Number(entry.amount),
                        Veids: entry.type === TRANSACTION_TYPES.CASH ? 'Uz rokas' : 'Pārskaitījums',
                        Apraksts: entry.description || ''
                    }));

                // 3. Update Sheets
                // Check if sheets exist, if not create them. If they exist, overwrite.

                // Summary Sheet
                const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
                wsSummary['!cols'] = [{ wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];

                // Entries Sheet
                const wsEntries = XLSX.utils.json_to_sheet(yearlyEntries);
                wsEntries['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];

                // Remove existing sheets if they exist to avoid conflict or append issues
                if (wb.SheetNames.includes("Gada Kopsavilkums")) {
                    delete wb.Sheets["Gada Kopsavilkums"];
                    // Remove from SheetNames array
                    const idx = wb.SheetNames.indexOf("Gada Kopsavilkums");
                    wb.SheetNames.splice(idx, 1);
                }
                if (wb.SheetNames.includes("Visi Ieraksti")) {
                    delete wb.Sheets["Visi Ieraksti"];
                    const idx = wb.SheetNames.indexOf("Gisi Ieraksti"); // Typo safety
                    if (idx > -1) wb.SheetNames.splice(idx, 1);
                    const idx2 = wb.SheetNames.indexOf("Visi Ieraksti");
                    if (idx2 > -1) wb.SheetNames.splice(idx2, 1);
                }

                // Append new sheets
                // Note: xlsx library makes it a bit hard to insert at specific index without low level manip,
                // so we just append. For "Update" this is usually fine. 

                XLSX.utils.book_append_sheet(wb, wsSummary, "Gada Kopsavilkums");
                XLSX.utils.book_append_sheet(wb, wsEntries, "Visi Ieraksti");

                XLSX.utils.book_append_sheet(wb, wsEntries, "Visi Ieraksti");

                // 4. Save
                // Use original name to trigger browser's "Overwrite?" prompt
                const newName = file.name;

                XLSX.writeFile(wb, newName);
                resolve(true);

            } catch (error) {
                console.error('Update failed:', error);
                reject(error);
            }
        };

        reader.readAsArrayBuffer(file);
    });
};
