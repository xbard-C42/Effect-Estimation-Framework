import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { SimulationMode, EstimatorResult, ConsensusResult, HistoryEntry } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

function formatResultsForPrompt(results: EstimatorResult[], consensus?: ConsensusResult, history?: HistoryEntry[]): string {
    let prompt = `
SIMULATION RESULTS:
Individual Estimators:
${results.map(r => `  - Plugin: ${r.plugin}, Status: ${r.status}, Primary Effect (Order 1): ${r[1].toFixed(3)}`).join('\n')}
`;
    if (consensus) {
        prompt += `
Consensus Summary:
  - Reached Consensus: ${consensus.consensus}
  - Confidence Level: ${consensus.confidence.toFixed(3)}
  - Final Estimate: ${consensus.estimate.toFixed(3)}
  - Disagreement (Coeff of Variation): ${consensus.disagreement.toFixed(3)}
  - Participants: ${consensus.participants}
`;
    }

    if (history && history.length > 0) {
        prompt += `
Execution History (${history.length} rounds/steps):
${history.map((h, i) => `  - Round ${i + 1}: Estimate=${h.consensus.estimate.toFixed(3)}, Confidence=${h.consensus.confidence.toFixed(3)}, Disagreement=${h.consensus.disagreement.toFixed(3)}`).join('\n')}
`;
    }
    return prompt;
}

function getSystemInstruction(mode: SimulationMode): string {
    const base = "You are an expert AI systems analyst. Your role is to interpret the results of a collaborative AI framework for sensitivity analysis. Provide a concise, insightful, and easy-to-understand summary formatted in markdown.";
    
    const structure = `
Please structure your response with the following sections:
- **Summary of Findings**: A bulleted list summarizing the key quantitative results (e.g., individual estimates, final estimate, consensus status).
- **Interpretation**: A paragraph explaining what these results mean in practice. What is the story behind the numbers?
`;

    switch (mode) {
        case 'parallel':
            return `${base}${structure}- **Analysis of Parallel Execution**: Explain the level of agreement or disagreement between the independent estimators. What does the final consensus (or lack thereof) imply about the problem or the methods used?`;
        case 'collaborative':
            return `${base}${structure}- **Analysis of Collaborative Influence**: Explain how the sequential, collaborative nature of this run might have influenced the outcome. Did collaboration help guide the estimators towards agreement? Why or why not?`;
        case 'council':
            return `${base}${structure}- **Analysis of Council Convergence**: Analyze the round-by-round history. Did the council converge towards a stable consensus? Was the convergence fast or slow? What does the trend in confidence and disagreement tell you?`;
        case 'observatory':
            return `${base}${structure}- **Analysis of Consensus Dynamics**: Describe the dynamic process of consensus formation observed over time. Was the consensus stable, volatile, or did it trend in a particular direction? What might this behavior indicate?`;
    }
}


export async function getAnalysis(
    mode: SimulationMode,
    results: EstimatorResult[],
    consensus?: ConsensusResult,
    history?: HistoryEntry[]
): Promise<string> {
    if (!process.env.API_KEY) {
        return Promise.resolve("Gemini analysis is disabled. Please set the `API_KEY` environment variable.");
    }

    const systemInstruction = getSystemInstruction(mode);
    const userPrompt = `Based on the following data, please provide your analysis:\n\n${formatResultsForPrompt(results, consensus, history)}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "An error occurred while fetching analysis from Gemini. Please check the console for details.";
    }
}