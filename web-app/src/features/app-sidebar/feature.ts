import { type ComponentType } from "react";
import { Brain, SparklesIcon } from "lucide-react";

export type FeatureKey = "questionPaper" | "solver";

export type FeatureItem = {
    key: FeatureKey;
    label: string;
    icon: ComponentType<{ className?: string }>;
    to: string;
};

export function getActiveFeature(pathname: string): FeatureKey | undefined {
    const first = pathname.split("/").filter(Boolean)[0];
    switch (first) {
        case "question-paper":
            return "questionPaper";
        case "question-paper-solver":
            return "solver";
        default:
            return undefined;
    }
}

export function isQuestionPaperFeature(feature?: FeatureKey): boolean {
    return feature === "questionPaper";
}

export function isSolverFeature(feature?: FeatureKey): boolean {
    return feature === "solver";
}

export const features: FeatureItem[] = [
    {
        key: "questionPaper",
        label: "AI Paper Generator",
        icon: SparklesIcon,
        to: "/question-paper",
    },
    {
        key: "solver",
        label: "AI Solver",
        icon: Brain,
        to: "/question-paper-solver",
    },
];
