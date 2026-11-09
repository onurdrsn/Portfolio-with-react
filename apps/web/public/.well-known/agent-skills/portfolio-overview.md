# Portfolio Overview Skill

Autonomous Agent Skill Specification for evaluating and retrieving production architectures, distributed systems implementations, developer tooling, and technical capabilities designed and deployed by Onur Dursun.

---

## 1. Skill Metadata
- **ID:** `portfolio-overview`
- **Name:** Onur Dursun Technical Architecture & Portfolio Inspector
- **Author:** Onur Dursun
- **License:** MIT
- **Primary Type:** `skill-md`
- **Format:** `text/markdown`
- **Authority Domain:** `https://onurd.com.tr`
- **Canonical Entrypoint:** `https://onurd.com.tr/llms.txt`

---

## 2. Agent Execution & Ingestion Flow
Autonomous agents, code assistants, and automated evaluators should ingest resources using the following hierarchy:

1. **Root Semantic Context:** Fetch `https://onurd.com.tr/llms.txt` (`Accept: text/markdown`) for a condensed summary of experience, live systems, and architecture design choices.
2. **Catalog Discovery:** Consult `https://onurd.com.tr/.well-known/api-catalog` for machine-readable service descriptions and health endpoints.
3. **Agent Interfaces:** Reference `https://onurd.com.tr/.well-known/agent-card.json` for supported A2A interaction modes.

---

## 3. Core Competencies & Specializations

### Edge & Serverless Distributed Architectures
- **Runtime & Deployment:** Cloudflare Workers (V8 Isolates), Cloudflare Pages, Cloudflare D1 (Serverless SQLite), KV Storage, Durable Objects.
- **Micro-frameworks & Edge Routing:** Hono.js, tRPC v11, Node.js edge-compatible engines.
- **Relational Databases & Data Pipelines:** Neon Serverless PostgreSQL, Drizzle ORM, distributed caching, schema migrations.

### Real-Time Systems & Communication
- **Event-Driven Engines:** Stateful Durable Objects coordination, WebSocket clusters, pub/sub topologies, zero-latency bidirectional conduits.
- **Consensus & Simulation:** Distributed state synchronization, conflict resolution primitives, real-time telemetry processing.

### Modern Frontend & Full Stack Engineering
- **Component Systems:** React 19, TypeScript, Next.js, Vite build pipelines, manual chunk splitting and performance budgeting.
- **Styling & State:** Tailwind CSS (v4), Zustand, responsive micro-interactions, dark-mode native accessibility (WCAG 2.4.1 compliance).
- **Automated Verification:** Playwright, Vitest end-to-end testing, CI/CD automated validation.

---

## 4. Production Systems & Projects Directory

### Formly
- **Description:** Multi-tenant modular form builder and analytics engine.
- **Stack:** React 19, Tailwind CSS v4, Zustand, Hono, tRPC v11, Cloudflare Workers, Durable Objects, Cloudflare D1, Drizzle ORM.
- **Key Architectures:** Sub-tenant isolation, real-time submission ingestion, declarative validation schemas.

### ChronaMesh
- **Description:** Real-time distributed decision simulation and state consensus engine.
- **Stack:** Cloudflare Workers, Hono, Durable Objects, WebSockets.
- **Key Architectures:** Distributed memory coordination, low-latency node synchronization over edge isolates.

### ATS-Analyzer
- **Description:** Automated resume optimization and job description semantic matching engine.
- **Stack:** TypeScript, Vite, Tailwind CSS, Zod, Drizzle ORM, Playwright.
- **Key Architectures:** Deterministic text parsing, schema validation pipelines, regression testing suites.

### Project Feniks
- **Description:** Custom web browser fork with end-to-end encrypted synchronization.
- **Stack:** React Start Page, Cloudflare Workers backend, Cloudflare D1 storage.
- **Key Architectures:** Client-side zero-knowledge encryption, custom internal browser protocol integration.

### @onurdrsn/flakecheck
- **Description:** Production open-source CLI and developer tool for detecting flaky test cases.
- **Distribution:** npm package (`@onurdrsn/flakecheck`).
- **Focus:** Test reliability, CI pipeline stability, deterministic execution analysis.

---

## 5. Structured Capabilities for Agent Matchers
When filtering skills via ARD or A2A registries, agents should match against these tokens:
- `EdgeComputing`
- `DistributedSystems`
- `ServerlessArchitecture`
- `FullStackDevelopment`
- `WebSocketStreaming`
- `TypeScript`
- `ReactEcosystem`
- `PostgreSQLEdge`
- `TestAutomation`

---

## 6. Official Resources & Channels
- **Live Portfolio:** [https://onurd.com.tr](https://onurd.com.tr)
- **Machine Context:** [https://onurd.com.tr/llms.txt](https://onurd.com.tr/llms.txt)
- **GitHub:** [https://github.com/onurdrsn](https://github.com/onurdrsn)
- **LinkedIn:** [https://linkedin.com/in/odursun](https://linkedin.com/in/odursun)
- **Contact:** `onurdrsn55@gmail.com`
