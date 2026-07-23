import { SimulationEngine } from '@ai-video-editor/simulation-engine';
import { SimulationService } from './SimulationService';
import { PredictionService } from './PredictionService';
import { OptimizationService } from './OptimizationService';
import { ReplayService } from './ReplayService';
import { ValidationService } from './ValidationService';
import { TwinManager } from './TwinManager';

export const globalSimulationEngine = new SimulationEngine();

export const webSimulationService = new SimulationService(globalSimulationEngine);
export const webPredictionService = new PredictionService(globalSimulationEngine);
export const webOptimizationService = new OptimizationService(globalSimulationEngine);
export const webReplayService = new ReplayService();
export const webValidationService = new ValidationService(globalSimulationEngine);
export const webTwinManager = new TwinManager(globalSimulationEngine);

export {
  SimulationService,
  PredictionService,
  OptimizationService,
  ReplayService,
  ValidationService,
  TwinManager,
};
