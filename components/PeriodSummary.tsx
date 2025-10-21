
import React, { useState, useCallback } from 'react';
import { PeriodSummaryData, AlertType } from '../types';
import { SHEET_NAMES } from '../constants';
import { getComparisonDate } from '../utils/dataUtils';
import ComparisonBadge from './ComparisonBadge';

interface PeriodSummaryProps {
    summaryData: PeriodSummaryData | null;
    comparisonSummaryData: PeriodSummaryData | null;
    onSummarize: (startDate: string, endDate: string) => void;
    onCsvDownload: () => void;
    showAlert: (message: string, type?: AlertType) => void;
}

const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('ja-JP', { maximumFractionDigits: 0 });
};

const PeriodSummary: React.FC<PeriodSummaryProps> = ({
    summaryData,
    comparisonSummaryData,
    onSummarize,
    onCsvDownload,
    showAlert
}) => {
    const [startDate, setStartDate] = useState('2025-10-01');
    const [endDate, setEndDate] = useState('2025-10-15');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSummarizeClick = () => {
        if (new Date(startDate) > new Date(endDate)) {
            showAlert('開始日が終了日より後になっています。', 'warning');
            return;
        }
        setIsSummarizing(true);
        // Simulate processing time to show loading state
        setTimeout(() => {
            onSummarize(startDate, endDate);
            setIsSummarizing(false);
        }, 500);
    };

    const renderSummaryContent = useCallback(() => {
        if (isSummarizing) {
            return (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10 mx-auto mb-3" style={{ borderTopColor: '#4f46e5' }}></div>
                    <p className="text-lg text-slate-600">期間データを集計中...</p>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                        .loader { animation: spin 1s linear infinite; }
                    `}</style>
                </div>
            );
        }

        if (!summaryData) {
            return (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">集計結果</h3>
                    <p className="text-slate-500">期間を設定し、「集計実行」ボタンを押してください。</p>
                </div>
            );
        }

        const categoryMap = [
            { key: 'サウナ', label: 'サウナ', subItems: [{ key: '人数(S)', label: '人数', unit: '人' }] },
            { key: '宿泊売上計', label: '宿泊', subItems: [{ key: '人数(C)', label: '人数', unit: '人' }] },
            { key: 'マッサージ', label: 'マッサージ', subItems: [{ key: '人数(M)', label: '人数', unit: '人' }] },
            { key: 'グリル', label: 'グリル', subItems: [{ key: '件数(G)', label: '件数', unit: '件' }] },
            { key: '物販', label: '物販', subItems: [] },
        ];

        return (
            <>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg text-base mb-6 border border-indigo-200">
                    <p><strong>対象期間:</strong> {startDate.replace(/-/g, '/')} 〜 {endDate.replace(/-/g, '/')}</p>
                    <p><strong>比較期間:</strong> {getComparisonDate(startDate.replace(/-/g, '/'))} 〜 {getComparisonDate(endDate.replace(/-/g, '/'))} (前年同期間)</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {SHEET_NAMES.map(storeName => {
                        const currentData = summaryData[storeName];
                        const prevData = comparisonSummaryData?.[storeName];
                        const currentTotal = currentData['売上日計'] || 0;
                        const prevTotal = prevData?.['売上日計'];

                        return (
                            <div key={storeName} className="bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-100 hover:shadow-xl transition-shadow">
                                <h3 className="text-2xl font-extrabold text-indigo-700 mb-4 pb-2 border-b">{storeName} - 期間合計</h3>
                                <div className="mb-4">
                                    <p className="text-lg font-medium text-slate-600">売上日計 (期間合計)</p>
                                    <p className="text-4xl font-black text-indigo-600">¥{formatNumber(currentTotal)}</p>
                                </div>
                                <div className="mb-6">
                                    <p className="text-base font-medium text-slate-600">前年同期間比</p>
                                    <ComparisonBadge current={currentTotal} previous={prevTotal} isLarge unit="¥" />
                                </div>
                                <h4 className="text-xl font-semibold text-slate-700 mt-4 pt-4 border-t">カテゴリ別内訳</h4>
                                <ul className="divide-y divide-slate-100">
                                    {categoryMap.map(({ key, label, subItems }) => (
                                        <li key={key} className="py-3 space-y-2">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                                <div className="mb-2 sm:mb-0">
                                                    <span className="text-base text-slate-600 font-medium">{label}:</span>
                                                    <span className="block sm:inline sm:ml-2 text-lg font-bold text-slate-800">¥{formatNumber(currentData[key] || 0)}</span>
                                                </div>
                                                <div className="w-full sm:w-auto">
                                                    <ComparisonBadge current={currentData[key] || 0} previous={prevData?.[key]} unit="¥" />
                                                </div>
                                            </div>
                                            {subItems.map(sub => (
                                                <div key={sub.key} className="flex justify-between items-center pl-4">
                                                    <span className="text-sm text-slate-500">{sub.label}:</span>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-base font-semibold text-slate-700">{formatNumber(currentData[sub.key] || 0)}{sub.unit}</span>
                                                        <ComparisonBadge current={currentData[sub.key] || 0} previous={prevData?.[sub.key]} unit={sub.unit} />
                                                    </div>
                                                </div>
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }, [isSummarizing, summaryData, comparisonSummaryData, startDate, endDate]);

    return (
        <section className="mt-12 pt-6 border-t border-slate-300">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                <i data-lucide="clock" className="w-8 h-8 text-indigo-600"></i> 期間集計
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <label htmlFor="start-date" className="text-slate-700 font-medium whitespace-nowrap">開始日:</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <span className="text-xl text-slate-500 hidden lg:block">〜</span>
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <label htmlFor="end-date" className="text-slate-700 font-medium whitespace-nowrap">終了日:</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="w-full lg:w-auto lg:ml-auto flex flex-col lg:flex-row gap-2 mt-2 lg:mt-0">
                    <button onClick={onCsvDownload} disabled={!summaryData} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="download" className="w-4 h-4"></i>CSV (期間)
                    </button>
                    <button onClick={handleSummarizeClick} disabled={isSummarizing} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="calculator" className="w-4 h-4"></i>集計実行
                    </button>
                </div>
            </div>
            <div className="mt-8">
                {renderSummaryContent()}
            </div>
        </section>
    );
};

export default PeriodSummary;
