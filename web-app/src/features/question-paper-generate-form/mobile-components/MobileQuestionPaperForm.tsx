import React, { useCallback, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuestionPaperForm } from "../hooks/useQuestionPaperForm";
import { DetailsStep } from "./steps/DetailsStep";
import { TopicsStep } from "./steps/TopicsStep";
import { QuestionsStep } from "./steps/QuestionsStep";
import MobileStepper from "./MobileStepper";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { api } from "@/api";
import { transformFormDataToAPI } from "../api-transform";

const MOBILE_STEPS = [
  { id: "details", label: "Details", subtitle: "Course & context" },
  { id: "topics", label: "Topics", subtitle: "Add coverage areas" },
  { id: "questions", label: "Questions", subtitle: "Define types & marks" },
] as const;
type MobileStepId = (typeof MOBILE_STEPS)[number]["id"];

interface MobileQuestionPaperFormProps {
  className?: string;
  heading?: string;
  solverMode?: boolean;
}

/**
 * MobileQuestionPaperForm
 * -----------------------
 * Reuses the shared Zustand store & validation logic from the desktop form (`useQuestionPaperForm`).
 * This variant maps 1:1 to the logical steps (details, topics, questions) without
 * introducing any duplicate form logic or hard‑coded field lists. Each step is a
 * thin wrapper that simply renders the original desktop section component with
 * mobile spacing. This keeps maintenance centralized: add/change a field once
 * in the desktop component and mobile benefits automatically.
 * Presentation adjustments:
 *   - Compact header + progress bar (MobileStepper)
 *   - Single active panel rendered to minimize DOM weight
 *   - Sticky bottom navigation bar for primary action
 *   - All colors pulled from CSS custom properties (see theme.css)
 */
export const MobileQuestionPaperForm: React.FC<
  MobileQuestionPaperFormProps
> = ({ className, heading, solverMode }) => {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    updateData,
    goToPrevStep,
    goToStep,
    canAdvanceToStep,
    isFormComplete,
  } = useQuestionPaperForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive mobile step index by mapping store step to mobile grouping
  const currentIndex = useMemo(
    () => MOBILE_STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );
  const activeMeta = MOBILE_STEPS[currentIndex];

  const handleChangeStep = useCallback(
    (idx: number) => {
      const target = MOBILE_STEPS[idx];
      if (!target) return;
      const targetId = target.id as MobileStepId;
      if (targetId === "details") return goToStep("details");
      if (targetId === "topics" && canAdvanceToStep("topics"))
        return goToStep("topics");
      if (targetId === "questions" && canAdvanceToStep("questions"))
        return goToStep("questions");
    },
    [canAdvanceToStep, goToStep]
  );

  const handleSubmit = useCallback(async () => {
    if (!isFormComplete) return;
    setIsSubmitting(true);
    try {
      const payload = transformFormDataToAPI(formData);
      const response = await api.questionPapers.generateWithAI(payload);
      if (response.success) {
        navigate(`/mobile/question-paper/studio/${response.data.id}`);
      } else {
        alert("Failed to generate.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating question paper.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormComplete, navigate]);

  const renderMobileSection = () => {
    switch (activeMeta.id as MobileStepId) {
      case "details":
        return <DetailsStep data={formData} onUpdate={updateData} />;
      case "topics":
        return <TopicsStep data={formData} onUpdate={updateData} />;
      case "questions":
        return <QuestionsStep data={formData} onUpdate={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-[var(--background)] text-[var(--foreground)]",
        className
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur border-b px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          {currentIndex > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevStep}
              aria-label="Previous step"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold tracking-tight truncate">
              {heading ||
                (solverMode ? "Question Paper Solver" : "Generate Paper")}
            </h1>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
              {activeMeta?.subtitle}
            </p>
          </div>
        </div>
        <MobileStepper
          current={currentIndex}
          total={MOBILE_STEPS.length}
          labels={MOBILE_STEPS.map((s) => s.label)}
          onStepChange={handleChangeStep}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-6">
        {renderMobileSection()}
      </div>

      {/* Step Action Bar - Fixed Above Bottom Nav */}
      <div className="fixed bottom-[64px] left-0 right-0 px-4 pb-3 pointer-events-none z-40">
        <div className="rounded-2xl border bg-[var(--card)] shadow-lg p-3 flex items-center gap-3 pointer-events-auto">
          <div className="flex-1 text-[11px] text-[var(--muted-foreground)]">
            Step {currentIndex + 1} of {MOBILE_STEPS.length}
          </div>
          {currentIndex < MOBILE_STEPS.length - 1 ? (
            <Button
              size="sm"
              className="rounded-full px-5"
              onClick={() => {
                if (currentStep === "details" && canAdvanceToStep("topics"))
                  return goToStep("topics");
                if (currentStep === "topics" && canAdvanceToStep("questions"))
                  return goToStep("questions");
              }}
              disabled={
                (currentStep === "details" && !canAdvanceToStep("topics")) ||
                (currentStep === "topics" && !canAdvanceToStep("questions"))
              }
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-full px-5"
              onClick={handleSubmit}
              disabled={!isFormComplete || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileQuestionPaperForm;
