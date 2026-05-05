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
