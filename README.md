# Ops Assist

Ops Assist is an AI-powered manufacturing troubleshooting assistant built for the **DEV.to Gemma 4 Challenge**.

## Overview

Ops Assist helps factory operators and frontline technicians diagnose machine problems quickly by turning raw issue descriptions into structured troubleshooting guidance.

## Hero

From symptom to action plan in one workflow: Ops Assist uses Gemma 4 reasoning to analyze a production issue, identify likely causes, and return practical, safety-aware next steps in a structured format.

## Screenshots

> Add screenshots before submission.

- `docs/screenshots/01-home.png` (placeholder)
- `docs/screenshots/02-analysis-result.png` (placeholder)
- `docs/screenshots/03-mobile-view.png` (placeholder)

## Why this project was built

Manufacturing downtime is expensive, and operators often need clear guidance fast.

This project was built to:
- reduce time-to-diagnosis for common issues,
- provide consistent troubleshooting support for newer operators,
- demonstrate how open model reasoning can be applied in industrial workflows,
- showcase a practical Gemma 4 integration for the challenge.

## Features

- AI-assisted machine issue analysis
- Reasoning-driven troubleshooting workflow
- Structured JSON outputs for predictable UI rendering
- Actionable recommendations with escalation context
- Safety-conscious guidance framing

## Technical stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** CSS (global styles)
- **Model access:** Gemini API with Gemma model selection via environment variables

## Gemma 4 integration details

Ops Assist sends a troubleshooting prompt to the model API and expects a structured response that can be rendered directly in the app.

### Model choice and rationale

The default model is:

- `gemma-4-26b-a4b-it`

This model was selected for:

- **Reasoning-heavy troubleshooting workflow:** Better at multi-step diagnosis than lightweight baseline models.
- **Structured JSON output reliability:** Supports consistent response formatting for UI rendering.
- **Balanced speed vs reasoning quality:** Fast enough for interactive use while maintaining useful depth.

## Architecture overview

High-level request flow:

1. User enters machine issue details in the frontend.
2. Next.js API route receives the request.
3. The backend prompt layer requests structured troubleshooting output from Gemma 4.
4. JSON response is returned to the UI.
5. UI presents likely causes, next actions, and escalation/safety notes.

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and set your key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
```

### 3) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## .env.example usage

`.env.example` intentionally contains only required keys so contributors can bootstrap quickly without guessing variable names.

## Environment variables

- `GEMINI_API_KEY` — API key used to call the model endpoint.
- `GEMMA_MODEL` — model id used for troubleshooting generation (default: `gemma-4-26b-a4b-it`).

## Safety disclaimer

Ops Assist provides AI-generated guidance for operational support and learning purposes.
It is **not** a replacement for plant SOPs, lockout/tagout requirements, OEM documentation, or certified engineering judgment.
Always follow site safety policies and escalate uncertain conditions.

## Future improvements

- Add retrieval-augmented context from machine manuals
- Add operator role-based response tailoring
- Add telemetry-aware troubleshooting hints
- Improve confidence scoring and traceable reasoning summaries
- Add multilingual support for frontline teams

## DEV challenge note

This repository is submitted as part of the **DEV.to Gemma 4 Challenge**:
https://dev.to/challenges/google-gemma-2026-05-06

## License

MIT (see `LICENSE` if included in this repository).
