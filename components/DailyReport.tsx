
import React from 'react';
import { DailyStoreData } from '../types';
import { SUB_ITEM_MAP } from '../constants';
import ComparisonBadge from './ComparisonBadge';

interface DailyReportProps {
    sheetNames: string[];
    storeData: DailyStoreData;
    comparisonData: DailyStoreData;
    comparisonDate: string | null;
}

const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('ja-JP', { maximumFractionDigits: 0 });
};

const SalesCard: React.FC<{
    title: string;
    data: any;
    prevData: any;
    dataKey: string;
    subKeys?: [string, string][];
}> = ({ title, data, prevData, dataKey, subKeys = [] }) => {
    const current = data?.[dataKey] || 0;
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
            <div className="p-4 border-b bg-slate-50 rounded-t-lg flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-700 truncate">{title}</h3>
                <ComparisonBadge current={current} previous={prevData?.[dataKey]} unit="¥" />
            </div>
            <div className="p-6">
                <p className="text-3xl font-bold text-blue-600 mb-2">¥{formatNumber(current)}</p>
                {subKeys.length > 0 && (
                    <div className="space-y-2 pt-2 border-t mt-4">
                        {subKeys.map(([label, subKey]) => (
                            <div key={subKey} className="flex justify-between items-center">
                                <span className="text-slate-600">{label}:</span>
                                <span className="text-xl font-semibold text-slate-800">
                                    {formatNumber(data?.[subKey] || 0)}{label.includes('人数') ? '人' : '件'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DailyReport: React.FC<DailyReportProps> = ({ sheetNames, storeData, comparisonData, comparisonDate }) => {
    return (
        <>
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-6 border border-yellow-200 flex items-center gap-2">
                <i data-lucide="info" className="w-4 h-4 flex-shrink-0"></i>
                <span><strong>単日比較データ</strong>は、選択された日付の<strong>前年同日</strong>の売上を使用しています。</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {sheetNames.map(storeName => {
                    const data = storeData[storeName];
                    const prevData = comparisonData[storeName];

                    if (!data) {
                        return (
                            <div key={storeName} className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-xl">
                                    <h2 className="text-3xl font-bold text-center">{storeName}</h2>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col justify-center items-center min-h-[200px] border border-slate-200">
                                    <p className="text-slate-500">対象日のデータがありません</p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={storeName} className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-xl">
                                <h2 className="text-3xl font-bold text-center">{storeName}</h2>
                                <p className="text-sm text-center mt-1 opacity-90">
                                    比較対象日: {comparisonDate || 'なし'}
                                </p>
                            </div>
                            <SalesCard title="売上日計" data={data} prevData={prevData} dataKey="売上日計" />
                            <SalesCard title="サウナ" data={data} prevData={prevData} dataKey="サウナ" subKeys={SUB_ITEM_MAP['サウナ']} />
                            <SalesCard title="宿泊売上計" data={data} prevData={prevData} dataKey="宿泊売上計" subKeys={SUB_ITEM_MAP['宿泊売上計']} />
                            <SalesCard title="マッサージ" data={data} prevData={prevData} dataKey="マッサージ" subKeys={SUB_ITEM_MAP['マッサージ']} />
                            <SalesCard title="グリル" data={data} prevData={prevData} dataKey="グリル" subKeys={SUB_ITEM_MAP['グリル']} />
                            <SalesCard title="物販" data={data} prevData={prevData} dataKey="物販" />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default DailyReport;
