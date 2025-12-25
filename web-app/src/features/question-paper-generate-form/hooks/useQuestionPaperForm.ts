import { useCallback } from "react";
import { create } from "zustand";
import {
  FormData,
  formDataSchema,
  detailsStepSchema,
  topicsStepSchema,
  questionsStepSchema,
} from "../schema";

export type FormStep = "details" | "topics" | "questions";

interface FormStore {
  data: Partial<FormData>;
  currentStep: FormStep;

  // Actions
  updateData: (updates: Partial<FormData>) => void;
  setStep: (step: FormStep) => void;
  reset: () => void;

  // Validation state
  isStepValid: (step: FormStep) => boolean;
  canAdvanceToStep: (step: FormStep) => boolean;
}

const initialFormData: Partial<FormData> = {
  course: "",
  audience: "",

  topics: [],
  questionPatterns: [],
  uploadedFiles: [],
  mediaIds: [],
};

export const useFormStore = create<FormStore>()((set, get) => ({
  data: initialFormData,
  currentStep: "details",

  updateData: (updates) => {
    set((state) => ({
      data: { ...state.data, ...updates },
    }));
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  reset: () => {
    set({
      data: initialFormData,
      currentStep: "details",
    });
  },

  isStepValid: (step) => {
    const data = get().data;

    switch (step) {
      case "details":
        return detailsStepSchema.safeParse(data).success;
      case "topics":
        return topicsStepSchema.safeParse(data).success;
      case "questions":
        return questionsStepSchema.safeParse(data).success;
      default:
        return false;
    }
  },

  canAdvanceToStep: (targetStep) => {
    const steps: FormStep[] = ["details", "topics", "questions"];
    const targetIndex = steps.indexOf(targetStep);

    if (targetIndex === -1) return false;

    // Check if all previous steps are valid
    for (let i = 0; i < targetIndex; i++) {
      if (!get().isStepValid(steps[i])) {
        return false;
      }
    }

    return true;
  },
}));

export function useQuestionPaperForm() {
  const store = useFormStore();

  const goToNextStep = useCallback(() => {
    const steps: FormStep[] = ["details", "topics", "questions"];
    const currentIndex = steps.indexOf(store.currentStep);
    const nextStep = steps[currentIndex + 1];

    if (nextStep && store.canAdvanceToStep(nextStep)) {
      store.setStep(nextStep);
    }
  }, [store]);

  const goToPrevStep = useCallback(() => {
    const steps: FormStep[] = ["details", "topics", "questions"];
    const currentIndex = steps.indexOf(store.currentStep);
    const prevStep = steps[currentIndex - 1];

    if (prevStep) {
      store.setStep(prevStep);
    }
  }, [store]);

  const goToStep = useCallback(
    (step: FormStep) => {
      if (store.canAdvanceToStep(step)) {
        store.setStep(step);
      }
    },
    [store],
  );

  return {
    // State
    formData: store.data,
    currentStep: store.currentStep,

    // Actions
    updateData: store.updateData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    reset: store.reset,

    // Validation
    isStepValid: store.isStepValid,
    canAdvanceToStep: store.canAdvanceToStep,
    isFormComplete: formDataSchema.safeParse(store.data).success,
  };
}
