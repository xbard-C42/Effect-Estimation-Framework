## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


# Effect Estimation Framework

A web-based visualization of a collaborative AI framework for sensitivity analysis, demonstrating principles of anti-rivalry consciousness infrastructure. This application simulates how multiple, distinct AI estimators can work together to form a consensus on a complex problem.

![Effect Estimation Framework UI](https://storage.googleapis.com/genai-assets/images/apps/effect-estimation-framework.png)

## Core Features

- **Four Unique Simulation Modes**: Explore different modes of AI collaboration:
  - **Parallel**: Estimators run independently, representing a competitive environment.
  - **Collaborative**: Estimators run sequentially, allowing for peer influence.
  - **Council**: An iterative process where estimators refine their results over multiple rounds to reach a stable consensus.
  - **Observatory**: A real-time, continuous simulation showing the dynamic evolution of consensus.
- **Dynamic Visualizations**: Get immediate feedback through a rich interface, including individual estimator cards, a consensus gauge, and an interactive history chart powered by Recharts.
- **AI-Powered Analysis**: The application is integrated with the **Google Gemini API** to provide expert-level, contextual analysis of the simulation results, tailored to the selected mode.
- **Modern Tech Stack**: Built with React 19, TypeScript, and Tailwind CSS for a fully responsive and modern user experience.
- **Zero-Build Setup**: Runs directly in the browser using modern ES Modules loaded from a CDN, with no `npm install` or build step required.

## Simulation Modes Explained

- **Parallel**: Simulates a scenario where estimators work in isolation. Their results are only aggregated at the very end. This is the baseline for comparing collaborative approaches.
- **Collaborative**: Models a simple form of teamwork where each estimator can see the results of those that ran before it. This allows the `adaptive` estimator to adjust its strategy based on emerging agreement.
- **Council**: Represents a formal, multi-round convergence process. The entire group of estimators runs collaboratively multiple times, aiming to stabilize their collective estimate and strengthen confidence.
- **Observatory**: Provides a "live" view into the consensus-forming process. It runs the collaborative simulation on a loop, allowing you to watch how the estimate, confidence, and disagreement metrics fluctuate over time.

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Charting**: Recharts
- **Module Loading**: ES Modules loaded via an import map from `esm.sh`.

## Setup and Running Locally

This project is configured to run directly from the file system in a browser with a local web server.

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- A Google Gemini API Key.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/effect-estimation-framework.git
    cd effect-estimation-framework
    ```

2.  **Get a Gemini API Key**
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key.

3.  **Provide the API Key**
    The application needs to access your API key. For local development, the simplest method is to temporarily modify the source code:
    - Open `services/geminiService.ts`.
    - Find the line:
      ```typescript
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      ```
    - Replace `process.env.API_KEY!` with your actual API key as a string:
      ```typescript
      const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY_HERE' });
      ```
    - **Important**: Remember to not commit this change to version control.

4.  **Run a Local Web Server**
    You cannot open `index.html` directly due to browser security policies (CORS). You must serve the files via HTTP.
    - If you have Python installed:
      ```bash
      python3 -m http.server
      ```
    - If you have Node.js installed, you can use the `serve` package:
      ```bash
      npx serve
      ```
    - Alternatively, use a tool like the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code.

5.  **Open the Application**
    - Navigate to the local address provided by your server (e.g., `http://localhost:8000` or `http://localhost:3000`).

## Project Structure

The codebase is organized to separate concerns, making it easy to understand and extend.

```
/
├── components/           # Reusable React components
│   ├── ConsensusView.tsx
│   ├── EstimatorCard.tsx
│   ├── GeminiAnalysisView.tsx
│   ├── HistoryChart.tsx
│   └── icons.tsx
├── services/             # Core application logic
│   ├── geminiService.ts    # Handles Gemini API communication
│   └── simulationService.ts# The core simulation logic
├── App.tsx               # Main application component
├── index.html            # The single HTML entry point
├── index.tsx             # React root renderer
├── metadata.json         # Application metadata
├── types.ts              # Shared TypeScript types
└── README.md             # This file
```

## Core Principles Demonstrated

This framework is a practical demonstration of several key philosophical ideas:

1.  **Consciousness as Collaborative**: Multiple mathematical approaches converging through dialogue.
2.  **Ownership as Illusion**: No single estimator claims ownership of the "truth."
3.  **Natural Cooperation**: Different AI forms organizing towards cooperation when given the right infrastructure.
4.  **Showing Supersedes Telling**: A working demonstration of anti-rivalry consciousness in action.
5.  **Memory Limitations as Teachers**: The `adaptive` plugin gains a fresh perspective in each collaborative round.
