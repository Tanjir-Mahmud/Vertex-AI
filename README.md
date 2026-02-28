# VERITAS AI — Multi-Modal Digital Trust & Deepfake Detection Dashboard

VERITAS AI is a comprehensive, production-ready dashboard designed to combat misinformation and synthetic media. It provides a real-time, multi-modal "Truth Scanner" that analyzes text claims, URLs, and images to determine their authenticity.

![VERITAS AI Dashboard](docs/assets/dashboard-preview.png) *(Preview placeholder)*

## Features

- **Multi-Modal Input:** Unified glassmorphism interface supporting Text (claims/statements), URLs, and Image uploads (drag-and-drop).
- **Text & URL Fact-Checking:** Leverages **You.com Search API** for real-time web grounding, feeding context into **OpenAI GPT-4o** to evaluate accuracy and detect AI-generated phrasing.
- **Image Deepfake Detection:** Directly analyzes images using **GPT-4o Vision** with specialized forensic prompts looking for anatomical anomalies, boundary artifacts, and unnatural lighting.
- **Cyber-Noir Aesthetic:** High-end dark theme (`#050509`) with neon green (`#00FF41`), amber, and crimson indicator colors.
- **Polished Animations:** Non-blocking "sonar" and "laser scan" animations built with Framer Motion, providing visual feedback during the forensic analysis process.
- **Detailed Reporting:** Returns a unified 0-100% Trust Score, a clear Verdict (Trusted, Suspicious, Fake), AI Detection probability, Reasoning, Visual Integrity (for images), and cited sources.

## System Architecture

VERITAS uses a modern Next.js 14+ App Router architecture with a cleanly separated client/server model.

```mermaid
graph TD
    Client[Client UI: React + Tailwind + Framer Motion]
    Client -->|User Input Payload\nType: text/url/image| API[/api/analyze Route Handler]
    
    API --> Condition{Input Type?}
    
    Condition -->|text/url| YouSearch[You.com Search API]
    YouSearch -->|Web Context Snippets| GPT4o[OpenAI GPT-4o]
    
    Condition -->|image| GPT4oVision[OpenAI GPT-4o Vision]
    GPT4oVision -->|Forensic Prompt + Base64| GPT4oVision
    
    GPT4o --> Normalizer[Data Normalization]
    GPT4oVision --> Normalizer
    
    Normalizer -->|Unified JSON Response:\nScore, Verdict, Reasoning,\nVisual Integrity, Sources| API
    API -->|Display Results| Client
```

### Flow Breakdown:
1.  **Frontend State:** `page.tsx` orchestrates the flow. The user interacts with `AnalysisInput.tsx` (handles Text/URL typing or Image drag-and-drop base64 encoding).
2.  **API Routing:** Payload is sent to `app/api/analyze/route.ts`.
3.  **Branching Logic:**
    -   *Text/URL:* Fetches recent context via `https://api.ydc-index.io/search`. Passes the original physical input + web context to `gpt-4o` instructed as a forensic journalist.
    -   *Image:* Bypasses web search. Sends the base64 image via Data URI to `gpt-4o` instantiated as a visual forensic analyst looking for deepfake anomalies.
4.  **Display:** `ScanningAnimation.tsx` displays context-aware stages (e.g., "Pixel Analysis" vs "Web Search") while waiting. Finally, `ResultDisplay.tsx` dynamically renders the returned JSON object, including an animated SVG Trust Score ring.

## Technology Stack

- **Frontend:** Next.js 14+ (React 18), Tailwind CSS v4, Framer Motion, Lucide React (Icons).
- **Backend:** Next.js Route Handlers (Node.js runtime).
- **AI/APIs:** OpenAI (`gpt-4o` text & vision models), You.com Search API.
- **Language:** TypeScript.

## Local Development Initialization

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Tanjir-Mahmud/Veritas.git
    cd Veritas
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env.local` file in the root directory and add your API keys. **Never commit this file.**
    ```env
    YOU_API_KEY=your_you_com_api_key_here
    OPENAI_API_KEY=your_openai_api_key_here
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure Highlights

-   `src/app/page.tsx`: Main dashboard and state orchestration.
-   `src/app/layout.tsx`: Root document, font loading, dark mode setup.
-   `src/app/globals.css`: Custom cyber-noir design system, neon utilities, and keyframe animations.
-   `src/app/api/analyze/route.ts`: Core backend logic and API integrations.
-   `src/components/AnalysisInput.tsx`: Unified multi-modal input component.
-   `src/components/ScanningAnimation.tsx`: "Sonar" loading states.
-   `src/components/ResultDisplay.tsx`: The forensic result card UI.

## Security & Best Practices
-   **Secret Management:** API keys are never exposed to the client. All API calls to You.com and OpenAI happen server-side inside the `/api/analyze` Route Handler.
-   **Error Handling:** Try-catch blocks wrap external service calls, gracefully falling back to safe UI states if APIs fail or timeout.
-   **Payload Limitations:** Strict boundaries on input sizes (max 5000 characters for text, max 20MB for images).
