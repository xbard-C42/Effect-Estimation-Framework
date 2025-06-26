import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoryEntry } from '../types';

interface HistoryChartProps {
    history: HistoryEntry[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
    const chartData = history.map((entry, index) => ({
        name: `Round ${index + 1}`,
        estimate: parseFloat(entry.consensus.estimate.toFixed(4)),
        confidence: parseFloat(entry.consensus.confidence.toFixed(4)),
        disagreement: parseFloat(entry.consensus.disagreement.toFixed(4)),
    }));

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96">
            <h3 className="text-lg font-bold mb-4">Consensus Evolution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 25 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#22D3EE" domain={[0, 1]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#FBBF24" domain={[0, 'auto']} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            color: '#E5E7EB',
                        }}
                    />
                    <Legend wrapperStyle={{ bottom: 0 }}/>
                    <Line yAxisId="left" type="monotone" dataKey="estimate" stroke="#22D3EE" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="confidence" stroke="#34D399" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="disagreement" stroke="#FBBF24" strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HistoryChart;
