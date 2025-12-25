# Question Paper Entities Documentation

This document provides comprehensive documentation for all entities in the question-paper module.

## Overview

The question-paper module consists of 5 main entities that work together to create a hierarchical structure for managing question papers, questions, sub-questions, options, and images.

## Entity Relationships

```
QuestionPaper (1) ── (N) Question (1) ── (N) SubQuestion
     │                        │                    │
     │                        │                    │
     │                        ├── (N) Option       ├── (N) Option
     │                        │
     └── (N) QuestionImage ───┘
```

## Entities

### 1. QuestionPaper Entity

**File:** `question-paper.entity.ts`

The root entity that represents a complete question paper.

#### Properties

| Property      | Type     | Description                       | Constraints         |
| ------------- | -------- | --------------------------------- | ------------------- |
| `id`          | `string` | Unique identifier                 | Primary key, UUID   |
| `createdAt`   | `Date`   | Creation timestamp                | Auto-generated      |
| `updatedAt`   | `Date`   | Last update timestamp             | Auto-generated      |
| `name`        | `string` | Name of the question paper        | Required            |
| `description` | `string` | Description of the question paper | Optional (nullable) |

#### Relationships

- **Owner**: `ManyToOne` relationship with `User` entity
  - Each question paper belongs to one user (owner)
  - Required relationship (non-nullable)

- **Questions**: `OneToMany` relationship with `Question` entity
  - One question paper can have multiple questions
  - Cascade enabled for automatic deletion
  - Required relationship (non-nullable)

#### Usage Example

```typescript
const questionPaper = new QuestionPaper();
questionPaper.name = 'Mathematics Final Exam';
questionPaper.description =
  'Comprehensive mathematics exam covering algebra and calculus';
questionPaper.owner = user;
```

### 2. Question Entity

**File:** `question.entity.ts`

Represents individual questions within a question paper.

#### Properties

| Property | Type     | Description                         | Constraints       |
| -------- | -------- | ----------------------------------- | ----------------- |
| `id`     | `string` | Unique identifier                   | Primary key, UUID |
| `text`   | `string` | Question text content               | Required          |
| `index`  | `number` | Order/position of question in paper | Required          |
| `marks`  | `number` | Marks allocated for this question   | Required          |

#### Relationships

- **QuestionPaper**: `ManyToOne` relationship with `QuestionPaper` entity
  - Each question belongs to one question paper
  - Required relationship (non-nullable)

- **Options**: `OneToMany` relationship with `Option` entity
  - One question can have multiple options (for MCQ questions)
  - Cascade enabled for automatic deletion
  - Optional relationship (nullable)

- **SubQuestions**: `OneToMany` relationship with `SubQuestion` entity
  - One question can have multiple sub-questions
  - Cascade enabled for automatic deletion
  - Optional relationship (nullable)

- **Images**: `OneToMany` relationship with `QuestionImage` entity
  - One question can have multiple images
  - Cascade enabled for automatic deletion
  - Optional relationship (nullable)

#### Usage Example

```typescript
const question = new Question();
question.text = 'What is the derivative of x²?';
question.index = 1;
question.marks = 5;
question.questionPaper = questionPaper;
```

### 3. SubQuestion Entity

**File:** `sub-question.entity.ts`

Represents sub-questions that belong to a main question (for complex questions with multiple parts).

#### Properties

| Property | Type     | Description                           | Constraints       |
| -------- | -------- | ------------------------------------- | ----------------- |
| `id`     | `string` | Unique identifier                     | Primary key, UUID |
| `text`   | `string` | Sub-question text content             | Required          |
| `index`  | `number` | Order/position of sub-question        | Required          |
| `marks`  | `number` | Marks allocated for this sub-question | Required          |

#### Relationships

- **ParentQuestion**: `ManyToOne` relationship with `Question` entity
  - Each sub-question belongs to one parent question
  - Required relationship (non-nullable)

- **Options**: `OneToMany` relationship with `Option` entity
  - One sub-question can have multiple options
  - Cascade enabled for automatic deletion
  - Optional relationship (nullable)

#### Usage Example

```typescript
const subQuestion = new SubQuestion();
subQuestion.text = 'Find the critical points';
subQuestion.index = 1;
subQuestion.marks = 3;
subQuestion.parentQuestion = question;
```

### 4. Option Entity

**File:** `option.entity.ts`

Represents answer options for questions or sub-questions (typically for multiple choice questions).

#### Properties

| Property | Type     | Description              | Constraints       |
| -------- | -------- | ------------------------ | ----------------- |
| `id`     | `string` | Unique identifier        | Primary key, UUID |
| `text`   | `string` | Option text content      | Required          |
| `index`  | `number` | Order/position of option | Required          |

#### Relationships

- **Question**: `ManyToOne` relationship with `Question` entity
  - Each option can belong to one question
  - Optional relationship (nullable)

- **SubQuestion**: `ManyToOne` relationship with `SubQuestion` entity
  - Each option can belong to one sub-question
  - Optional relationship (nullable)

**Note**: An option can belong to either a question OR a sub-question, but not both.

#### Usage Example

```typescript
const option = new Option();
option.text = '2x';
option.index = 1;
option.question = question; // or option.subQuestion = subQuestion;
```

### 5. QuestionImage Entity

**File:** `question-image.entity.ts`

Represents images associated with questions (for questions that include diagrams, charts, etc.).

#### Properties

| Property | Type     | Description       | Constraints       |
| -------- | -------- | ----------------- | ----------------- |
| `id`     | `string` | Unique identifier | Primary key, UUID |

#### Relationships

- **Media**: `OneToOne` relationship with `Media` entity
  - Each question image has one associated media file
  - Cascade enabled for automatic deletion
  - Eager loading enabled
  - Required relationship (non-nullable)

- **Question**: `ManyToOne` relationship with `Question` entity
  - Each question image belongs to one question
  - Required relationship (non-nullable)

#### Usage Example

```typescript
const questionImage = new QuestionImage();
questionImage.media = mediaEntity;
questionImage.question = question;
```

## Database Schema

### QuestionPaper Table

```sql
CREATE TABLE question_paper (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR NOT NULL,
  description VARCHAR,
  owner_id UUID NOT NULL REFERENCES user(id)
);
```

### Question Table

```sql
CREATE TABLE question (
  id UUID PRIMARY KEY,
  text VARCHAR NOT NULL,
  index INTEGER NOT NULL,
  marks INTEGER NOT NULL,
  question_paper_id UUID NOT NULL REFERENCES question_paper(id)
);
```

### SubQuestion Table

```sql
CREATE TABLE sub_question (
  id UUID PRIMARY KEY,
  text VARCHAR NOT NULL,
  index INTEGER NOT NULL,
  marks INTEGER NOT NULL,
  parent_question_id UUID NOT NULL REFERENCES question(id)
);
```

### Option Table

```sql
CREATE TABLE option (
  id UUID PRIMARY KEY,
  text VARCHAR NOT NULL,
  index INTEGER NOT NULL,
  question_id UUID REFERENCES question(id),
  sub_question_id UUID REFERENCES sub_question(id)
);
```

### QuestionImage Table

```sql
CREATE TABLE question_image (
  id UUID PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES media(id),
  question_id UUID NOT NULL REFERENCES question(id)
);
```

## Best Practices

1. **Cascade Operations**: Use cascade operations carefully, especially for `QuestionPaper` deletion which will cascade to all related entities.

2. **Index Management**: Always maintain proper `index` values for questions, sub-questions, and options to ensure correct ordering.

3. **Media Handling**: When creating question images, ensure the media entity is properly created and linked.

4. **Validation**: Implement proper validation for:
   - Marks allocation (should be positive numbers)
   - Index values (should be sequential and unique within their scope)
   - Text content (should not be empty)

5. **Performance**: Consider indexing frequently queried fields like `question_paper_id`, `parent_question_id`, etc.

## Common Operations

### Creating a Complete Question Paper

```typescript
// 1. Create question paper
const questionPaper = new QuestionPaper();
questionPaper.name = 'Sample Exam';
questionPaper.owner = user;

// 2. Create questions
const question = new Question();
question.text = 'Sample question?';
question.index = 1;
question.marks = 5;
question.questionPaper = questionPaper;

// 3. Create options
const option = new Option();
option.text = 'Sample option';
option.index = 1;
option.question = question;

// 4. Save all entities
await questionPaperRepository.save(questionPaper);
```

### Querying with Relations

```typescript
// Get question paper with all related data
const questionPaper = await questionPaperRepository.findOne({
  where: { id: paperId },
  relations: {
    questions: {
      options: true,
      subQuestions: {
        options: true,
      },
      images: {
        media: true,
      },
    },
  },
});
```
