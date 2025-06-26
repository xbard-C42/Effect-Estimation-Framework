import React from 'react';
import { SparklesIcon } from './icons';

interface GeminiAnalysisViewProps {
    analysis: string | null;
    isLoading: boolean;
    onAnalyze: () => void;
    hasRun: boolean;
}

const simpleMarkdownToHtml = (text: string | null): string => {
    if (!text) return "";

    const lines = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text first
        .split('\n');

    let html = '';
    let inList = false;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('* ')) {
            const content = trimmedLine.substring(2);
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${content}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (trimmedLine.match(/^<strong>.*<\/strong>$/)) {
                html += `<h3>${trimmedLine}</h3>`;
            } else if (trimmedLine) {
                html += `<p>${trimmedLine}</p>`;
            }
            // empty lines are skipped, creating vertical space between blocks
        }
    }

    if (inList) {
        html += '</ul>';
    }

    return html;
};

const GeminiAnalysisView: React.FC<GeminiAnalysisViewProps> = ({ analysis, isLoading, onAnalyze, hasRun }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/30 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-cyan-400 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2" />
                    Gemini Analysis
                </h2>
                <button
                    onClick={onAnalyze}
                    disabled={isLoading || !hasRun}
                    className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        'Analyze Results'
                    )}
                </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                {isLoading ? (
                    <p>Contacting Gemini for insights...</p>
                ) : analysis ? (
                    <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(analysis) }} />
                ) : (
                    <p>Click "Analyze Results" to get an AI-powered summary of the simulation outcome.</p>
                )}
            </div>
        </div>
    );
};

export default GeminiAnalysisView;