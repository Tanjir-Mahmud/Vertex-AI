"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, Activity, Cpu } from "lucide-react";
import AnalysisInput from "@/components/AnalysisInput";
import type { InputPayload } from "@/components/AnalysisInput";
import ScanningAnimation from "@/components/ScanningAnimation";
import ResultDisplay from "@/components/ResultDisplay";
import type { AnalysisResult } from "@/components/ResultDisplay";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanMode, setScanMode] = useState<"text" | "image">("text");

  const handleSubmit = useCallback(async (payload: InputPayload) => {
    setIsScanning(true);
    setResult(null);
    setProgress(0);
    setScanMode(payload.type === "image" ? "image" : "text");

    // Animate progress bar while awaiting response
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          clearInterval(interval);
          return 88;
        }
        return prev + Math.random() * 12;
      });
    }, 250);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: AnalysisResult = await res.json();

      clearInterval(interval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));

      setResult(data);
      setScanCount((prev) => prev + 1);
    } catch {
      clearInterval(interval);
      setResult({
        score: 50,
        reasoning:
          "Connection error. Please check your network and try again.",
        ai_probability: "Unknown",
        verdict: "Suspicious",
        visual_integrity: null,
        sources: [],
        error: "Network error",
      });
      setScanCount((prev) => prev + 1);
    } finally {
      setIsScanning(false);
      setProgress(0);
    }
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* ─── Header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <motion.div
            className="relative"
            animate={{ rotate: isScanning ? 360 : 0 }}
            transition={{
              duration: 4,
              repeat: isScanning ? Infinity : 0,
              ease: "linear",
            }}
          >
            <Shield size={42} className="text-[#00ff41]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Fingerprint size={20} className="text-[#00ff41]/60" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-glow-neon text-[#00ff41]">
              VERITAS
            </h1>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#6b7280] -mt-0.5 font-[family-name:var(--font-mono)]">
              AI-Powered Truth Engine
            </p>
          </div>
        </div>

        <p className="text-[#6b7280] text-sm max-w-xl mx-auto leading-relaxed">
          Multi-modal digital trust scanner. Verify claims, detect deepfakes,
          and trace misinformation — powered by real-time web intelligence and
          forensic AI analysis.
        </p>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-5 text-[11px] font-[family-name:var(--font-mono)] text-[#6b7280]/50"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={11} />
            <span>GPT-4o</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu size={11} />
            <span>Vision Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{scanCount} scans</span>
          </div>
        </motion.div>
      </motion.header>

      {/* ─── Input ─── */}
      <AnalysisInput onSubmit={handleSubmit} isScanning={isScanning} />

      {/* ─── Scanning Animation ─── */}
      <ScanningAnimation
        isActive={isScanning}
        mode={scanMode}
        progress={progress}
      />

      {/* ─── Results ─── */}
      <AnimatePresence mode="wait">
        {result && !isScanning && (
          <motion.div
            key={scanCount}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultDisplay data={result} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Footer ─── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-20 pb-8"
      >
        <p className="text-[10px] text-[#6b7280]/25 font-[family-name:var(--font-mono)] tracking-widest uppercase">
          OpenAI GPT-4o &bull; You.com Intelligence &bull; Deepfake Detection
          &bull; VERITAS AI v2.0
        </p>
      </motion.footer>
    </main>
  );
}
