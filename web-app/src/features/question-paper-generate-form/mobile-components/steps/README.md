# Mobile Steps Architecture

This directory contains the mobile-specific presentation components for the Question Paper Generation flow.

They intentionally remain **dumb** (pure presentational) and rely on the shared Zustand store + validation logic implemented for the desktop form in `hooks/useQuestionPaperForm`.

Mapping:
- `DetailsStep` -> desktop `details` step
- `CustomizeStep` -> combines desktop `topics` + `questions` logical steps
- `ReviewStep` -> lightweight summary using the current aggregated form state

The mobile wrapper (`MobileQuestionPaperForm`) converts the underlying logical steps into a 3-step UX while preserving validation rules.

If you introduce additional logical steps (e.g., AI configuration), add them to the store and decide whether they form a new mobile step or belong in `CustomizeStep`.
