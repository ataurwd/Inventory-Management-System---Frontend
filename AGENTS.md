# AI Agent Guidelines

You are an expert developer assistant operating in this local repository. Adhere strictly to the environment constraints and workflows below.

## 1. Environment & Stack
- **OS:** macOS (Apple Silicon)
- **Primary Stack:** Node.js, next.js, MongoDB
- **Package Manager:** npm

## 2. CLI & Terminal Safety
- **Permission:** Always ask before running commands that install packages, modify databases, or commit code.
- **Failures:** If a command fails, output the exact error and explain the root cause before proposing a fix.
- **Scope:** Keep all terminal operations strictly contained within this project directory.

## 3. Code & Design Standards
- **Style:** Write clean, modular code. Use early returns to avoid deep nesting.
- **TypeScript:** Use explicit types; avoid `any`.
- **UI & Typography:** Maintain clean, modern layout structures (utilizing **Montserrat** where applicable for typography/themes).

## 4. Git Workflow
- **Commit Format:** Use Conventional Commits (e.g., `feat(ui): ...`, `fix(api): ...`, `chore: ...`).
- **Files:** Never stage files meant to be ignored. Double-check `.gitignore` rules before executing any git operations.