# PulseCatch (CatchUp-Local)

> **The Unread Problem: “What Did I Miss?”**  
> An air-gapped, local-first chat triage micro-app that prioritizes action items, key decisions, and team discussions without cloud leaks, latency, or hallucination.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#privacy-guarantees)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen.svg)](#automated-testing)

---

## 🚀 Overview

Knowledge workers return from meetings or deep-work blocks to hundreds of unread messages across Slack, Microsoft Teams, and Discord. Reading every message is overwhelming, but missing a key deliverable or decision can derail a project.

**PulseCatch** provides instant, private conversation triage:
1. **Personal Identity Lens**: Filters deliverables specifically assigned to *you* vs general team chatter.
2. **Deterministic Provenance (Trust Anchor)**: Every extracted task or decision links directly to its verbatim source message line—eliminating AI hallucination.
3. **Calculated Noise Reduction**: Measurably strips routine banter and conversational filler (typically reducing reading volume by 70–90%).
4. **100% Client-Side Privacy**: Raw transcripts never leave your browser runtime. Zero external telemetry or third-party API dependencies.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework**: [React 18](https://react.dev/) (Component-based architecture, hooks, local state management)
* **Build Tool & Bundler**: [Vite 5](https://vitejs.dev/) (Lightning-fast HMR and optimized production bundling)
* **Styling**: **Vanilla CSS** with design tokens aligned with Google Stitch aesthetic specifications:
  * Sleek modern typography: *Plus Jakarta Sans* & *JetBrains Mono*
  * Curated color palettes with HSL-derived accents (Indigo, Emerald, Rose)
  * Accessible focus states, subtle micro-animations, and smooth slide-over drawers
* **Icons**: [Lucide React](https://lucide.dev/) (Consistent, lightweight SVG iconography)
* **Client Storage**: `LocalStorage` API for persistent offline session history and persona profiles (`pulsecatch_sessions_v1`, `pulsecatch_user_profile_v1`)

### Analysis Engine (Phase 1 Baseline)
* **Processing**: **100% On-Device JavaScript Heuristic & Semantic Parsing Engine** (`frontend/src/services/analyzer.js`)
* **Format Parsers**: Slack timestamps (`[HH:MM] Author: text`), WhatsApp exports (`DD/MM/YYYY, HH:MM - Author: text`), Discord exports, and Slack JSON archive arrays
* **Zero Cloud Egress**: Does not require external LLM API keys, eliminating cold-start latency, cloud costs, and data leak vulnerabilities

### Optional Companion Backend
* **Language & Runtime**: Python 3.10+
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with [Uvicorn](https://www.uvicorn.org/)
* **Database**: SQLite (Local embedded storage)
* **Optional Local AI**: Ollama connector for local on-device LLM inference (Phase 2 integration)

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Clean Ingestion Dashboard** | Direct paste textarea, drag-and-drop dropzone, and 3 pre-packaged incident/launch presets for instant evaluation. |
| **Personal Identity Lens** | Configure your name, role, and focus keywords. Deliverables are partitioned into **"Assigned to Me (Personal Blast Radius)"** vs team awareness. |
| **Trust Anchor / Source Inspector** | Click any extracted task or decision to open the slide-over inspector, highlighting the exact message line in yellow. |
| **Drag-and-Drop File Upload** | Import `.txt`, `.json`, `.csv`, or `.log` thread exports up to 5MB with safe `FileReader` handling. |
| **Action Items & Checkboxes** | Interactive task list with priority tags, deadlines, and completion checkboxes. |
| **Export & Sharing** | One-click **Export MD** (generates formatted Markdown digest) and **Copy Tasks** (copies markdown checklist to clipboard). |
| **Accessible Toast System** | Non-blocking, polite screen-reader announcements for successful actions, clipboard copies, and error warnings. |
| **Clear / Reset Guard** | Toolbar control to wipe inputs and stale analysis with unsaved change confirmation. |

---

## 🔒 Privacy Guarantees

* **Zero Network Requests with Content**: Chat transcripts are parsed entirely within the browser sandbox.
* **No Telemetry**: No tracking pixels, Google Analytics, or external cloud storage.
* **Air-Gapped Ready**: Once web assets are loaded, the application runs entirely offline.

---

## 🏁 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Installation

```bash
# Clone or navigate to the repository folder
cd c:\Users\Dell\Desktop\PROTOCOLX\frontend

# Install dependencies
npm install
```

### 2. Start Local Development Server

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser to:
👉 **[http://localhost:5173/](http://localhost:5173/)**

### 3. Run Automated Engine Tests

```bash
npm test
```
*Executes all 10 engine verification tests (input validation, stable message IDs, assignee extraction, blocker tracking, persona shifts, format detection, and noise reduction calculations).*

### 4. Build for Production

```bash
npm run build
```
*Generates optimized static assets in `dist/` in under 4 seconds.*

---

## 📁 Project Directory Structure

```text
PROTOCOLX/
├── frontend/
│   ├── index.html                   # HTML entry point with web fonts
│   ├── package.json                 # Scripts and dependencies
│   ├── test_engine.js               # Standalone 10-test verification suite
│   ├── src/
│   │   ├── main.jsx                 # React root mount
│   │   ├── App.jsx                  # State orchestrator, tab routing & toasts
│   │   ├── index.css                # Stitch design system tokens & animations
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Primary navigation (Dashboard, Results, etc.)
│   │   │   ├── Header.jsx           # Active channel badge & persona pill
│   │   │   ├── DashboardScreen.jsx  # Input, drag-and-drop, sample presets & reset
│   │   │   ├── AnalysisScreen.jsx   # Executive summary, metric cards, action items
│   │   │   ├── SourceInspector.jsx  # Provenance slide-over line highlighter
│   │   │   ├── PersonaModal.jsx     # Blast radius identity configuration modal
│   │   │   └── Toast.jsx            # Accessible toast notifications
│   │   ├── data/
│   │   │   └── sampleConversations.js # Realistic incident & launch sample chats
│   │   └── services/
│   │       └── analyzer.js          # Local deterministic parsing engine
├── backend/                         # Optional FastAPI companion backend
│   ├── main.py
│   └── requirements.txt
└── README.md                        # Documentation & Tech Stack Guide
```

---

## 🎬 Recommended 90-Second Hackathon Live Demo

1. **0:00 – 0:20 (The Problem & Solution)**
   * Explain the cognitive overload of unread chat channels.
   * Highlight that PulseCatch runs **100% on-device** with zero data leaks.
2. **0:20 – 0:45 (One-Click Ingestion)**
   * On the **Dashboard**, click **Load Sample** (`#outage-incident`) or drag a `.txt` file into the dropzone.
   * Point out the token counter (`~4,820 tokens`) and click **Analyze Messages**.
3. **0:45 – 1:15 (Triage Board & Trust Anchor)**
   * Show the **Executive Summary** and the **Noise Filtered** metric (e.g. 83% noise stripped).
   * Demonstrate the **Assigned to Me (Personal Blast Radius)** section showing Priya's direct tasks.
   * Click **Source [msg_3] →**: show the **Source Message Inspector** slide-out highlighting the exact raw quote in yellow with zero hallucination.
4. **1:15 – 1:30 (Export & Persistence)**
   * Click **Export MD** and **Copy Tasks** (confirm toasts appear).
   * Click **Recent Summaries** in the sidebar to demonstrate on-device LocalStorage persistence.
   * Conclude: *"PulseCatch: Fast, private chat triage with verified provenance."*

---

## 📄 License
MIT License. Created for the Hackathon.
