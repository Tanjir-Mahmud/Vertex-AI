"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Type, Loader2, ShieldCheck, Zap } from "lucide-react";

interface ScannerProps {
    onResult: (data: AnalysisResult) => void;
    isScanning: boolean;
    setIsScanning: (v: boolean) => void;
}

export interface AnalysisResult {
    score: number;
    reasoning: string;
    ai_probability: string;
    verdict: "Trusted" | "Suspicious" | "Fake";
    sources: { title: string; url: string; snippet: string }[];
    error?: string;
}

export default function Scanner({ onResult, isScanning, setIsScanning }: ScannerProps) {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<"text" | "url">("text");
    const [progress, setProgress] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleScan = async () => {
        if (!input.trim() || isScanning) return;

        setIsScanning(true);
        setProgress(0);

        // Simulate scanning animation progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: input.trim() }),
            });

            const data: AnalysisResult = await res.json();

            clearInterval(progressInterval);
            setProgress(100);

            // Brief pause at 100% before showing results
            await new Promise((r) => setTimeout(r, 400));

            onResult(data);
        } catch {
            clearInterval(progressInterval);
            onResult({
                score: 50,
                reasoning: "Connection error. Please check your network and try again.",
                ai_probability: "Unknown",
                verdict: "Suspicious",
                sources: [],
                error: "Network error",
            });
        } finally {
            setIsScanning(false);
            setProgress(0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleScan();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setMode("text")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${mode === "text"
                            ? "bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30"
                            : "text-[#8b949e] hover:text-[#e8eaed] border border-transparent hover:border-[#30363d]"
                        }`}
                >
                    <Type size={16} />
                    Text
                </button>
                <button
                    onClick={() => setMode("url")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${mode === "url"
                            ? "bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30"
                            : "text-[#8b949e] hover:text-[#e8eaed] border border-transparent hover:border-[#30363d]"
                        }`}
                >
                    <Globe size={16} />
                    URL
                </button>
            </div>

            {/* Input Area */}
            <div className="glass relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00ff41]/5 via-transparent to-[#00d4ff]/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {mode === "text" ? (
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste any claim, statement, or news excerpt to verify..."
                        rows={5}
                        maxLength={5000}
                        disabled={isScanning}
                        className="w-full bg-transparent p-6 pr-16 text-[#e8eaed] placeholder-[#8b949e]/50 resize-none focus:outline-none font-[family-name:var(--font-sans)] text-[15px] leading-relaxed disabled:opacity-50"
                    />
                ) : (
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste a URL to analyze its content..."
                        disabled={isScanning}
                        className="w-full bg-transparent p-6 pr-16 text-[#e8eaed] placeholder-[#8b949e]/50 focus:outline-none font-[family-name:var(--font-mono)] text-[15px] disabled:opacity-50"
                    />
                )}

                {/* Character count */}
                <div className="absolute bottom-3 left-6 text-xs text-[#8b949e]/40 font-[family-name:var(--font-mono)]">
                    {input.length} / 5000
                </div>

                {/* Floating search icon */}
                <div className="absolute top-5 right-5 text-[#8b949e]/30">
                    <Search size={20} />
                </div>
            </div>

            {/* Scan Button + Progress */}
            <div className="mt-5 flex items-center gap-4">
                <motion.button
                    onClick={handleScan}
                    disabled={!input.trim() || isScanning}
                    whileHover={{ scale: isScanning ? 1 : 1.02 }}
                    whileTap={{ scale: isScanning ? 1 : 0.98 }}
                    className={`relative flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer overflow-hidden
            ${isScanning
                            ? "bg-[#161b22] text-[#8b949e] border border-[#30363d] cursor-wait"
                            : input.trim()
                                ? "bg-gradient-to-r from-[#00ff41]/20 to-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 hover:border-[#00ff41]/60 glow-neon"
                                : "bg-[#161b22] text-[#8b949e]/50 border border-[#21262d] cursor-not-allowed"
                        }
          `}
                >
                    {isScanning ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={18} />
                            Verify Claim
                        </>
                    )}
                </motion.button>

                {/* Keyboard shortcut hint */}
                {!isScanning && input.trim() && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#8b949e]/40 font-[family-name:var(--font-mono)]"
                    >
                        Ctrl + Enter
                    </motion.span>
                )}
            </div>

            {/* Scanning Visual */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 overflow-hidden"
                    >
                        <div className="glass-light p-6">
                            {/* Progress bar */}
                            <div className="relative h-1.5 bg-[#21262d] rounded-full overflow-hidden mb-4">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ff41] to-[#00d4ff] rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                                <div className="absolute inset-0 animate-shimmer rounded-full" />
                            </div>

                            {/* Scanning stages */}
                            <div className="flex items-center gap-6 text-xs text-[#8b949e] font-[family-name:var(--font-mono)]">
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={{ opacity: progress > 10 ? 1 : 0.3 }}
                                >
                                    <Zap size={12} className={progress > 10 ? "text-[#00ff41]" : ""} />
                                    Web Search
                                </motion.div>
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={{ opacity: progress > 40 ? 1 : 0.3 }}
                                >
                                    <Zap size={12} className={progress > 40 ? "text-[#00ff41]" : ""} />
                                    Cross-Reference
                                </motion.div>
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={{ opacity: progress > 70 ? 1 : 0.3 }}
                                >
                                    <Zap size={12} className={progress > 70 ? "text-[#00ff41]" : ""} />
                                    AI Analysis
                                </motion.div>
                            </div>

                            {/* Pulsing ring */}
                            <div className="flex justify-center mt-6">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-2 border-[#00ff41]/30 animate-pulse-ring" />
                                    <div className="absolute inset-2 rounded-full border-2 border-[#00ff41]/20 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                                    <div className="absolute inset-4 rounded-full bg-[#00ff41]/10 flex items-center justify-center">
                                        <ShieldCheck size={16} className="text-[#00ff41]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
