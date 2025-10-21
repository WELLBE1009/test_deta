
import { DailyStoreData, PeriodSummaryData } from "../types";
import { SHEET_NAMES, COMPARISON_KEYS, SUB_ITEM_MAP } from '../constants';
import { calculateComparison } from './dataUtils';

const convertToCsv = (headers: string[], data: (string | number)[][]): string => {
    const csvRows = [headers.join(',')];
    data.forEach(row => {
        const values = row.map(value => `"${String(value).replace(/"/g, '""')}"`);
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
};

const downloadCsv = (csvString: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

type DataGetter = (storeName: string, key: string) => { current: number, previous?: number };

const generateCsvRows = (dataGetter: DataGetter): (string | number)[][] => {
    const dataRows: (string | number)[][] = [];
    SHEET_NAMES.forEach(storeName => {
        COMPARISON_KEYS.forEach(mainKey => {
            const { current, previous } = dataGetter(storeName, mainKey);
            const comparison = calculateComparison(current, previous);
            const difference = previous !== undefined ? current - previous : 'N/A';
            dataRows.push([storeName, mainKey, current, previous ?? 'N/A', comparison.percentage, difference]);

            (SUB_ITEM_MAP[mainKey] || []).forEach(([label, subKey]) => {
                const { current: subCurrent, previous: subPrevious } = dataGetter(storeName, subKey);
                const subComparison = calculateComparison(subCurrent, subPrevious);
                const subDifference = subPrevious !== undefined ? subCurrent - subPrevious : 'N/A';
                dataRows.push([storeName, `  - ${label}`, subCurrent, subPrevious ?? 'N/A', subComparison.percentage, subDifference]);
            });
        });
    });
    return dataRows;
};

export const handleSingleDayCsvDownload = (
    selectedDate: string,
    comparisonDate: string | null,
    storeData: DailyStoreData,
    comparisonData: DailyStoreData
) => {
    const headers = ['店舗', 'カテゴリ', `売上 (${selectedDate})`, `前年売上 (${comparisonDate || 'N/A'})`, '前年比', '差額'];
    const dataGetter: DataGetter = (store, key) => ({
        current: (storeData[store]?.[key] as number) || 0,
        previous: (comparisonData[store]?.[key] as number)
    });
    const csvRows = generateCsvRows(dataGetter);
    const csvString = convertToCsv(headers, csvRows);
    downloadCsv(csvString, `sales_daily_${selectedDate.replace(/\//g, '-')}.csv`);
};


export const handlePeriodSummaryCsvDownload = (
    startDate: string,
    endDate: string,
    periodSummary: PeriodSummaryData,
    comparisonPeriodSummary: PeriodSummaryData
) => {
    const start = startDate.replace(/-/g, '/');
    const end = endDate.replace(/-/g, '/');
    const headers = ['店舗', 'カテゴリ', `期間合計 (${start} - ${end})`, '前年同期間合計', '前年比', '差額'];
    const dataGetter: DataGetter = (store, key) => ({
        current: periodSummary[store]?.[key] || 0,
        previous: comparisonPeriodSummary[store]?.[key]
    });
    const csvRows = generateCsvRows(dataGetter);
    const csvString = convertToCsv(headers, csvRows);
    downloadCsv(csvString, `sales_period_${startDate}_to_${endDate}.csv`);
};
