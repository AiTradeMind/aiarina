# BACKEND_ARCHITECTURE_DECISION.md
# AIARINA 1.0 Backend Architecture Decision Record

This document evaluates, compares, and establishes the formal backend architectural selection for the enterprise-grade **AIARINA 1.0** trading and research platform.

---

## 1. Why a Unified Express Server is Required

AIARINA 1.0 requires a unified full-stack architecture running a single process (Express + Vite) for several reasons:

1.  **Single-Container Constraints**: Our production runtime operates within a single Cloud Run container. Having separate container environments for the frontend and backend introduces unnecessary deployment overhead, increased latency, and cold-start times. A unified server manages both API requests and static client assets in a single, lightweight node process.
2.  **API Key Encapsulation**: Crucial API keys (such as the Gemini API key and external financial database secrets) must never be exposed to the client browser. Running a unified server enables safe server-to-server calls where secrets are held in memory on the container side and proxy routes validate payloads.
3.  **Vite Middleware Integration**: Conditionally running Vite inside our Express development flow ensures a rapid, zero-lag developer experience with hot-swapping frontend capabilities. In production, the server serves static compiled files without needing a secondary web server like Nginx, maintaining architectural simplicity.
4.  **WebSocket and State Sychronization**: Financial dashboard setups require rapid, stateful updates. A unified server simplifies holding safe in-memory session states, rate-limiting rules, and potential WebSocket connections within a predictable runtime context.

---

## 2. Comparison of Backend Architectures

| Parameter | Next.js API Routes (Serverless) | Express (Traditional Monolith) | Fastify (Modern High-Performance) |
| :--- | :--- | :--- | :--- |
| **Execution Model** | Serverless functions (FaaS) or Edge runtime | Persistent Node.js event-loop process | Persistent Node.js process with schema validation |
| **Startup Overhead** | High cold starts in serverless contexts | Extremely low persistent overhead | Extremely low persistent overhead |
| **State Persistence** | Stateless (requires external state/session cache) | State-capable (supports local memory pools, WebSockets) | State-capable (supports local memory pools, WebSockets) |
| **Ecosystem & Libraries** | Heavy framework-specific integration | Unrivaled middleware ecosystem (npm) | Growing, optimized plugin ecosystem |
| **Performance** | Medium (gated by cold-starts & route wake-ups) | High (stable, predictable event-loop) | Extremely High (optimized JSON serialization) |
| **Vite Integration** | Extremely complex (prefers proprietary builder) | Native (trivial to mount Vite dev middleware) | Native (requires specialized wrapper plugins) |

### Next.js API Routes
*   **Advantages**: Excellent for pure serverless deploys; automated code splitting and deployment grouping.
*   **Disadvantages**: Severe serverless cold-starts on Render; problematic for holding long-lived WebSocket sessions; difficult to decouple or bundle into a single self-contained server-side build pipeline (`server.cjs`).

### Express
*   **Advantages**: Ubiquitous standard in the Node.js ecosystem; simple to configure; effortless Vite middleware integration; excellent with standard CJS and ESM code generators; easily bundled via `esbuild`.
*   **Disadvantages**: Traditional routing overhead is slightly higher than modern high-performance frameworks; lacks out-of-the-box JSON schema enforcement.

### Fastify
*   **Advantages**: Up to 2x faster than Express on raw throughput; built-in schema serialization and validation (AJV); highly modular plugin architecture.
*   **Disadvantages**: Slightly steeper learning curve; smaller middleware community compared to Express; trickier integration with certain legacy frontend development middlewares.

---

## 3. Recommended Backend Architecture: Express + Vite Middleware

We recommend a **Unified Express Backend Server** for the AIARINA 1.0 production build running on Render. 

### Justification and Reasons

1.  **Direct Compatibility with Render**: Render Web Services are persistent container processes, not FaaS serverless nodes. Next.js serverless functions would run as a bloated, continuous server process on Render, wasting compute overhead. Express is natively designed for continuous execution on lightweight persistent Linux environments.
2.  **Optimal Development-Production Alignment**: By pairing Express with Vite’s middleware mode, our development environment runs exactly the same Express process as our production environment. Only the asset-serving path transitions from hot-swapped runtime compilation to static `/dist` serving.
3.  **Risk Mitigation & Packaging**: Express integrates seamlessly with our pre-configured `esbuild` bundling pipeline. Esbuild can package our entire Express server into a single `/dist/server.cjs` file, stripping out-of-bound types, bypassing ES Module path compilation bugs, and reducing continuous filesystem read latency.

### Advantages
*   **Ultra-low Complexity**: Extremely simple routing declarations that are easy to maintain, refactor, and review.
*   **Massive Community Support**: Easy access to mature libraries for authentication, database pooling, rate-limiting, and telemetry validation.
*   **Robust Session Management**: Easily handles stateful memory logic, local simulation walks, and fast historical trading calculations.

### Disadvantages
*   **Raw Throughput**: Marginally slower execution times than Fastify in raw routing benchmarks (though negligible for AIARINA’s current throughput requirements).
*   **Manual Validation**: Requires developer discipline to write explicit payload validators (unlike Fastify's schema-driven AJV bindings).

### Performance & Scalability
*   Express easily handles thousands of concurrent requests in standard container profiles when DB connections are pooled correctly.
*   Scales horizontally on Render by adding auto-scaling instances behind their managed load balancer without changing a single line of backend logic.

### Long-term Maintenance
*   Express is the most stable and backward-compatible framework in the JavaScript world. Upgrades are seamless and present almost no risk of breaking changes, ensuring low architectural maintenance costs over a multi-year project lifespan.

---

This is the recommended backend architecture for AIARINA 1.0.
