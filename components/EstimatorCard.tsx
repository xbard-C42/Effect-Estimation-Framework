import React from 'react';
import type { EstimatorResult } from '../types';
import { CheckCircleIcon, HourglassIcon, XCircleIcon } from './icons';

interface EstimatorCardProps {
    result: EstimatorResult;
}

const StatusIcon = ({ status }: { status: "success" | "failed" | "running" }) => {
    switch (status) {
        case 'success':
            return <CheckCircleIcon className="w-6 h-6 text-emerald-400" />;
        case 'failed':
            return <XCircleIcon className="w-6 h-6 text-red-500" />;
        case 'running':
            return <HourglassIcon className="w-6 h-6 text-amber-400 animate-spin" />;
        default:
            return null;
    }
};

const EstimatorCard: React.FC<EstimatorCardProps> = ({ result }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold capitalize text-gray-200">{result.plugin}</h3>
                <StatusIcon status={result.status} />
            </div>
            {result.status === 'running' ? (
                <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                </div>
            ) : result.status === 'success' ? (
                <div className="text-sm space-y-1 text-gray-400">
                    <p><strong>Order 1 Effect:</strong> <span className="font-mono text-cyan-400">{result[1].toFixed(4)}</span></p>
                    <p><strong>Order 2 Effect:</strong> <span className="font-mono text-cyan-400">{result[2].toFixed(4)}</span></p>
                    <p><strong>Total Effect:</strong> <span className="font-mono text-cyan-400">{result[3].toFixed(4)}</span></p>
                </div>
            ) : (
                <div className="text-sm text-red-400">
                    <p><strong>Error:</strong> {result.error || "An unknown error occurred."}</p>
                </div>
            )}
        </div>
    );
};

export default EstimatorCard;
