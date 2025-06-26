import React from 'react';
import type { ConsensusResult } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ConsensusViewProps {
  consensus: ConsensusResult;
}

const Gauge = ({ value, label }: { value: number, label: string }) => {
  const percentage = Math.max(0, Math.min(100, value * 100));
  const rotation = (percentage / 100) * 180;
  return (
    <div className="flex flex-col items-center">
      <div className="w-40 h-20 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-t-full border-b-0"></div>
        <div 
          className="absolute top-0 left-0 w-full h-full origin-bottom transition-transform duration-500"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute bottom-0 left-1/2 -ml-1 w-2 h-20 bg-cyan-400 rounded-t-full"></div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-200">
          {percentage.toFixed(1)}%
        </div>
      </div>
      <span className="text-sm text-gray-400 mt-1">{label}</span>
    </div>
  );
};

const ConsensusView: React.FC<ConsensusViewProps> = ({ consensus }) => {
  const { consensus: hasConsensus, confidence, estimate, disagreement, participants } = consensus;
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-center">Consensus Analysis</h2>
      <div className="flex flex-wrap justify-around items-center gap-6">
        <div className="flex flex-col items-center space-y-2">
          {hasConsensus ? (
            <CheckCircleIcon className="w-16 h-16 text-emerald-400" />
          ) : (
            <XCircleIcon className="w-16 h-16 text-amber-400" />
          )}
          <span className={`text-lg font-bold ${hasConsensus ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasConsensus ? 'Consensus Reached' : 'Disagreement'}
          </span>
        </div>

        <Gauge value={confidence} label="Confidence Level" />

        <div className="text-center">
          <p className="text-gray-400 text-sm">Aggregated Estimate</p>
          <p className="text-3xl font-mono font-bold text-cyan-400">{estimate.toFixed(4)}</p>
          <p className="text-gray-400 text-sm mt-2">Disagreement (CoV)</p>
          <p className="text-lg font-mono text-amber-400">{disagreement.toFixed(4)}</p>
          <p className="text-gray-400 text-sm mt-2">Participants</p>
          <p className="text-lg font-mono text-gray-200">{participants}</p>
        </div>
      </div>
    </div>
  );
};

export default ConsensusView;
