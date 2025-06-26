export type SimulationMode = "parallel" | "collaborative" | "council" | "observatory";

export interface EstimatorMetrics {
  [key: number]: number;
  1: number;
  2: number;
  3: number;
}

export interface EstimatorResult extends EstimatorMetrics {
  plugin: string;
  status: "success" | "failed" | "running";
  error?: string;
}

export interface ConsensusResult {
  consensus: boolean;
  confidence: number;
  estimate: number;
  disagreement: number;
  participants: number;
}

export interface HistoryEntry {
  timestamp: number;
  consensus: ConsensusResult;
  individual_results: EstimatorResult[];
}

export interface SharedContext {
  previous_results: EstimatorResult[];
}

export interface EffectEstimator {
  name: string;
  run: () => Promise<EstimatorMetrics>;
  run_collaborative: (shared_context: SharedContext) => Promise<EstimatorMetrics>;
}
