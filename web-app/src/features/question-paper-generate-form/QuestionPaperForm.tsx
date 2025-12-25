import { useState } from "react";
import { Check, ArrowLeft, ArrowRight, LoaderCircleIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

import { useQuestionPaperForm } from "./hooks/useQuestionPaperForm";
import FormDetailsSection from "./components/FormDetailsSection";
import FormTopicsSection from "./components/FormTopicsSection";
import FormQuestionsSection from "./components/FormQuestionsSection";
import { FormStep } from "./types";
import { api } from "@/api";
import { transformFormDataToAPI } from "./api-transform";

const STEPS = [
  {
    id: "details" as FormStep,
    title: "Course Details & Files",
    description: "Basic course info and uploads",
  },
  {
    id: "topics" as FormStep,
    title: "Topics",
    description: "Select topics to cover",
  },
  {
    id: "questions" as FormStep,
    title: "Question Types",
    description: "Define question patterns",
  },
];

export default function QuestionPaperForm() {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    updateData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    canAdvanceToStep,
    isFormComplete,
    reset,
  } = useQuestionPaperForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

  const handleStepperChange = (value: number) => {
    const nextStep = STEPS[value - 1];
    if (!nextStep) return;

    if (canAdvanceToStep(nextStep.id)) {
      goToStep(nextStep.id);
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    setIsSubmitting(true);
    try {
      // Transform form data to API payload
      const apiPayload = transformFormDataToAPI(formData);

      // Call the AI generation API
      const response = await api.questionPapers.generateWithAI(apiPayload);

      if (response.success) {
        toast.success("Question paper generated successfully!", {
          description: "Redirecting to question paper studio...",
        });

        reset();

        // Navigate to the question paper studio
        navigate(`/question-paper/studio/${response.data.id}`, {
          state: { message: "Question paper generated successfully!" },
        });
      } else {
        toast.error("Generation failed", {
          description: "Unable to generate question paper. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Error generating question paper", {
        description: error instanceof Error ? error.message : "Please check your input and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepSection = (stepId: FormStep) => {
    switch (stepId) {
      case "details":
        return <FormDetailsSection data={formData} onUpdate={updateData} />;

      case "topics":
        return <FormTopicsSection data={formData} onUpdate={updateData} />;

      case "questions":
        return <FormQuestionsSection data={formData} onUpdate={updateData} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <Stepper
        value={currentStepIndex + 1}
        onValueChange={handleStepperChange}
        orientation="vertical"
        className="grid grid-cols-12 gap-2"
        indicators={{
          completed: <Check className="size-4" />,
          loading: <LoaderCircleIcon className="size-4 animate-spin" />,
        }}
      >
        <StepperNav className="col-span-4 overflow-auto h-fit">
          {STEPS.map((step, index) => {
            const canAccess = canAdvanceToStep(step.id);

            return (
              <StepperItem
                key={step.id}
                step={index + 1}
                className="relative items-start not-last:flex-1"
              >
                <StepperTrigger
                  className="items-start pb-12 last:pb-0 gap-2.5"
                  disabled={!canAccess}
                >
                  <StepperIndicator className="data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-gray-500">
                    {index + 1}
                  </StepperIndicator>
                  <div className="mt-0.5 text-left">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </StepperTrigger>
                {index < STEPS.length - 1 && (
                  <StepperSeparator className="absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)] group-data-[state=completed]/step:bg-green-500" />
                )}
              </StepperItem>
            );
          })}
        </StepperNav>

        <StepperPanel className="col-span-8">
          {STEPS.map((step, index) => (
            <StepperContent key={step.id} value={index + 1} className="w-full">
              <div className="space-y-6">{renderStepSection(step.id)}</div>
            </StepperContent>
          ))}

          {/* Constant Navigation Bar */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <Button
              variant="outline"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>

            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={!canAdvanceToStep(STEPS[currentStepIndex + 1].id)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isFormComplete || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Question Paper"
                )}
              </Button>
            )}
          </div>
        </StepperPanel>
      </Stepper>
    </div>
  );
}
