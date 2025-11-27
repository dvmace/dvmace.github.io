export type AppStatus = 'idle' | 'analyzing' | 'success' | 'error';
export type AnalysisMode = 'text' | 'image';

// --- Text Analysis Types ---
export interface ConfidenceDetails {
  perplexity: number; // 0-1, lower is more AI-like
  burstiness: number; // 0-1, lower is more AI-like
  commonPhrases: number; // 0-1, higher is more AI-like
}

export interface DetectedSegment {
  text: string;
  isAi: boolean;
  confidence: number; // 0 to 1
  confidenceDetails?: ConfidenceDetails;
}

export interface SummaryPoint {
  level: 'critical' | 'warning' | 'info';
  message: string;
}

export interface TextAnalysisResult {
  overallScore: number; // 0-100, probability of AI content
  segments: DetectedSegment[];
  summary: SummaryPoint[];
  originalText: string;
}

// --- Image Analysis Types ---
export interface HeatmapPoint {
  x: number; // percentage
  y: number; // percentage
  intensity: number; // 0 to 1
  radius: number; // percentage
}

export interface ImageAnalysisResult {
  mode: 'image';
  imageScore: number; // Overall score for the image (artifacts, etc.)
  imageUrl: string;
  heatmapData?: HeatmapPoint[];
  textAnalysis?: TextAnalysisResult; // Analysis of text found in the image
  summary: SummaryPoint[];
}
