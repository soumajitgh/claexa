import React, { useState } from "react";
import { FilePenLine, LayoutGrid } from "lucide-react";
import { QuestionPaperNavigatorPanel } from "./PaperNavigatorPanel";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StudioVerticalTabProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const QuestionPaperStudioVerticalTab: React.FC<StudioVerticalTabProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col w-16 bg-muted p-2 space-y-1 h-screen ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          title={tab.label}
          className={`
            flex items-center justify-center w-full aspect-square p-2 text-sm font-medium rounded-md 
            transition-colors duration-150 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
            ${
              tab.id === activeTabId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }
          `}
        >
          {tab.icon && (
            <span className="flex items-center justify-center">
              {tab.icon}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default function StudioVerticalTabComponent() {
  const [currentTabId, setCurrentTabId] = useState<string>("navigation");

  const tabsConfig: TabItem[] = [
    {
      id: "navigation",
      label: "Navigation",
      icon: <LayoutGrid className="size-5" />,
    },
    {
      id: "assignment",
      label: "Assignment",
      icon: <FilePenLine className="size-5" />,
    },
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentTabId(tabId);
  };

  return (
    <div className="w-full flex items-start justify-start">
      <QuestionPaperStudioVerticalTab
        tabs={tabsConfig}
        activeTabId={currentTabId}
        onTabChange={handleTabChange}
      />

      <div className="grow w-full max-w-4xl flex items-start justify-center border p-4 min-h-[200px] h-screen">
        {currentTabId === "navigation" && <QuestionPaperNavigatorPanel />}
        {currentTabId === "assignment" && (
          <div className="text-center">
            <p>Assignment Content Area</p>
          </div>
        )}
      </div>
    </div>
  );
}
