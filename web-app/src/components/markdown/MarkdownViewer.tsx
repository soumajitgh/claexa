import React from "react";
import {
  sharedRehypePlugins,
  sharedRemarkPlugins,
} from "@/components/markdown/config.ts";
import MDEditor from "@uiw/react-md-editor";

interface MarkdownViewerProps {
  source: string | undefined;
  style?: React.CSSProperties;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  source,
  style,
}) => {
  return (
    // TODO: Make data-color-mode dynamic based on app theme
    <div data-color-mode="light" className="font-sans">
      <MDEditor.Markdown
        source={source}
        style={style}
        remarkPlugins={sharedRemarkPlugins}
        rehypePlugins={sharedRehypePlugins}
      />
    </div>
  );
};
