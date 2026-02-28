"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Bot,
    ExternalLink,
    TrendingUp,
    AlertTriangle,
    BookOpen,
} from "lucide-react";
import type { AnalysisResult } from "./Scanner";

interface ResultCardProps {
    data: AnalysisResult;
}

function getVerdictConfig(verdict: string) {
    switch (verdict) {
        case "Trusted":
            return {
                color: "#00ff41",
                bg: "rgba(0, 255, 65, 0.08)",
                border: "rgba(0, 255, 65, 0.25)",
                icon: ShieldCheck,
                label: "VERIFIED TRUSTED",
                glowClass: "glow-neon",
                textGlowClass: "text-glow-neon",
            };
        case "Fake":
            return {
                color: "#dc143c",
                bg: "rgba(220, 20, 60, 0.08)",
                border: "rgba(220, 20, 60, 0.25)",
                icon: ShieldX,
                label: "FLAGGED AS FAKE",
                glowClass: "glow-crimson",
                textGlowClass: "text-glow-crimson",
            };
        default:
            return {
                color: "#ffbf00",
                bg: "rgba(255, 191, 0, 0.08)",
                border: "rgba(255, 191, 0, 0.25)",
                icon: ShieldAlert,
                label: "SUSPICIOUS",
                glowClass: "glow-amber",
                textGlowClass: "text-glow-amber",
            };
    }
}

function ScoreRing({ score, color }: { score: number; color: string }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 score-ring" viewBox="0 0 120 120">
                {/* Background ring */}
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#21262d"
                    strokeWidth="6"
                />
                {/* Score ring */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-3xl font-bold font-[family-name:var(--font-mono)]"
                    style={{ color }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    {score}
                </motion.span>
                <span className="text-[10px] text-[#8b949e] uppercase tracking-widest mt-0.5">
                    Trust
                </span>
            </div>
        </div>
    );
}

export default function ResultCard({ data }: ResultCardProps) {
    const config = getVerdictConfig(data.verdict);
    const VerdictIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl mx-auto mt-8"
        >
            <div
                className={`glass ${config.glowClass} overflow-hidden`}
                style={{ borderColor: config.border }}
            >
                {/* Top accent bar */}
                <div
                    className="h-0.5 w-full"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                    }}
                />

                <div className="p-8">
                    {/* Header: Score + Verdict */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <ScoreRing score={data.score} color={config.color} />

                        <div className="flex-1 text-center sm:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-3 justify-center sm:justify-start mb-2"
                            >
                                <VerdictIcon size={24} style={{ color: config.color }} />
                                <span
                                    className={`text-lg font-bold tracking-wider font-[family-name:var(--font-mono)] ${config.textGlowClass}`}
                                    style={{ color: config.color }}
                                >
                                    {config.label}
                                </span>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-[#8b949e] text-sm leading-relaxed mt-3"
                            >
                                {data.reasoning}
                            </motion.p>
                        </div>
                    </div>

                    {/* Metrics Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                    >
                        {/* Trust Score */}
                        <div className="glass-light p-4 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: config.bg }}
                            >
                                <TrendingUp size={18} style={{ color: config.color }} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">
                                    Trust Score
                                </div>
                                <div className="text-lg font-bold font-[family-name:var(--font-mono)]" style={{ color: config.color }}>
                                    {data.score}%
                                </div>
                            </div>
                        </div>

                        {/* AI Probability */}
                        <div className="glass-light p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00d4ff]/10">
                                <Bot size={18} className="text-[#00d4ff]" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">
                                    AI Detection
                                </div>
                                <div className="text-lg font-bold font-[family-name:var(--font-mono)] text-[#00d4ff]">
                                    {data.ai_probability}
                                </div>
                            </div>
                        </div>

                        {/* Verdict */}
                        <div className="glass-light p-4 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: config.bg }}
                            >
                                <AlertTriangle size={18} style={{ color: config.color }} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-[#8b949e]">
                                    Verdict
                                </div>
                                <div className="text-lg font-bold font-[family-name:var(--font-mono)]" style={{ color: config.color }}>
                                    {data.verdict}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sources */}
                    {data.sources && data.sources.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen size={14} className="text-[#8b949e]" />
                                <span className="text-xs uppercase tracking-widest text-[#8b949e] font-semibold">
                                    Source Citations
                                </span>
                            </div>

                            <div className="space-y-3">
                                {data.sources.map((source, i) => (
                                    <motion.a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 + i * 0.1 }}
                                        className="glass-light p-4 flex items-start gap-3 group hover:border-[#30363d] transition-all duration-300 block"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-[#00ff41]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-[#00ff41] font-[family-name:var(--font-mono)]">
                                                {i + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-[#e8eaed] truncate">
                                                    {source.title}
                                                </span>
                                                <ExternalLink
                                                    size={12}
                                                    className="text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                />
                                            </div>
                                            <p className="text-xs text-[#8b949e] mt-1 line-clamp-2 leading-relaxed">
                                                {source.snippet}
                                            </p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
