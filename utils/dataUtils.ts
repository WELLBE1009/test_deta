
import { AllStoresData, SalesRecord, SortOrder, PeriodSummaryData } from '../types';
import { SHEET_NAMES, SUMMABLE_KEYS } from '../constants';

/**
 * Calculates the comparison date (one year prior).
 */
export function getComparisonDate(targetDate: string): string | null {
    if (!targetDate) return null;
    const parts = targetDate.split(/[/-]/).map(p => parseInt(p, 10));
    if (parts.length !== 3) return null;
    
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(dateObj.getTime())) return null;
    
    dateObj.setFullYear(dateObj.getFullYear() - 1);
    return `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
}

/**
 * Extracts and sorts all available unique dates from the dataset.
 */
export function getAvailableDates(allData: AllStoresData, sortOrder: SortOrder): string[] {
    const dates = new Set<string>();
    Object.values(allData).forEach(storeData => {
        storeData.forEach(item => {
            if (item['対象日']) dates.add(item['対象日']);
        });
    });
    
    const sortedDates = Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return sortOrder === 'newest' ? sortedDates.reverse() : sortedDates;
}

/**
 * Retrieves data for a specific date across all stores.
 */
export function getDataByDate(allData: AllStoresData, date: string): Record<string, SalesRecord | null> {
    const result: Record<string, SalesRecord | null> = {};
    for (const [storeName, storeData] of Object.entries(allData)) {
        result[storeName] = storeData.find(item => item['対象日'] === date) || null;
    }
    return result;
}

function isDateInRange(dateStr: string, startStr: string, endStr: string): boolean {
    return dateStr >= startStr && dateStr <= endStr;
}

/**
 * Summarizes data over a specified period for all stores.
 */
export function summarizeDataByPeriod(allData: AllStoresData, startDate: string, endDate: string): PeriodSummaryData {
    const summary: PeriodSummaryData = {};
    SHEET_NAMES.forEach(storeName => {
        summary[storeName] = {};
        const filteredData = (allData[storeName] || []).filter(item => isDateInRange(item['対象日'], startDate, endDate));
        
        SUMMABLE_KEYS.forEach(key => {
            summary[storeName][key] = filteredData.reduce((acc, item) => acc + (item[key] as number || 0), 0);
        });
    });
    return summary;
}

/**
 * Calculates the percentage difference between two numbers.
 */
export function calculateComparison(current: number, previous?: number): { percentage: string; type: 'increase' | 'decrease' | 'same' } {
    if (previous === undefined || previous === null) return { percentage: 'N/A', type: 'same' };
    if (previous === 0) {
        if (current > 0) return { percentage: '+∞%', type: 'increase' };
        if (current < 0) return { percentage: '-∞%', type: 'decrease' };
        return { percentage: '0%', type: 'same' };
    }
    
    const percentage = ((current - previous) / previous) * 100;
    let type: 'increase' | 'decrease' | 'same' = 'same';
    if (percentage > 0.05) type = 'increase';
    else if (percentage < -0.05) type = 'decrease';
    
    return { percentage: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`, type };
}
