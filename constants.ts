// The password for accessing the dashboard.
export const ACCESS_PASSWORD = "3737";

// Google Sheet configuration
export const SPREADSHEET_ID = "1mhzjuXpC7YYus9qvzlLahRwlz3QaQgjVQpYNRaugOU4";
export const SHEET_NAMES = ["栄", "今池", "福岡"];

// Keys used for comparison and display
export const COMPARISON_KEYS = ['売上日計', 'サウナ', '宿泊売上計', 'マッサージ', 'グリル', '物販'];

// All keys that should be summed during period aggregation
export const SUMMABLE_KEYS = [
    '売上日計', 'サウナ', '宿泊売上計', 'マッサージ', 'グリル', '物販',
    '人数(S)', '人数(C)', '人数(M)', '件数(G)'
];

// Mapping of main sales categories to their sub-items (e.g., number of people)
export const SUB_ITEM_MAP: Record<string, [string, string][]> = {
    'サウナ': [['人数', '人数(S)']],
    '宿泊売上計': [['人数', '人数(C)']],
    'マッサージ': [['人数', '人数(M)']],
    'グリル': [['件数', '件数(G)']],
};