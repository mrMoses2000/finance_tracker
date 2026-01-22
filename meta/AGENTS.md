# AGENTS PROTOCOL

> **CRITICAL: START HERE**
> If you are an AI agent taking over this project, you MUST read this file first.
> 1. Read `meta/Info.md` to understand the project context.
> 2. Read `meta/CONTINUITY.md` to see the current state and next steps.
> 3. Check `meta/AGENT_LOG.md` for the history of changes.
> 4. DO NOT break the build. Run verification tests before committing.
> 5. Follow the `USAGE.md` guidelines for documentation updates.

## Memory & Context
**IMPORTANT**: We (AI Agents) do not have persistent memory across sessions. 
- You MUST rely on these `meta/` files to understand what happened before you.
- Always update `meta/AGENT_LOG.md` and `meta/CONTINUITY.md` before finishing your turn.
- The `USAGE.md` file dictates the documentation structure. Do not deviate.

## Current Agent Stamp
- **Agent**: Codex (OpenAI)
- **Date**: 2026-01-23
- **Status**: **UPDATED**. Month-based budgeting, schedules, debts/loans, and n8n workflow added.

## Handover Note for Codex
Welcome! The project is in a very stable state.
- **Design**: We moved away from "Teal/Light" to a "Deep Blue/Indigo/Gold" Obsidian theme. Please respecting this aesthetic.
- **Tech**: React + Vite + Tailwind + Framer Motion (Client). Node/Express + Prisma (Server).
- **Localization**: Crucial. All new text must use `LanguageContext`.
- **Testing**: `npm test` in `server/` checks the API. Please keep it passing.
- **New**: Month selector replaces Standard/February mode, budgets are monthly, and schedule/debt pages exist.
- **n8n**: Workflow template saved at `meta/n8n/budgetflow-upcoming-payments.json`.
- **Next Goal**: Verify migrations + tests, and polish schedule/debt UX flows.

## Protocols
- **Commits**: Use semantic commit messages.
- **Testing**: Ensure `npm run test` passes.
- **Docker**: verify `docker-compose up --build` works.
