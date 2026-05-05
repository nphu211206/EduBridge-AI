<div align="center">

# 🚀 EduBridge AI
**Next-Generation Multi-Agent Adaptive Learning Ecosystem**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nphu211206/EduBridge-AI)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript)
![Architecture](https://img.shields.io/badge/Architecture-Multi--Agent-FF6B6B?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Beta_Deployed-success?style=for-the-badge)

*Winner of the HUBT Innovation & Entrepreneurship Startup Award* 🏆

</div>

---

## 📖 Executive Summary

**EduBridge AI** is not just another LLM wrapper. It is a highly optimized, context-aware cognitive architecture designed to revolutionize personalized education. By leveraging a custom **API Gateway**, **Retrieval-Augmented Generation (RAG)**, and an autonomous **Multi-Agent Orchestration Workflow**, EduBridge AI provides a Socratic tutoring experience that guides students through complex logic (Python/JS debugging, system design) without spoon-feeding answers.

### ⚡ The Problem We Solved
1. **The "Direct Answer" Pitfall:** Standard AI models give immediate answers, severely hindering the student's independent critical thinking process.
2. **Context Amnesia:** Single-turn LLMs fail to track long-term student weaknesses.
3. **Runaway API Costs:** Routing every simple query to a heavy, high-parameter model causes massive token waste and high latency.

---

## 🧠 System Architecture & Multi-Agent Orchestration

The core innovation of EduBridge AI lies in its dynamic routing and agentic collaboration. 

```mermaid
graph TD
    User((Student)) -->|User Query| Gateway[API Gateway & Router]
    Gateway -->|High Complexity| Orchestrator[Orchestrator Agent]
    Gateway -->|Low Complexity| FastLLM[Fast Model Lane <br>e.g., Gemini Flash]
    
    Orchestrator -->|Inject Context| RAG[Memory Profiler Agent <br>Vector DB]
    RAG --> Tutor[Socratic Tutor Agent <br>Long-Chain Reasoning]
    
    Tutor -->|Draft Response| Sandbox[Sandbox Evaluator Agent]
    Sandbox -->|Self-Correction| Tutor
    Sandbox -->|Validated Hint| User

1. 🚦 Smart API Gateway & RoutingBuilt for Vercel edge deployment, our gateway intercepts incoming payloads and performs zero-shot intent classification.Fast Lane: Syntax checks and definitions are routed to high-speed, low-cost models.Reasoning Lane: Algorithmic debugging and logical breakdown are routed to high-tier reasoning models.Result: Reduced overall API Token consumption by ~40% while maintaining high output quality.2. 🦉 Socratic Tutor Agent (Tree-of-Thoughts)Instead of linear CoT, this agent uses multi-branch reasoning. When a student submits faulty code:Phase A: Internal logic analysis (silent).Phase B: Vulnerability mapping against the student's historical data.Phase C: Generation of 3 potential Socratic hints.Phase D: Selection of the optimal question to prompt the student's "Aha!" moment.3. 💾 Memory Profiler Agent (RAG Engine)We utilize a Vector Database to store serialized session logs. The system continuously updates a "Capability Profile" for each user. If a student consistently struggles with asynchronous JavaScript or Python nested loops, the Profiler dynamically injects this context into the Tutor's system prompt.4. 🛡️ Sandbox Evaluator (Self-Correction)Before any code snippet or logic hint reaches the student, the Evaluator Agent runs a simulated check to ensure the pedagogical guidance is technically accurate and free of hallucinations.🛠️ Technology StackComponentTechnologyDescriptionBackend & RoutingPython, Node.jsCore microservices and asynchronous task handling.DeploymentVercelEdge functions for ultra-low latency API Gateway.Agent FrameworkCustom Native ImplementationBuilt from scratch for maximum token efficiency (bypassing heavy frameworks).Vector StoragePinecone / WeaviateHigh-dimensional embedding storage for RAG.📈 Performance & Impact MetricsCost Efficiency: Dynamic API routing algorithm saves up to 40% in token overhead.Pedagogical Impact: Multi-turn conversational retention improved significantly due to the RAG Memory Agent.Academic Recognition: Officially recognized and awarded in a university-level startup pitch competition (HUBT).🔮 Roadmap[x] Multi-Agent core logic implementation.[x] RAG integration for long-term memory.[x] API Gateway dynamic model routing.[ ] Integration with advanced speech-to-text models for spoken tutoring.[ ] Expanding the Sandboxed execution environment for real-time code compilation testing.
