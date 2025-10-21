
import { SPREADSHEET_ID, SHEET_NAMES, COMPARISON_KEYS } from '../constants';
import { AllStoresData, SalesRecord } from '../types';

/**
 * Sanitizes column names (e.g., converts full-width characters to half-width).
 */
function sanitizeKey(str: string): string {
    if (!str) return '';
    return str
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/（/g, '(')
        .replace(/）/g, ')');
}

/**
 * Fetches and parses data from a single sheet in the Google Sheet.
 */
async function fetchSheetData(sheetName: string): Promise<SalesRecord[]> {
    const query = 'select *';
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for sheet: ${sheetName}`);
    }
    
    const text = await response.text();
    // The response is JSONP, so we need to extract the JSON part.
    const jsonString = text.substring(47, text.length - 2);
    const data = JSON.parse(jsonString);

    if (data.status === 'error') {
        throw new Error(data.errors.map((e: any) => e.detailed_message).join(', '));
    }

    const rows = data.table.rows;
    const cols = data.table.cols;

    return rows.map((row: any): SalesRecord => {
        const rowData: { [key: string]: any } = {};
        row.c.forEach((cell: any, index: number) => {
            const originalColLabel = cols[index].label;
            const colLabel = sanitizeKey(originalColLabel);
            let value = cell ? cell.v : null;

            // Parse date strings in the format 'Date(YYYY,MM,DD)'
            if (colLabel === '対象日' && typeof value === 'string' && value.startsWith('Date(')) {
                const match = value.match(/Date\((\d+),(\d+),(\d+)\)/);
                if (match) {
                    const [_, year, month, day] = match;
                    value = `${year}/${String(parseInt(month, 10) + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
                }
            }
            
            // Ensure numeric columns are parsed as numbers, defaulting to 0 if null/undefined
            const isNumericColumn = COMPARISON_KEYS.includes(colLabel) || originalColLabel.includes('人数') || originalColLabel.includes('件数');
            rowData[colLabel] = isNumericColumn ? (typeof value === 'number' ? value : 0) : value;
        });
        return rowData as SalesRecord;
    }).filter((item: SalesRecord) => item['対象日']); // Filter out rows without a date
}

/**
 * Fetches data from all specified sheets in parallel.
 */
export async function fetchAllSheetsData(): Promise<AllStoresData> {
    const allData: AllStoresData = {};
    const promises = SHEET_NAMES.map(sheetName => fetchSheetData(sheetName));
    const results = await Promise.all(promises);
    
    results.forEach((data, index) => {
        if (data) {
            allData[SHEET_NAMES[index]] = data;
        }
    });

    return allData;
}
