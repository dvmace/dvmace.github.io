import { TextAnalysisResult, DetectedSegment, SummaryPoint, ImageAnalysisResult, HeatmapPoint, ConfidenceDetails } from '../types';

// --- TEXT ANALYSIS MOCK ---

const getSentences = (text: string): string[] => {
    if (!text) return [];
    return text.match(/[^.!?]+[.!?]*\s*|[^.!?]+$/g) || [text];
};

const createMockTextData = (text: string): TextAnalysisResult => {
    const sentences = getSentences(text);
    const segments: DetectedSegment[] = [];
    const summary: SummaryPoint[] = [];
    let aiSentenceCount = 0;
    
    const aiKeywords = ['utilize', 'robust', 'seamless', 'leverage', 'in conclusion', 'furthermore', 'holistic', 'synergy', 'paradigm'];

    sentences.forEach(sentence => {
        const isAi = aiKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) && Math.random() > 0.2;
        if (isAi) {
            aiSentenceCount++;
            const confidence = 0.5 + Math.random() * 0.49;
            const confidenceDetails: ConfidenceDetails = {
                perplexity: 0.1 + Math.random() * 0.3, // Lower is more AI-like
                burstiness: 0.1 + Math.random() * 0.4, // Lower is more AI-like
                commonPhrases: 0.6 + Math.random() * 0.39, // Higher is more AI-like
            };
            segments.push({
                text: sentence,
                isAi: true,
                confidence,
                confidenceDetails,
            });
        } else {
            segments.push({
                text: sentence,
                isAi: false,
                confidence: Math.random() * 0.3,
            });
        }
    });

    const overallScore = Math.min(99, Math.floor((aiSentenceCount / (sentences.length || 1)) * 100) + (aiSentenceCount > 0 ? 10 : 0));

    if (overallScore > 75) {
        summary.push({ level: 'critical', message: 'High probability of AI-generated text detected.' });
    } else if (overallScore > 40) {
        summary.push({ level: 'warning', message: 'Text appears to be a mix of human and AI-generated content.' });
    } else {
        summary.push({ level: 'info', message: 'Text appears to be human-written.' });
    }
    
    if (text.length > 100) {
        summary.push({ level: 'info', message: `Analyzed ${sentences.length} sentences.` });
    }

    return {
        overallScore,
        segments,
        summary,
        originalText: text,
    };
};

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(createMockTextData(text));
    }, 1500 + Math.random() * 1000);
  });
};

// --- IMAGE ANALYSIS MOCK ---

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const createMockImageData = async (file: File): Promise<ImageAnalysisResult> => {
    const imageUrl = await fileToDataUrl(file);
    
    // 1. Simulate OCR to extract text
    const mockExtractedText = "This image contains some text. We can leverage robust solutions to analyze it. Furthermore, a holistic approach provides synergy.";
    const textAnalysis = createMockTextData(mockExtractedText);

    // 2. Simulate image artifact analysis
    const hasArtifacts = Math.random() > 0.3; // 70% chance of having "artifacts"
    let imageScore = 10 + Math.random() * 20; // Base score for a "clean" image
    const summary: SummaryPoint[] = [];
    let heatmapData: HeatmapPoint[] | undefined = undefined;

    if (hasArtifacts) {
        imageScore = 50 + Math.random() * 45; // Higher score if artifacts are found
        summary.push({ level: 'warning', message: 'Suspicious artifacts detected in image structure, suggesting possible AI manipulation.' });
        
        // Generate some heatmap data
        heatmapData = Array.from({ length: Math.floor(2 + Math.random() * 3) }).map(() => ({
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80,
            intensity: 0.4 + Math.random() * 0.6,
            radius: 15 + Math.random() * 15,
        }));
    } else {
        summary.push({ level: 'info', message: 'Image structure appears consistent with a standard photograph.' });
    }

    // 3. Combine scores and summaries
    const combinedScore = Math.floor((imageScore * 0.6) + (textAnalysis.overallScore * 0.4));
    
    if (textAnalysis.summary.length > 0) {
        summary.push(...textAnalysis.summary);
    }
    
    summary.sort((a) => (a.level === 'critical' ? -1 : a.level === 'warning' ? 0 : 1));


    return {
        mode: 'image',
        imageScore: combinedScore,
        imageUrl,
        heatmapData,
        textAnalysis,
        summary,
    };
};

export const analyzeImage = async (file: File): Promise<ImageAnalysisResult> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(createMockImageData(file));
        }, 2000 + Math.random() * 1500);
    });
};
