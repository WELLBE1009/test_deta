
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllSheetsData } from '../services/googleSheetService';
import { getAvailableDates, getComparisonDate, getDataByDate, summarizeDataByPeriod } from '../utils/dataUtils';
import { handleSingleDayCsvDownload, handlePeriodSummaryCsvDownload } from '../utils/csvUtils';
import { AllStoresData, DailyStoreData, SortOrder, PeriodSummaryData, AlertState, AlertType } from '../types';
import { SHEET_NAMES } from '../constants';
import DailyReport from './DailyReport';
import PeriodSummary from './PeriodSummary';
import Loader from './Loader';
import Alert from './Alert';

// This is a global declaration for the 'lucide' library loaded from a CDN.
declare const lucide: {
    createIcons: () => void;
};

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<AllStoresData>({});
    
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    const [periodSummary, setPeriodSummary] = useState<PeriodSummaryData | null>(null);
    const [comparisonPeriodSummary, setComparisonPeriodSummary] = useState<PeriodSummaryData | null>(null);

    const [alert, setAlert] = useState<AlertState>({ message: '', type: 'info', visible: false });

    const showAlert = (message: string, type: AlertType = 'info') => {
        setAlert({ message, type, visible: true });
        setTimeout(() => setAlert(prev => ({ ...prev, visible: false })), 3000);
    };

    const loadData = useCallback(() => {
        setLoading(true);
        setError(null);
        setPeriodSummary(null);
        fetchAllSheetsData()
            .then(data => {
                setAllData(data);
                const dates = getAvailableDates(data, sortOrder);
                setAvailableDates(dates);
                if (dates.length > 0) {
                    setSelectedDate(dates[0]);
                } else {
                   setError("利用可能なデータがありません。");
                }
            })
            .catch(err => {
                setError(err.message || 'データの読み込みに失敗しました。スプレッドシートが公開されているか確認してください。');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [sortOrder]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortOrder]);

    useEffect(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as SortOrder);
    };

    const { storeData, comparisonDate, comparisonData } = useMemo(() => {
        if (!selectedDate || Object.keys(allData).length === 0) {
            return { storeData: {}, comparisonDate: null, comparisonData: {} };
        }
        const currentStoreData = getDataByDate(allData, selectedDate);
        const compDate = getComparisonDate(selectedDate);
        const compData = compDate ? getDataByDate(allData, compDate) : {};
        return { storeData: currentStoreData, comparisonDate: compDate, comparisonData: compData };
    }, [selectedDate, allData]);

    const handleSummarize = (startDate: string, endDate: string) => {
        const start = startDate.replace(/-/g, '/');
        const end = endDate.replace(/-/g, '/');
        const summary = summarizeDataByPeriod(allData, start, end);
        const compSummary = summarizeDataByPeriod(allData, getComparisonDate(start)!, getComparisonDate(end)!);
        setPeriodSummary(summary);
        setComparisonPeriodSummary(compSummary);
        showAlert(`期間集計を完了しました (${start}〜${end})`);
    };

    if (loading) {
        return <Loader message="データを読み込んでいます..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <strong className="font-bold">エラーが発生しました</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                    <button onClick={loadData} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen p-4 sm:p-8">
             <Alert message={alert.message} type={alert.type} isVisible={alert.visible} />
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 border-b pb-2">店舗別 売上比較ダッシュボード</h1>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <i data-lucide="calendar" className="text-blue-600 w-5 h-5 flex-shrink-0"></i>
                            <label htmlFor="date-select" className="text-slate-700 font-medium whitespace-nowrap">対象日:</label>
                            <select id="date-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {availableDates.map(date => <option key={date} value={date}>{date}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-6">
                            <i data-lucide="arrow-down-up" className="text-blue-600 w-5 h-5 flex-shrink-0"></i>
                            <label htmlFor="sort-select" className="text-slate-700 font-medium whitespace-nowrap">期間ソート:</label>
                            <select id="sort-select" value={sortOrder} onChange={handleSortChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="newest">新しい順</option>
                                <option value="oldest">古い順</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                            <button onClick={() => handleSingleDayCsvDownload(selectedDate, comparisonDate, storeData, comparisonData)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md">
                                <i data-lucide="download" className="w-4 h-4"></i>CSV (単日)
                            </button>
                            <button onClick={loadData} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md">
                                <i data-lucide="refresh-cw" className="w-4 h-4"></i>データ更新
                            </button>
                        </div>
                    </div>
                </header>
                <main>
                    <DailyReport
                        sheetNames={SHEET_NAMES}
                        storeData={storeData}
                        comparisonData={comparisonData}
                        comparisonDate={comparisonDate}
                    />
                    <PeriodSummary
                        onSummarize={handleSummarize}
                        onCsvDownload={() => handlePeriodSummaryCsvDownload('2025-10-01', '2025-10-15', periodSummary!, comparisonPeriodSummary!)}
                        summaryData={periodSummary}
                        comparisonSummaryData={comparisonPeriodSummary}
                        showAlert={showAlert}
                    />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
