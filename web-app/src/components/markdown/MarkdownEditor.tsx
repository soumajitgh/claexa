import React, { useEffect, useRef, useState } from "react";

// Declare OverType global type
declare global {
  interface Window {
    OverType: new (selector: string) => void;
  }
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  height?: number;
  preview?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  height = 200,
  preview = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isOverTypeInitialized, setIsOverTypeInitialized] = useState(false);

  // Initialize OverType when component mounts
  useEffect(() => {
    if (window.OverType && editorRef.current && !isOverTypeInitialized) {
      try {
        // Wait for DOM to be ready
        const timer = setTimeout(() => {
          if (editorRef.current) {
            // Create a unique class name for this editor instance
            const editorId = `overtype-editor-${Date.now()}`;
            editorRef.current.className = `editor ${editorId}`;

            // Initialize OverType with the specific editor
            new window.OverType(`.${editorId}`);
            setIsOverTypeInitialized(true);
          }
        }, 100);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Failed to initialize OverType:", error);
        // Show error state if OverType fails
        setIsOverTypeInitialized(false);
      }
    }
  }, [isOverTypeInitialized]);

  // Show loading state while OverType initializes
  if (!isOverTypeInitialized) {
    return (
      <div className="overtype-markdown-editor">
        <div
          className="editor"
          style={{
            minHeight: height,
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            outline: "none",
            backgroundColor: "#f8fafc",
            color: "#64748b",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading editor...
        </div>
      </div>
    );
  }

  // OverType editor
  return (
    <div className="overtype-markdown-editor">
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: height,
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          padding: "12px",
          fontSize: "14px",
          lineHeight: "1.5",
          outline: "none",
          backgroundColor: "#ffffff",
          color: "#1a202c",
          transition: "border-color 0.2s ease",
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        }}
        onInput={(e) => {
          const newValue = e.currentTarget.textContent || "";
          onChange(newValue);
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.boxShadow = "none";
        }}
        data-placeholder={placeholder || "Enter text as markdown..."}
      />
      {preview && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">Preview:</div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: value.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      )}
    </div>
  );
};
