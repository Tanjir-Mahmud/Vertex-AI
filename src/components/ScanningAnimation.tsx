"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, Eye, Brain, Search } from "lucide-react";

interface ScanningAnimationProps {
    isActive: boolean;
    mode: "text" | "image";
    progress: number;
}

export default function ScanningAnimation({
    isActive,
    mode,
    progress,
}: ScanningAnimationProps) {
    const stages =
        mode === "image"
            ? [
                { label: "Pixel Analysis", icon: Eye, threshold: 10 },
                { label: "Forensic Scan", icon: Search, threshold: 35 },
                { label: "Deepfake Check", icon: Brain, threshold: 65 },
            ]
            : [
                { label: "Web Search", icon: Search, threshold: 10 },
                { label: "Cross-Reference", icon: Zap, threshold: 40 },
                { label: "AI Analysis", icon: Brain, threshold: 70 },
            ];

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-3xl mx-auto overflow-hidden"
                >
                    <div className="glass-light p-6">
                        {/* ─── Progress bar ─── */}
                        <div className="relative h-1 bg-[#1e1e32] rounded-full overflow-hidden mb-5">
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #00ff41, #00d4ff)",
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 0.3 }}
                            />
                            <div className="absolute inset-0 animate-shimmer rounded-full" />
                        </div>

                        {/* ─── Stage Indicators ─── */}
                        <div className="flex items-center justify-between gap-4 mb-6 px-2">
                            {stages.map((stage, i) => {
                                const StageIcon = stage.icon;
                                const active = progress >= stage.threshold;
                                return (
                                    <motion.div
                                        key={stage.label}
                                        className="flex items-center gap-2"
                                        animate={{ opacity: active ? 1 : 0.25 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${active
                                                    ? "bg-[#00ff41]/15 text-[#00ff41]"
                                                    : "bg-[#1e1e32] text-[#6b7280]/40"
                                                }`}
                                        >
                                            <StageIcon size={12} />
                                        </div>
                                        <span
                                            className={`text-xs font-[family-name:var(--font-mono)] transition-colors duration-300 ${active ? "text-[#e8eaed]" : "text-[#6b7280]/40"
                                                }`}
                                        >
                                            {stage.label}
                                        </span>
                                        {i < stages.length - 1 && (
                                            <div
                                                className={`hidden sm:block w-8 h-px transition-colors duration-300 ${active ? "bg-[#00ff41]/20" : "bg-[#1e1e32]"
                                                    }`}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ─── Sonar Animation ─── */}
                        <div className="flex justify-center">
                            <div className="relative w-20 h-20">
                                {/* Outer sonar ping */}
                                <div className="absolute inset-0 rounded-full border border-[#00ff41]/20 animate-sonar-ping" />
                                {/* Middle sonar ring */}
                                <div className="absolute inset-1 rounded-full border border-[#00ff41]/15 animate-sonar-ring" />
                                {/* Inner pulse ring */}
                                <div className="absolute inset-3 rounded-full border border-[#00ff41]/25 animate-pulse-ring" />
                                {/* Center icon */}
                                <motion.div
                                    className="absolute inset-5 rounded-full bg-[#00ff41]/10 flex items-center justify-center"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ShieldCheck size={16} className="text-[#00ff41]" />
                                </motion.div>
                            </div>
                        </div>

                        {/* ─── Status text ─── */}
                        <motion.p
                            className="text-center text-xs text-[#6b7280]/50 mt-4 font-[family-name:var(--font-mono)]"
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {mode === "image"
                                ? "Running visual forensic analysis..."
                                : "Querying intelligence sources..."}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
