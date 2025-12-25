import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar.tsx";
import { FeatureKey } from "./feature";
import { QuestionPaperHistory } from "./histories/QuestionPaperHistory";
import { SolverHistory } from "./histories/SolverHistory";

export function FeatureHistorySwitch({
  feature,
  isMobile,
  onCloseMobile,
}: {
  feature?: FeatureKey;
  isMobile: boolean;
  onCloseMobile: () => void;
}) {
  if (!feature) return null;
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {feature === "questionPaper" ? (
          <QuestionPaperHistory
            isMobile={isMobile}
            onCloseMobile={onCloseMobile}
          />
        ) : (
          <SolverHistory isMobile={isMobile} onCloseMobile={onCloseMobile} />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
