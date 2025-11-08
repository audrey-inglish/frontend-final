# GitHub Copilot Instructions

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, and PgPromise
- Database: PostgreSQL
- Testing: Vitest

## Project Summary
Turn class notes into productive study sessions. Students upload their notes and/or topic lists, and an AI agent guides them through a study session with practice quizzes, flashcards, and evaluations of progress. The study materials and methods adapt based on user performance, emphasizing weak areas and continually quizzing until the agent has determined that a sufficient level of mastery has been reached.

The user can review AI actions (like flashcard generation or grading decisions) and control when to move forward in their study flow.

## Code Style Guidelines
When generating code, please follow these guidelines:

- Teach about what you are doing, explaining each change to a React novice.
- Do not include try/catches where the catch does nothing.
- Use TypeScript's features for type safety.
- Prefer interfaces over types for object shapes.
- Avoid excessive comments.
- Use generics for reusable components and functions.
- Enforce strict typing; avoid 'any' type.
- Extract components and hooks for reusability -- when possible, keep components under 100 lines.
- Use functional components and React hooks.
- Typescript should use semicolons.
- Ask before making architectural changes or choosing between multiple valid approaches.


