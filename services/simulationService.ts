import type { EffectEstimator, EstimatorMetrics, EstimatorResult, ConsensusResult, SharedContext, HistoryEntry } from '../types';

// --- Utility Functions ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// --- Simulated Estimators ---

class SobolEstimator implements EffectEstimator {
  name = "sobol";

  async run(): Promise<EstimatorMetrics> {
    await delay(300 + Math.random() * 200);
    const s1 = Math.random() * 0.4 + 0.1; // 0.1 to 0.5
    const s2 = s1 * (Math.random() * 0.5 + 0.2); // smaller
    const st = s1 + s2 + Math.random() * 0.1;
    return { 1: s1, 2: s2, 3: st };
  }

  run_collaborative(shared_context: SharedContext): Promise<EstimatorMetrics> {
    return this.run();
  }
}

class MonteCarloEstimator implements EffectEstimator {
  name = "monte_carlo";

  async run(): Promise<EstimatorMetrics> {
    await delay(400 + Math.random() * 300);
    const f1 = Math.random() * 0.5 + 0.05; // 0.05 to 0.55
    const f2 = Math.random() * 0.4 + 0.05;
    return { 1: f1, 2: f2, 3: f1 + f2 };
  }
  
  run_collaborative(shared_context: SharedContext): Promise<EstimatorMetrics> {
    return this.run();
  }
}

class AdaptiveEstimator implements EffectEstimator {
  name = "adaptive";

  private async _baseline_estimate(): Promise<EstimatorMetrics> {
      await delay(200 + Math.random() * 150);
      const first_order = Math.random() * 0.6;
      return { 1: first_order, 2: first_order * 0.3, 3: first_order * 1.2 };
  }
  
  private _analyse_previous_results(prev: EstimatorResult[]) {
      const vals = prev.map(r => r[1] || 0);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / vals.length);
      return { mean_sensitivity: mean, disagreement_level: std };
  }

  async run(): Promise<EstimatorMetrics> {
    return this._baseline_estimate();
  }

  async run_collaborative(shared_context: SharedContext): Promise<EstimatorMetrics> {
    if (!shared_context.previous_results || shared_context.previous_results.length === 0) {
        return this._baseline_estimate();
    }
    
    await delay(250 + Math.random() * 100);
    const { mean_sensitivity, disagreement_level } = this._analyse_previous_results(shared_context.previous_results);
    
    // Nudge the estimate towards the mean of previous results
    const my_baseline = (await this._baseline_estimate())[1];
    const new_estimate = my_baseline * 0.5 + mean_sensitivity * 0.5;
    
    // Reduce variance if disagreement is low
    const noise = disagreement_level * (Math.random() - 0.5);
    const final_estimate = clamp(new_estimate + noise, 0, 1);
    
    return { 1: final_estimate, 2: final_estimate * 0.4, 3: final_estimate * 1.1 };
  }
}

// --- Core Logic ---

const estimators: EffectEstimator[] = [
  new SobolEstimator(),
  new MonteCarloEstimator(),
  new AdaptiveEstimator(),
];

export const getEstimators = () => estimators;

async function _safe_run(estimator: EffectEstimator, context?: SharedContext): Promise<EstimatorResult> {
    try {
        const metrics = context 
          ? await estimator.run_collaborative(context)
          : await estimator.run();
        return { plugin: estimator.name, status: "success", ...metrics };
    } catch (e) {
        return { plugin: estimator.name, status: "failed", error: String(e), 1: 0, 2: 0, 3: 0 };
    }
}

export async function evaluate_all(): Promise<EstimatorResult[]> {
    const promises = estimators.map(est => _safe_run(est));
    return Promise.all(promises);
}

export async function evaluate_collaboratively(): Promise<EstimatorResult[]> {
    const results: EstimatorResult[] = [];
    const shared_context: SharedContext = { previous_results: [] };
    for (const est of estimators) {
        const result = await _safe_run(est, shared_context);
        results.push(result);
        shared_context.previous_results.push(result);
    }
    return results;
}

export function form_consensus(results: EstimatorResult[], consensus_threshold = 0.15): ConsensusResult {
    const vals = results.filter(r => r.status === "success").map(r => r[1] || 0);
    if (vals.length < 2) {
        return { consensus: false, confidence: 0.0, estimate: 0, disagreement: 0, participants: vals.length };
    }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / vals.length);
    const cov = mean !== 0 ? std / mean : Infinity; // Coefficient of Variation
    const consensus = cov < consensus_threshold;
    const confidence = 1 / (1 + cov);
    // Dummy weighted average for now
    const estimate = vals.reduce((a, b) => a + b, 0) / vals.length;
    
    return { consensus, confidence, estimate, disagreement: cov, participants: vals.length };
}


export async function convene_council(max_rounds: number = 3): Promise<HistoryEntry[]> {
    const consensus_history: HistoryEntry[] = [];
    for (let i = 0; i < max_rounds; i++) {
        const results = await evaluate_collaboratively();
        const consensus = form_consensus(results);
        consensus_history.push({
            timestamp: Date.now(),
            consensus,
            individual_results: results
        });

        if (i > 0) {
            const prev_est = consensus_history[i - 1].consensus.estimate;
            const curr_est = consensus.estimate;
            if (Math.abs(prev_est - curr_est) < 0.01) {
                break;
            }
        }
    }
    return consensus_history;
}
