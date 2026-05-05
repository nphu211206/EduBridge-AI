# 🚀 EduBridge AI: Multi-Agent Adaptive Learning Gateway

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg) ![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg) ![LLM](https://img.shields.io/badge/LLM-Multi--Model_Routing-orange.svg)

EduBridge AI is an enterprise-grade educational platform leveraging a Multi-Agent architecture with Long-Chain Reasoning to provide Socratic-style tutoring and automated assessments.

## 🧠 Core Architecture (API Gateway & Agent Routing)
Our custom Orchestrator routes requests dynamically to optimize API Token costs and latency:
- **Fast Lane (DeepSeek/Gemini-Flash):** General queries, chit-chat, syntax checks.
- **Reasoning Lane (Claude 3.5/GPT-4o):** Complex logic debugging, Socratic long-chain generation.

## ⚙️ Multi-Agent Workflow
1. **Orchestrator Agent**: Context length analysis & dynamic model routing.
2. **Socratic Tutor Agent**: Tree-of-Thoughts (ToT) reasoning to guide students without giving direct answers.
3. **Memory Profiler (RAG)**: Integrates with Vector DB to track student weaknesses (e.g., specific JavaScript/Python bugs).
4. **Sandbox Evaluator**: Self-correction layer before outputting to the frontend.

## 🏆 Achievements
- **Winner** - University Innovation & Entrepreneurship Startup Pitch.

*Note: Core backend repositories remain private due to API keys and proprietary routing logic. This repo serves as the architectural overview.*
