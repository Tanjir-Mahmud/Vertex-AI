import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 30;

/* ─── Types ─── */
interface AnalyzeRequest {
    type: "text" | "url" | "image";
    content: string; // plain text, URL string, or base64-encoded image
}

interface YouSearchHit {
    title?: string;
    url?: string;
    snippets?: string[];
    description?: string;
}

interface YouSearchResponse {
    hits?: YouSearchHit[];
}

interface SourceItem {
    title: string;
    url: string;
    snippet: string;
}

interface AnalysisResult {
    score: number;
    reasoning: string;
    ai_probability: string;
    verdict: "Trusted" | "Suspicious" | "Fake";
    visual_integrity: string | null;
    sources: SourceItem[];
}

/* ─── You.com Web Grounding (text/url only) ─── */
async function fetchWebContext(
    query: string
): Promise<{ snippets: string; sources: SourceItem[] }> {
    const apiKey = process.env.YOU_API_KEY;
    if (!apiKey) {
        console.warn("YOU_API_KEY not set — skipping web grounding.");
        return { snippets: "No web context available.", sources: [] };
    }

    try {
        const encoded = encodeURIComponent(query.slice(0, 200));
        const res = await fetch(
            `https://api.ydc-index.io/search?q=${encoded}`,
            { headers: { "X-API-Key": apiKey } }
        );

        if (!res.ok) {
            console.error(`You.com API error: ${res.status} ${res.statusText}`);
            return { snippets: "Web search temporarily unavailable.", sources: [] };
        }

        const data: YouSearchResponse = await res.json();
        const hits = data.hits?.slice(0, 5) || [];

        const sources: SourceItem[] = hits.map((h) => ({
            title: h.title || "Untitled",
            url: h.url || "",
            snippet: (h.snippets?.[0] || h.description || "").slice(0, 300),
        }));

        const contextSnippets = sources
            .map((s, i) => `[Source ${i + 1}] ${s.title}: ${s.snippet}`)
            .join("\n\n");

        return {
            snippets: contextSnippets || "No relevant results found.",
            sources,
        };
    } catch (err) {
        console.error("You.com fetch error:", err);
        return { snippets: "Web search failed.", sources: [] };
    }
}

/* ─── Gemini: Text / URL analysis ─── */
async function analyzeText(input: string, webContext: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a forensic analyst specializing in multi-modal digital forgery and misinformation detection. Analyze the provided text against the web search context. If the web search context is unavailable or unhelpful, rely on your own vast internal knowledge base to evaluate the claim's factual, scientific, or historical accuracy.

Output strictly in JSON configuration (no markdown, no code fences):
{
  "score": <number 0-100, where 100 = fully trustworthy>,
  "reasoning": "<detailed 2-4 sentence analysis>",
  "ai_probability": "<Low/Medium/High>",
  "verdict": "<Trusted/Suspicious/Fake>",
  "visual_integrity": null
}

Scoring guide:
- 80-100: Well-supported by multiple credible sources or established facts
- 50-79: Partially supported, some claims unverifiable
- 20-49: Contradicted by sources or contains misleading claims
- 0-19: Clearly false or fabricated information`;

    const userPrompt = `CLAIM/TEXT TO ANALYZE:
"""
${input}
"""

WEB SEARCH CONTEXT:
"""
${webContext}
"""

Analyze the claim against the web context and provide your assessment as JSON.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });

    const content = response.text;
    if (!content) throw new Error("Empty Gemini response");

    return JSON.parse(content);
}

/* ─── Gemini: Image / Deepfake analysis ─── */
async function analyzeImage(base64Image: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const ai = new GoogleGenAI({ apiKey });

    // Extract base64 payload and MIME type
    const match = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
    let mimeType = "image/jpeg";
    let base64Data = base64Image;

    if (match) {
        mimeType = match[1];
        base64Data = match[2];
    }

    const systemPrompt = `You are a forensic analyst specializing in deepfake and AI-generated image detection. Examine the provided image with extreme scrutiny for hallmarks of synthetic generation or manipulation.

Check for:
1. Anatomical anomalies (extra/missing fingers, distorted ears, asymmetric features)
2. Boundary artifacts (blurring between foreground/background, seam artifacts)
3. Unnatural lighting (inconsistent shadows, impossible reflections, lighting direction mismatches)
4. Background anomalies (warped text, impossible geometry, repeating patterns, morphing objects)
5. Texture inconsistencies (plastic skin, hair that merges, fabric that warps unrealistically)
6. Metadata-style tells (too-perfect composition, uncanny valley effects)

Output strictly in JSON configuration (no markdown, no code fences):
{
  "score": <number 0-100, where 100 = authentic/trustworthy>,
  "reasoning": "<detailed 2-4 sentence forensic analysis>",
  "ai_probability": "<Low/Medium/High — likelihood the image is AI-generated>",
  "verdict": "<Trusted/Suspicious/Fake>",
  "visual_integrity": "<1-2 sentence summary of visual integrity findings>"
}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    { text: "Analyze this image for signs of AI generation, deepfake manipulation, or digital forgery. Provide your forensic assessment as JSON." },
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                ],
            },
        ],
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });

    const content = response.text;
    if (!content) throw new Error("Empty Gemini vision response");

    return JSON.parse(content);
}

/* ─── Normalise raw Gemini JSON into AnalysisResult ─── */
function normalise(
    raw: Record<string, unknown>,
    sources: SourceItem[]
): AnalysisResult {
    return {
        score: Math.max(0, Math.min(100, Number(raw.score) || 50)),
        reasoning: String(raw.reasoning || "Analysis could not be completed."),
        ai_probability: String(raw.ai_probability || "Unknown"),
        verdict: (["Trusted", "Suspicious", "Fake"].includes(raw.verdict as string)
            ? raw.verdict
            : "Suspicious") as AnalysisResult["verdict"],
        visual_integrity: raw.visual_integrity
            ? String(raw.visual_integrity)
            : null,
        sources,
    };
}

/* ─── Route Handler ─── */
export async function POST(request: Request) {
    try {
        const body: AnalyzeRequest = await request.json();

        if (
            !body.content ||
            typeof body.content !== "string" ||
            body.content.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Input content is required." },
                { status: 400 }
            );
        }

        const inputType = body.type || "text";

        /* ── Image path ── */
        if (inputType === "image") {
            const raw = await analyzeImage(body.content);
            const result = normalise(raw, []);
            return NextResponse.json(result);
        }

        /* ── Text / URL path ── */
        if (body.content.trim().length > 5000) {
            return NextResponse.json(
                { error: "Input must be under 5000 characters." },
                { status: 400 }
            );
        }

        const { snippets, sources } = await fetchWebContext(body.content.trim());
        const raw = await analyzeText(body.content.trim(), snippets);
        const result = normalise(raw, sources);

        return NextResponse.json(result);
    } catch (err) {
        console.error("Analysis route error:", err);
        return NextResponse.json(
            {
                score: 50,
                reasoning:
                    "Analysis service (Gemini) is temporarily unavailable. Please try again.",
                ai_probability: "Unknown",
                verdict: "Suspicious" as const,
                visual_integrity: null,
                sources: [],
                error: err instanceof Error ? err.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
