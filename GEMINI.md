# GEMINI.md - Project Context & Guidelines

## 1. Stack & Scope
Tauri (Rust) + React/Next.js + SQLite (SQLCipher) + Web Speech API / Gemini API.

## 2. Token Conservation
- Use Micro-Diffs ONLY.
- Respect .antigravityignore.
- Do not rewrite whole files.

## 3. Standards
- Format PKR currency cleanly.
- Keep SQLCipher encryption keys inside Rust backend via Windows Credential Manager.
- All core database/billing features must work 100% offline.
