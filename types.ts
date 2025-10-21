
export interface SalesRecord {
    [key: string]: string | number | null;
    '対象日': string;
    '売上日計': number;
    'サウナ': number;
    '宿泊売上計': number;
    'マッサージ': number;
    'グリル': number;
    '物販': number;
    '人数(S)': number;
    '人数(C)': number;
    '人数(M)': number;
    '件数(G)': number;
}

export type AllStoresData = Record<string, SalesRecord[]>;

export type DailyStoreData = Record<string, SalesRecord | null>;

export type PeriodSummaryData = Record<string, Record<string, number>>;

export type SortOrder = 'newest' | 'oldest';

export type AlertType = 'info' | 'warning' | 'error';

export interface AlertState {
    message: string;
    type: AlertType;
    visible: boolean;
}
