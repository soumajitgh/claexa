# Common Features

This directory contains reusable components and features that can be used across the application.

## DatamuseAutocomplete

A Google search-like autocomplete component powered by the Datamuse API.

### Features

- **Real-time suggestions**: Get word suggestions as you type
- **Keyboard navigation**: Use arrow keys to navigate suggestions
- **Debounced search**: Configurable debounce delay to avoid excessive API calls
- **Loading states**: Visual feedback during API requests
- **Accessible**: Full keyboard and screen reader support
- **Customizable**: Configurable max suggestions, debounce delay, and styling

### Usage

```tsx
import { DatamuseAutocomplete } from "@/features/common";

function MyComponent() {
  const [value, setValue] = useState("");

  return (
    <DatamuseAutocomplete
      value={value}
      onChange={setValue}
      onSelect={(selectedValue) => {
        console.log("Selected:", selectedValue);
      }}
      placeholder="Search for words..."
      maxSuggestions={8}
      debounceMs={300}
    />
  );
}
```

### Props

| Prop             | Type                      | Default                 | Description                           |
| ---------------- | ------------------------- | ----------------------- | ------------------------------------- |
| `value`          | `string`                  | `''`                    | Current input value                   |
| `onChange`       | `(value: string) => void` | -                       | Called when input value changes       |
| `onSelect`       | `(value: string) => void` | -                       | Called when a suggestion is selected  |
| `placeholder`    | `string`                  | `'Search for words...'` | Input placeholder text                |
| `className`      | `string`                  | -                       | Additional CSS classes                |
| `disabled`       | `boolean`                 | `false`                 | Whether the input is disabled         |
| `maxSuggestions` | `number`                  | `8`                     | Maximum number of suggestions to show |
| `debounceMs`     | `number`                  | `300`                   | Debounce delay in milliseconds        |

### Keyboard Shortcuts

- **Arrow Down**: Navigate to next suggestion
- **Arrow Up**: Navigate to previous suggestion
- **Enter**: Select current suggestion
- **Escape**: Close suggestions and blur input

### Demo

See `DatamuseAutocompleteDemo` component for a complete example with different configurations.
