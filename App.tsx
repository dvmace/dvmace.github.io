import React, { useState, useCallback, useEffect, useRef, FC, ReactNode } from 'react';
import { AppStatus, AnalysisMode, TextAnalysisResult, ImageAnalysisResult, SummaryPoint, DetectedSegment, HeatmapPoint } from './types';
import { analyzeText, analyzeImage } from './analysisService';

// --- ICONS ---
const AlertTriangleIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const InfoIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>);
const SunIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>);
const MoonIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>);
const FileTextIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>);
const ImageIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>);
const UploadCloudIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>);
const FlameIcon: FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>);

// --- UI COMPONENTS ---

const GlassCard: FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/40 dark:bg-gray-900/40 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-white/10 shadow-lg transition-all duration-300 ${className}`}>
        {children}
    </div>
);
const Tooltip: FC<{ content: ReactNode; children: ReactNode }> = ({ content, children }) => (
    <div className="relative group inline-block">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-800 text-xs font-bold rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">{content}</div></div>
);
const Spinner: FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-gray-700 dark:text-gray-300"><div className="gradient-spinner"></div><p className="text-lg animate-pulse">{text}...</p></div>
);

// --- INPUT COMPONENTS ---

const Tabs: FC<{ mode: AnalysisMode; setMode: (mode: AnalysisMode) => void }> = ({ mode, setMode }) => (
    <div className="flex justify-center items-center p-1.5 rounded-xl bg-white/30 dark:bg-gray-900/30 mb-4">
        <button onClick={() => setMode('text')} className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${mode === 'text' ? 'bg-white dark:bg-gray-800 shadow-md' : 'text-gray-600 dark:text-gray-300'}`}><FileTextIcon className="inline w-5 h-5 mr-2" />Text</button>
        <button onClick={() => setMode('image')} className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${mode === 'image' ? 'bg-white dark:bg-gray-800 shadow-md' : 'text-gray-600 dark:text-gray-300'}`}><ImageIcon className="inline w-5 h-5 mr-2" />Image</button>
    </div>
);

const TextAnalyzerInput: FC<{ onAnalyze: (text: string) => void }> = ({ onAnalyze }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (text.trim().split(/\s+/).length < 5 || text.trim().length < 20) {
            setError('Insufficient data for analysis. Please provide a longer or more complete text sample to improve accuracy.');
            return;
        }
        setError('');
        onAnalyze(text);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileText = event.target?.result as string;
                setText(fileText);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 text-gray-700 dark:text-gray-200 w-full">
            <h2 className="text-2xl font-bold">Analyze Text Content</h2>
            <p className="text-gray-600 dark:text-gray-400">Paste your text or upload a file to check for AI content.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-48 p-3 rounded-lg bg-white/30 dark:bg-gray-900/30 border border-white/40 dark:border-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Enter text here..."/>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex items-center gap-4 mt-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-white/80 dark:hover:bg-white/20 transition-all">Upload File</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md" className="hidden"/>
                <button onClick={handleSubmit} disabled={!text.trim()} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">Analyze Text</button>
            </div>
        </div>
    );
};

const ImageAnalyzerInput: FC<{ onAnalyze: (file: File) => void }> = ({ onAnalyze }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 text-gray-700 dark:text-gray-200 w-full">
            <h2 className="text-2xl font-bold">Analyze Image Content</h2>
            <p className="text-gray-600 dark:text-gray-400">Upload an image to detect AI-generated content and text.</p>
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`w-full h-48 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/40 dark:border-white/20'}`}>
                {previewUrl ? <img src={previewUrl} alt="Preview" className="max-h-full max-w-full rounded-md object-contain" /> : <div className="text-center"><UploadCloudIcon className="w-12 h-12 mx-auto text-gray-500 dark:text-gray-400" /><p>Drag & drop image here</p></div>}
            </div>
            <button onClick={() => imageFile && onAnalyze(imageFile)} disabled={!imageFile} className="mt-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">Analyze Image</button>
        </div>
    );
};

// --- RESULTS COMPONENTS ---

const ScoreCard: FC<{ score: number, title?: string }> = ({ score, title = "AI Content Probability" }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const circleRef = useRef<SVGCircleElement>(null);

    const scoreColor = score > 75 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500';
    const scoreBgColor = score > 75 ? 'bg-red-500/20' : score > 40 ? 'bg-yellow-500/20' : 'bg-green-500/20';

    useEffect(() => {
        let start = 0;
        const end = score;
        const duration = 1500;
        const startTime = performance.now();
        const animate = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentScore = Math.floor(progress * (end - start) + start);
            setDisplayScore(currentScore);
            if (circleRef.current) {
                const r = circleRef.current.r.baseVal.value;
                const circ = 2 * Math.PI * r;
                circleRef.current.style.strokeDashoffset = `${circ - (currentScore / 100) * circ}`;
            }
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [score]);
    
    useEffect(() => {
        if(circleRef.current) {
            const r = circleRef.current.r.baseVal.value;
            const circ = 2 * Math.PI * r;
            circleRef.current.style.strokeDasharray = `${circ} ${circ}`;
            circleRef.current.style.strokeDashoffset = `${circ}`;
        }
    }, []);

    return (
        <GlassCard className="p-6 flex flex-col items-center justify-center gap-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 text-center">{title}</h3>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200/50 dark:text-gray-700/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle ref={circleRef} className={`${scoreColor} transition-colors duration-500`} strokeWidth="10" strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s ease-out' }}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className={`text-4xl font-bold ${scoreColor}`}>{displayScore}%</span></div>
            </div>
            <div className={`px-4 py-1 rounded-full text-sm font-medium ${scoreBgColor} ${scoreColor}`}>{score > 75 ? 'Likely AI' : score > 40 ? 'Potentially AI' : 'Likely Human'}</div>
        </GlassCard>
    );
};

const HighlightedText: FC<{ segments: DetectedSegment[] }> = ({ segments }) => {
    const getColorForConfidence = (confidence: number) => {
        const hue = 240 - (confidence * 240);
        return { light: `hsla(${hue}, 90%, 65%, 0.4)`, dark: `hsla(${hue}, 90%, 55%, 0.5)` };
    };

    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    const renderTooltipContent = (segment: DetectedSegment) => (
        <div className="text-center">
            <p className="font-bold mb-1">AI Confidence: {Math.round(segment.confidence * 100)}%</p>
            {segment.confidenceDetails && (
                <ul className="text-left mt-2 border-t border-gray-600 dark:border-gray-300 pt-1.5 font-normal text-xs space-y-0.5">
                    <li className="flex justify-between"><span>Perplexity:</span> <span>{segment.confidenceDetails.perplexity.toFixed(2)}</span></li>
                    <li className="flex justify-between"><span>Burstiness:</span> <span>{segment.confidenceDetails.burstiness.toFixed(2)}</span></li>
                    <li className="flex justify-between"><span>Common Phrases:</span> <span>{segment.confidenceDetails.commonPhrases.toFixed(2)}</span></li>
                </ul>
            )}
        </div>
    );

    return (
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {segments.map((seg, index) => {
                if (seg.isAi) {
                    const colors = getColorForConfidence(seg.confidence);
                    return (<Tooltip key={index} content={renderTooltipContent(seg)}><mark className="px-1 rounded" style={{ backgroundColor: theme === 'dark' ? colors.dark : colors.light, color: 'inherit' }}>{seg.text}</mark></Tooltip>);
                }
                return <span key={index}>{seg.text}</span>;
            })}
        </p>
    );
};

const SummaryDisplay: FC<{ summary: SummaryPoint[] }> = ({ summary }) => (
    <GlassCard className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Analysis Summary</h3>
        <ul className="space-y-2">{summary.map((point, index) => (<li key={index} className="flex items-start gap-2 text-sm">{point.level === 'critical' && <AlertTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}{point.level === 'warning' && <AlertTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />}{point.level === 'info' && <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}<span className={point.level === 'critical' ? 'text-red-700 dark:text-red-400' : point.level === 'warning' ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}>{point.message}</span></li>))}</ul>
    </GlassCard>
);

const HeatmapOverlay: FC<{ points: HeatmapPoint[] }> = ({ points }) => (
    <div className="absolute inset-0 pointer-events-none">
        {points.map((p, i) => <div key={i} className="absolute rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.radius * 2}%`, height: `${p.radius * 2}%`, background: `radial-gradient(circle, hsla(0, 100%, 50%, ${p.intensity * 0.7}) 0%, hsla(60, 100%, 50%, ${p.intensity * 0.3}) 50%, hsla(120, 100%, 50%, 0) 70%)`, filter: 'blur(10px)', opacity: 0.8 }} />)}
    </div>
);

const ResultsDisplay: FC<{ result: TextAnalysisResult | ImageAnalysisResult; onReset: () => void }> = ({ result, onReset }) => (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6 animate-fade-in">
        {'segments' in result ? ( // TextAnalysisResult
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col gap-6"><ScoreCard score={result.overallScore} /><SummaryDisplay summary={result.summary} /></div>
                <div className="md:col-span-2"><GlassCard className="p-6"><h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Analyzed Text</h3><div className="max-h-[60vh] overflow-y-auto pr-2 bg-white/20 dark:bg-black/20 p-4 rounded-lg"><HighlightedText segments={result.segments} /></div></GlassCard></div>
            </div>
        ) : ( // ImageAnalysisResult
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1 flex flex-col gap-6"><ScoreCard score={result.imageScore} title="Overall AI Probability" /><SummaryDisplay summary={result.summary} /></div>
                 <div className="md:col-span-2 space-y-6">
                    <ImageResultDisplay result={result} />
                    {result.textAnalysis && (
                        <GlassCard className="p-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Extracted Text Analysis (Score: {result.textAnalysis.overallScore}%)</h3>
                            <div className="max-h-[30vh] overflow-y-auto pr-2 bg-white/20 dark:bg-black/20 p-4 rounded-lg"><HighlightedText segments={result.textAnalysis.segments} /></div>
                        </GlassCard>
                    )}
                 </div>
            </div>
        )}
        <div className="flex justify-center"><button onClick={onReset} className="px-8 py-3 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-white/80 dark:hover:bg-white/20 transition-all transform hover:scale-105">Analyze Another</button></div>
    </div>
);

const ImageResultDisplay: FC<{ result: ImageAnalysisResult }> = ({ result }) => {
    const [showHeatmap, setShowHeatmap] = useState(true);
    return (
        <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Analyzed Image</h3>
            <div className="relative rounded-lg overflow-hidden bg-black/20">
                <img src={result.imageUrl} alt="Analyzed content" className="w-full h-auto object-contain max-h-[50vh]" />
                {showHeatmap && result.heatmapData && <HeatmapOverlay points={result.heatmapData} />}
            </div>
            {result.heatmapData && (<div className="flex justify-center mt-4"><button onClick={() => setShowHeatmap(!showHeatmap)} className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-white/80 dark:hover:bg-white/20 transition-all"><FlameIcon className={`w-5 h-5 transition-colors ${showHeatmap ? 'text-red-500' : ''}`} />{showHeatmap ? 'Hide' : 'Show'} AI Heatmap</button></div>)}
        </GlassCard>
    );
};

// --- MAIN APP ---
const App: FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'dark' : 'light');
    const [status, setStatus] = useState<AppStatus>('idle');
    const [mode, setMode] = useState<AnalysisMode>('text');
    const [result, setResult] = useState<TextAnalysisResult | ImageAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleAnalyzeText = useCallback(async (text: string) => {
        setStatus('analyzing');
        setError(null);
        try {
            setResult(await analyzeText(text));
            setStatus('success');
        } catch (err) {
            setError('An error occurred during text analysis.');
            setStatus('error');
        }
    }, []);
    
    const handleAnalyzeImage = useCallback(async (file: File) => {
        setStatus('analyzing');
        setError(null);
        try {
            setResult(await analyzeImage(file));
            setStatus('success');
        } catch (err) {
            setError('An error occurred during image analysis.');
            setStatus('error');
        }
    }, []);

    const handleReset = () => {
        setStatus('idle');
        setResult(null);
        setError(null);
    };

    const renderContent = () => {
        switch (status) {
            case 'analyzing': return <Spinner text={`Analyzing ${mode}...`} />;
            case 'success': return result ? <ResultsDisplay result={result} onReset={handleReset} /> : <p>Something went wrong.</p>;
            case 'error': return (<div className="text-center text-red-500"><p>{error}</p><button onClick={handleReset} className="mt-4 px-4 py-2 bg-white/50 rounded">Try Again</button></div>);
            case 'idle':
            default: return (
                <GlassCard className="p-6 w-full max-w-2xl text-center">
                    <Tabs mode={mode} setMode={setMode} />
                    {mode === 'text' ? <TextAnalyzerInput onAnalyze={handleAnalyzeText} /> : <ImageAnalyzerInput onAnalyze={handleAnalyzeImage} />}
                </GlassCard>
            );
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans text-gray-900 dark:text-gray-200 relative">
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="absolute top-4 right-4 p-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors duration-300 shadow-md z-10" aria-label="Toggle dark mode">{theme === 'light' ? <MoonIcon className="w-6 h-6 text-gray-700" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}</button>
            <header className="text-center mb-8"><h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">AI Content Detector</h1><p className="text-lg text-gray-600 dark:text-gray-400">Distinguish Human-Written Text from AI-Generated Content.</p></header>
            <main className="w-full flex items-center justify-center">{renderContent()}</main>
            <footer className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"><p>Powered by Advanced Content Analysis. Designed with Glassmorphism.</p></footer>
        </div>
    );
};

export default App;
