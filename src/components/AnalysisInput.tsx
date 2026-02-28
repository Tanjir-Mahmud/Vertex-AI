"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Type,
    Globe,
    ImageIcon,
    Search,
    X,
    Upload,
    ShieldCheck,
    Loader2,
} from "lucide-react";

export type InputMode = "text" | "image";
export type InputPayload = {
    type: "text" | "url" | "image";
    content: string;
};

interface AnalysisInputProps {
    onSubmit: (payload: InputPayload) => void;
    isScanning: boolean;
}

export default function AnalysisInput({
    onSubmit,
    isScanning,
}: AnalysisInputProps) {
    const [mode, setMode] = useState<InputMode>("text");
    const [textInput, setTextInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 20 * 1024 * 1024) return; // 20MB limit

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImageBase64(result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const clearImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = () => {
        if (isScanning) return;

        if (mode === "image" && imageBase64) {
            onSubmit({ type: "image", content: imageBase64 });
        } else if (mode === "text" && textInput.trim()) {
            const isUrl =
                /^https?:\/\//i.test(textInput.trim()) ||
                /^www\./i.test(textInput.trim());
            onSubmit({
                type: isUrl ? "url" : "text",
                content: textInput.trim(),
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    const canSubmit =
        (mode === "text" && textInput.trim().length > 0) ||
        (mode === "image" && imageBase64 !== null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* ─── Mode Tabs ─── */}
            <div className="flex items-center gap-1 mb-4 p-1 bg-[#10101a]/60 rounded-xl w-fit border border-[#1e1e32]/60">
                <button
                    onClick={() => setMode("text")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${mode === "text"
                            ? "bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
                            : "text-[#6b7280] hover:text-[#e8eaed]"
                        }`}
                >
                    <Type size={15} />
                    Text / URL
                </button>
                <button
                    onClick={() => setMode("image")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${mode === "image"
                            ? "bg-[#00ff41]/10 text-[#00ff41] shadow-[0_0_12px_rgba(0,255,65,0.1)]"
                            : "text-[#6b7280] hover:text-[#e8eaed]"
                        }`}
                >
                    <ImageIcon size={15} />
                    Image
                </button>
            </div>

            {/* ─── Input Card ─── */}
            <div className="glass relative group overflow-hidden">
                {/* Accent glow on focus */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00ff41]/[0.03] via-transparent to-[#00d4ff]/[0.03] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {mode === "text" ? (
                    /* ─── Text / URL Input ─── */
                    <div className="relative">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Paste any claim, statement, news excerpt, or URL to verify..."
                            rows={5}
                            maxLength={5000}
                            disabled={isScanning}
                            className="w-full bg-transparent p-6 pr-14 text-[#e8eaed] placeholder-[#6b7280]/40 resize-none focus:outline-none font-[family-name:var(--font-sans)] text-[15px] leading-relaxed disabled:opacity-40"
                        />
                        <div className="absolute bottom-3 left-6 flex items-center gap-3 text-xs text-[#6b7280]/30 font-[family-name:var(--font-mono)]">
                            <span>{textInput.length}/5000</span>
                            {/^https?:\/\//i.test(textInput.trim()) && (
                                <span className="flex items-center gap-1 text-[#00d4ff]/50">
                                    <Globe size={10} />
                                    URL detected
                                </span>
                            )}
                        </div>
                        <div className="absolute top-5 right-5 text-[#6b7280]/20">
                            <Search size={18} />
                        </div>
                    </div>
                ) : (
                    /* ─── Image Upload ─── */
                    <div
                        className={`relative p-6 transition-all duration-300 ${isDragOver ? "dropzone-active" : ""
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {imagePreview ? (
                            /* ── Preview ── */
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    className="w-full max-h-64 object-contain rounded-lg border border-[#1e1e32]"
                                />
                                <button
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#10101a]/80 border border-[#2a2a44] flex items-center justify-center text-[#6b7280] hover:text-[#dc143c] hover:border-[#dc143c]/40 transition-all cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            /* ── Drop zone ── */
                            <div
                                className="flex flex-col items-center justify-center py-12 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <motion.div
                                    className="w-16 h-16 rounded-2xl bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center mb-4"
                                    animate={{ y: isDragOver ? -8 : 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Upload
                                        size={24}
                                        className={
                                            isDragOver ? "text-[#00ff41]" : "text-[#6b7280]"
                                        }
                                    />
                                </motion.div>
                                <p className="text-sm text-[#6b7280] mb-1">
                                    {isDragOver
                                        ? "Drop image here..."
                                        : "Drag & drop an image, or click to browse"}
                                </p>
                                <p className="text-xs text-[#6b7280]/40 font-[family-name:var(--font-mono)]">
                                    JPG, PNG, WebP — Max 20MB
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(file);
                            }}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            {/* ─── Submit Button ─── */}
            <div className="mt-5 flex items-center gap-4">
                <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isScanning}
                    whileHover={{ scale: isScanning ? 1 : 1.02 }}
                    whileTap={{ scale: isScanning ? 1 : 0.98 }}
                    className={`relative flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer overflow-hidden
            ${isScanning
                            ? "bg-[#10101a] text-[#6b7280] border border-[#1e1e32] cursor-wait"
                            : canSubmit
                                ? "bg-gradient-to-r from-[#00ff41]/20 to-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 hover:border-[#00ff41]/60 glow-neon"
                                : "bg-[#10101a] text-[#6b7280]/40 border border-[#1e1e32] cursor-not-allowed"
                        }`}
                >
                    {isScanning ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={18} />
                            {mode === "image" ? "Detect Deepfake" : "Verify Claim"}
                        </>
                    )}
                </motion.button>

                {!isScanning && canSubmit && mode === "text" && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#6b7280]/30 font-[family-name:var(--font-mono)]"
                    >
                        Ctrl + Enter
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
}
