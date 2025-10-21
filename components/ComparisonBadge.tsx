
import React from 'react';
import { calculateComparison } from '../utils/dataUtils';

interface ComparisonBadgeProps {
    current: number;
    previous?: number | null;
    isLarge?: boolean;
    unit?: string;
}

const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('ja-JP', { maximumFractionDigits: 0 });
};

const ComparisonBadge: React.FC<ComparisonBadgeProps> = ({ current, previous, isLarge = false, unit = '¥' }) => {
    if (previous === null || previous === undefined) {
        return (
            <span className={`text-sm text-slate-500 w-full text-right sm:ml-4 whitespace-nowrap ${isLarge ? 'text-base' : ''}`}>
                比較データなし
            </span>
        );
    }
    const comparison = calculateComparison(current, previous);
    const color = { increase: 'text-green-600', decrease: 'text-red-600', same: 'text-slate-500' }[comparison.type];
    const icon = { increase: 'trending-up', decrease: 'trending-down', same: 'minus' }[comparison.type];

    const prefix = unit === '¥' ? '¥' : '';
    const suffix = (unit === '人' || unit === '件') ? unit : '';
    const formattedPrevious = `${prefix}${formatNumber(previous)}${suffix}`;

    return (
        <div className="flex items-center justify-end w-full sm:ml-4">
            <span className={`text-slate-500 mr-2 whitespace-nowrap ${isLarge ? 'text-base' : 'text-xs'}`}>
                前年: {formattedPrevious}
            </span>
            <i data-lucide={icon} className={`w-4 h-4 ${color} mr-1 flex-shrink-0 ${isLarge ? 'w-5 h-5' : ''}`}></i>
            <span className={`font-semibold ${color} flex-shrink-0 whitespace-nowrap ${isLarge ? 'text-xl' : 'text-sm'}`}>
                {comparison.percentage}
            </span>
        </div>
    );
};

export default ComparisonBadge;
