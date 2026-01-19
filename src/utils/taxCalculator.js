export const TAX_CONSTANTS = {
    VSAOI_RATE: 0.105, // 10.5% Employee Social Tax
    IIN_RATE_BASE: 0.255, // 25.5% Income Tax (2025)
    IIN_RATE_HIGH: 0.33, // 33% Income Tax (above 8775/mo)
    DEPENDENT_RELIEF: 250, // Relief per dependent (2025)
    NON_TAXABLE_FIXED: 510, // Fixed non-taxable minimum (2025)
    HIGH_INCOME_THRESHOLD: 8775, // Monthly threshold for 33% tax
};

export const calculateNetFromBruto = (bruto, dependents = 0, hasTaxBook = true) => {
    const gross = parseFloat(bruto);
    if (isNaN(gross) || gross <= 0) return 0;

    // 1. Social Tax (VSAOI)
    const vsaoi = gross * TAX_CONSTANTS.VSAOI_RATE;

    // 2. Non-taxable minimum
    // 2025: Fixed 510 EUR if tax book is submitted
    let nonTaxable = 0;
    if (hasTaxBook) {
        nonTaxable = TAX_CONSTANTS.NON_TAXABLE_FIXED;
    }

    // 3. Dependent Relief
    const relief = dependents * TAX_CONSTANTS.DEPENDENT_RELIEF;

    // 4. IIN Base
    // Taxable Income = Gross - VSAOI - NonTaxable - Relief
    let iinBase = gross - vsaoi - nonTaxable - relief;
    if (iinBase < 0) iinBase = 0;

    // 5. IIN Calculation
    // For MVP/Standard cases we assume income < 8775 EUR/month (25.5% rate)
    // If > 8775, the excess is taxed at 33%.
    // But VSAOI is also capped at ~105k/year? Let's keep it simple for now.
    // We will apply 25.5% to everything for the standard calculator.

    let iin = iinBase * TAX_CONSTANTS.IIN_RATE_BASE;

    // 6. Net
    const net = gross - vsaoi - iin;
    return Number(net.toFixed(2));
};

export const calculateBrutoFromNet = (net, dependents = 0, hasTaxBook = true) => {
    const targetNet = parseFloat(net);
    if (isNaN(targetNet) || targetNet <= 0) return 0;

    // Reverse calculation for standard tax bracket (25.5%)
    // Net = Gross - VSAOI - IIN
    // VSAOI = Gross * 0.105
    // IIN_Base = Gross * (1 - 0.105) - Reliefs
    // IIN = IIN_Base * 0.255
    // Net = Gross * (1 - 0.105) - (Gross * (1 - 0.105) - Reliefs) * 0.255
    // Net = (Gross * 0.895) * (1 - 0.255) + (Reliefs * 0.255)
    // Net = Gross * 0.895 * 0.745 + Reliefs * 0.255

    // Formula: Gross = (Net - Reliefs * 0.255) / (0.895 * 0.745)
    // Note: If IIN_Base < 0 (Low salary), then IIN is 0, so Net = Gross * 0.895.

    let relief = (dependents * TAX_CONSTANTS.DEPENDENT_RELIEF);
    if (hasTaxBook) relief += TAX_CONSTANTS.NON_TAXABLE_FIXED;

    // Check if we are likely in the tax-paying zone
    // Threshold where tax starts: (Gross * 0.895) > Reliefs
    // Approx Gross > Reliefs / 0.895

    const factorVsaoi = (1 - TAX_CONSTANTS.VSAOI_RATE); // 0.895
    const factorIin = (1 - TAX_CONSTANTS.IIN_RATE_BASE); // 0.745

    // Try Case 1: Income is high enough to pay tax
    let gross = (targetNet - (relief * TAX_CONSTANTS.IIN_RATE_BASE)) / (factorVsaoi * factorIin);

    // Verification
    const checkVSAOI = gross * TAX_CONSTANTS.VSAOI_RATE;
    const checkBase = gross - checkVSAOI - relief;

    // If base is negative, our assumption (that tax was paid) is wrong. 
    // It means the salary is low and no IIN was paid.
    if (checkBase < 0) {
        // Case 2: No IIN paid. Net = Gross - VSAOI
        gross = targetNet / factorVsaoi;
    }

    return Number(gross.toFixed(2));
};
