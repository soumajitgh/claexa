# API Layer Documentation

This is the production-ready API layer for the Claexa web application. It features a simple, modular design with co-located types and services for better maintainability.

## Structure

**NEW STRUCTURE (Refactored for better maintainability):**

```
src/api/
├── core/               # Core configuration and utilities
│   ├── client.ts       # Global axios client with auth and error handling
│   ├── endpoints.ts    # Centralized endpoint definitions
│   └── types.ts        # Core API types
├── lib/                # Shared utilities and helpers
│   ├── auth.ts         # Auth helpers with token management
│   └── reactQuery.ts   # React Query configuration
├── types/              # Legacy - only common types remain
│   ├── common/         # Common API types (ApiResponse, errors, etc.)
│   └── auth/           # Auth types (for backward compatibility)
├── account.ts          # Account types + service (combined)
├── media.ts            # Media types + service (combined)
├── organization.ts     # Organization types + service (combined)
├── question-paper.ts   # Question paper types + service (combined)
├── datamuse.ts         # Datamuse types + service (combined)
├── question-solver.ts  # Question solver types + service (combined)
├── auth.ts             # Auth types (Firebase wrapper)
└── index.ts            # Main API exports
```

## Why This Structure?

**Co-location Benefits:**

- ✅ Types and services are in the same file
- ✅ Better maintainability - one file per domain
- ✅ Easier to understand and modify
- ✅ Import both types and services from one place
- ✅ Reduced navigation between folders

**Before:**

```typescript
import { UserResponse } from "@/api/types/account";
import { accountService } from "@/api/modules/account";
```

**After:**

```typescript
import { UserResponse, accountService } from "@/api/account";
```

## Usage

### Basic Usage

```typescript
import { api } from "@/api";

// Use the API services directly
const userProfile = await api.account.getMe();
const questionPapers = await api.questionPapers.getAll();
```

### Individual Service Imports

```typescript
import { accountService, questionPaperService } from "@/api";

// Use individual services
const userProfile = await accountService.getMe();
const questionPapers = await questionPaperService.getAll();
```

### Service Modules

Each service module provides a clean interface for its domain:

- **Account**: User profile, usage statistics, credit management
- **Media**: File upload with presigned URLs, download URL caching
- **Question Papers**: CRUD operations, AI generation, export functionality
- **Organization**: Member management, invitations
- **Payment**: Order creation, payment history
- **Question Solver**: PDF processing and solution generation
- **Datamuse**: External word suggestion API

## Key Features

1. **Global Axios Client**: Single axios instance with automatic auth and error handling
2. **Authentication**: Automatic Firebase auth token injection
3. **Error Handling**: Centralized error interception and formatting
4. **Caching**: Smart caching for download URLs with TTL
5. **Type Safety**: Full TypeScript support with proper naming conventions
6. **Modular Design**: Clean separation of concerns by feature
7. **Simple API**: Direct service imports, no factory functions needed
8. **Organized Types**: Proper `@types` folder structure with descriptive file names

## Migration from Old API

The old API files have been removed. The new structure provides the same functionality with a simpler, cleaner design.

Key improvements:

- Simple service objects instead of factory functions
- Global axios client eliminates parameter passing
- Better error handling and type safety
- Centralized endpoint management
- Improved caching mechanisms
- Modular architecture for better maintainability
- Proper TypeScript naming conventions with `@types` folder
- Organized type files by domain and functionality
