import hero from "@/assets/qp-gen-page.png";
import { Separator } from "@/components/ui/separator";
import GenerateQuestionPaperForm from "@/features/question-paper-generate-form";
import { MobileQuestionPaperForm } from "@/features/question-paper-generate-form/mobile-components/index";
import { useSearchParams } from "react-router";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";

export default function QuestionPaperGenerateView() {
  const [params] = useSearchParams();
  const isSolver = params.get("mode") === "solver";
  const heading = isSolver
    ? "Question Paper Solver"
    : "Question Paper Generator";
  const subtitle = isSolver
    ? "Solve & analyze problems intelligently"
    : "Create a new question paper in 3 steps";
  const { isMobile, isTablet } = useDeviceBreakpoint();

  // Mobile/tablet: render optimized single-panel stepper variant. Desktop: full multi-column stepper.
  if (isMobile || isTablet) {
    return <MobileQuestionPaperForm heading={heading} solverMode={isSolver} />;
  }
  return (
    <div className="w-full">
      <div className="container max-w-6xl mx-auto flex items-center justify-between gap-6 pt-10 px-6">
        <div>
          <h1 className="xl:text-3xl text-2xl font-semibold">{heading}</h1>
          <p className="text-muted-foreground xl:text-base text-sm">
            {subtitle}
          </p>
        </div>
        <img src={hero} alt="Illustration" className="max-h-44" />
      </div>
      <Separator />
      <div className="w-full pt-10">
        <GenerateQuestionPaperForm />
      </div>
    </div>
  );
}
