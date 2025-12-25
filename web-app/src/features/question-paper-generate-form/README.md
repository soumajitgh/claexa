# Question Paper Form - Redesigned Architecture

## Overview

This feature has been completely redesigned following senior React engineering principles:

- **Single Entry Point**: `QuestionPaperForm.tsx` serves as the main component
- **Minimal Components**: Reduced from 16+ files to 4 focused components
- **Proper Separation of Concerns**: Clear boundaries between UI, state, and business logic
- **Maintainable State Management**: Centralized form state with Zustand
- **Type Safety**: Comprehensive TypeScript types throughout

## Architecture

```
QuestionPaperForm/ (Entry point)
├── components/
│   ├── FormDetailsSection.tsx    # Course details step
│   ├── FormTopicsSection.tsx     # Topics selection step
│   ├── FormQuestionsSection.tsx  # Question patterns step
│   └── FormFileUploadSection.tsx # File upload integration
├── hooks/
│   └── useQuestionPaperForm.ts   # Centralized form logic
├── types.ts                      # Type definitions
├── schema.ts                     # Validation schemas
├── constants.ts                  # Static data
└── index.ts                      # Public API exports
```

## Key Improvements

### 1. **Single Source of Truth**

- Centralized state management with `useQuestionPaperForm` hook
- Consistent data flow through all components
- Automatic persistence to localStorage

### 2. **Simplified File Upload**

- Integrated the new `file-upload.tsx` component
- Consistent upload behavior across the application
- Progress tracking and error handling

### 3. **Better UX**

- Step-by-step wizard with clear navigation
- Real-time validation feedback
- Auto-save functionality
- Responsive design

### 4. **Developer Experience**

- Clear component boundaries
- Comprehensive TypeScript types
- Consistent naming conventions
- Easy to test and maintain

## Usage

```tsx
import QuestionPaperForm from "@/features/question-paper-generate-form";

function App() {
  return <QuestionPaperForm />;
}
```

## Component Responsibilities

### `QuestionPaperForm` (Main Component)

- Orchestrates the multi-step form
- Handles navigation between steps
- Manages overall form submission
- Provides step validation indicators

### `FormDetailsSection`

- Course and institution details
- School-specific fields (board, class) with conditional rendering
- Real-time field validation

### `FormTopicsSection`

- Topic management with autocomplete
- Dynamic suggestions based on course
- Topic addition/removal
- Visual topic chips

### `FormQuestionsSection`

- Question pattern definition
- Pattern editing and deletion
- Marks and difficulty configuration
- Bloom's taxonomy integration

### `FormFileUploadSection`

- File upload with drag & drop
- Progress tracking
- File type validation
- Upload error handling

## State Management

The form uses a centralized Zustand store that:

- Persists data across sessions
- Validates each step independently
- Manages step progression logic
- Handles form reset functionality

## Migration from Legacy

The old components have been moved to `_legacy/` folder for reference.
Key changes:

- `GenerateQuestionPaperForm` → `QuestionPaperForm`
- Multiple upload components → `FormFileUploadSection`
- Complex stepper logic → Simplified `useQuestionPaperForm`
- Scattered state → Centralized store
