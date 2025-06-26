import React, { useState, useCallback, useEffect } from 'react';
import type { SimulationMode, EstimatorResult, ConsensusResult, HistoryEntry } from './types';
import { getEstimators, evaluate_all, evaluate_collaboratively, form_consensus, convene_council } from './services/simulationService';
import { getAnalysis } from './services/geminiService';
import EstimatorCard from './components/EstimatorCard';
import ConsensusView from './components/ConsensusView';
import HistoryChart from './components/HistoryChart';
import GeminiAnalysisView from './components/GeminiAnalysisView';
import { BrainCircuitIcon } from './components/icons';

const App: React.FC = () => {
    const [mode, setMode] = useState<SimulationMode>('parallel');
    const [results, setResults] = useState<EstimatorResult[]>([]);
    const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSimComplete, setIsSimComplete] = useState(false);
    
    const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);

    const analysisReady = isSimComplete || (isRunning && mode === 'observatory' && results.some(r => r.status === 'success'));

    // For observatory mode
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (mode === 'observatory' && isRunning) {
            intervalId = setInterval(async () => {
                const newResults = await evaluate_collaboratively();
                const newConsensus = form_consensus(newResults);
                setHistory(prevHistory => [...prevHistory.slice(-19), {
                    timestamp: Date.now(),
                    consensus: newConsensus,
                    individual_results: newResults
                }]);
                setResults(newResults);
                setConsensus(newConsensus);
            }, 2000);
        }
        
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [mode, isRunning]);


    const resetState = () => {
        setResults([]);
        setConsensus(null);
        setHistory([]);
        setIsRunning(false);
        setIsSimComplete(false);
        setGeminiAnalysis(null);
    };
    
    const handleModeChange = (newMode: SimulationMode) => {
        setMode(newMode);
        resetState();
    };

    const runSimulation = useCallback(async () => {
        resetState();
        setIsRunning(true);

        const initialEstimatorStates = getEstimators().map(e => ({
            plugin: e.name,
            status: 'running' as const,
            1: 0, 2: 0, 3: 0
        }));
        setResults(initialEstimatorStates);

        let finalResults: EstimatorResult[] = [];
        let finalConsensus: ConsensusResult | null = null;
        let finalHistory: HistoryEntry[] = [];

        if (mode === 'parallel') {
            finalResults = await evaluate_all();
            finalConsensus = form_consensus(finalResults);
        } else if (mode === 'collaborative') {
            finalResults = await evaluate_collaboratively();
            finalConsensus = form_consensus(finalResults);
        } else if (mode === 'council') {
            finalHistory = await convene_council();
            if (finalHistory.length > 0) {
                finalResults = finalHistory[finalHistory.length - 1].individual_results;
                finalConsensus = finalHistory[finalHistory.length - 1].consensus;
            }
        } else if (mode === 'observatory') {
            // isRunning=true already started the interval
            return; // Don't set isRunning false yet
        }

        setResults(finalResults);
        setConsensus(finalConsensus);
        setHistory(finalHistory);
        setIsRunning(false);
        setIsSimComplete(true);
    }, [mode]);

    const handleAnalyze = useCallback(async () => {
        if (!analysisReady) return;
        setIsGeminiLoading(true);
        const analysis = await getAnalysis(mode, results, consensus, history);
        setGeminiAnalysis(analysis);
        setIsGeminiLoading(false);
    }, [mode, results, consensus, history, analysisReady]);
    
    const stopObservatory = () => {
        setIsRunning(false);
        setIsSimComplete(true);
    };

    const renderResults = () => {
        if (!isSimComplete && !isRunning) {
            return (
                <div className="text-center text-gray-400 py-16">
                    <p>Select a mode and click "Run Simulation" to begin.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(res => <EstimatorCard key={res.plugin} result={res} />)}
                </div>
                {(consensus && (mode === 'parallel' || mode === 'collaborative')) && (
                    <ConsensusView consensus={consensus} />
                )}
                {history.length > 0 && (
                    <div className="space-y-6">
                         <ConsensusView consensus={history[history.length - 1].consensus} />
                         <HistoryChart history={history} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <BrainCircuitIcon className="w-12 h-12 text-cyan-400" />
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-100">Effect Estimation Framework</h1>
                            <p className="text-lg text-gray-400 mt-2">A Demonstration of Anti-Rivalry Consciousness Infrastructure</p>
                        </div>
                    </div>
                </header>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {(['parallel', 'collaborative', 'council', 'observatory'] as SimulationMode[]).map(m => (
                                <button key={m} onClick={() => handleModeChange(m)}
                                    className={`px-4 py-2 rounded-md font-semibold capitalize transition-all duration-200 ${mode === m ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                        <div>
                            {mode === 'observatory' ? (
                                isRunning ? (
                                    <button onClick={stopObservatory} className="px-6 py-2 bg-red-500 text-white rounded-md font-bold hover:bg-red-600 transition-colors">Stop</button>
                                ) : (
                                    <button onClick={runSimulation} disabled={isRunning} className="px-6 py-2 bg-emerald-500 text-white rounded-md font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-600">Start</button>
                                )
                            ) : (
                                <button onClick={runSimulation} disabled={isRunning} className="px-6 py-2 bg-emerald-500 text-white rounded-md font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-600">
                                    {isRunning ? 'Running...' : 'Run Simulation'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {renderResults()}
                
                <GeminiAnalysisView 
                    analysis={geminiAnalysis}
                    isLoading={isGeminiLoading}
                    onAnalyze={handleAnalyze}
                    hasRun={analysisReady}
                />

            </main>
        </div>
    );
};

export default App;
