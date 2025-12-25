import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuestionPaper } from "@/context/question-paper";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/animation/loading.json";
import { Button } from "@/components/ui/button";

export default function NoQuestionSelectedView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { questionPaper, isLoading } = useQuestionPaper();
  const { isMobile } = useDeviceBreakpoint();

  useLayoutEffect(() => {
    // Only auto-redirect on desktop/tablet, not on mobile
    if (
      !isMobile &&
      !isLoading &&
      questionPaper &&
      questionPaper.questions &&
      questionPaper.questions.length > 0
    ) {
      const firstQuestion = questionPaper.questions[0];
      navigate(`/question-paper/studio/${id}/${firstQuestion.id}`, {
        replace: true,
      });
    }
  }, [questionPaper, isLoading, navigate, id, isMobile]);

  // Show loading state while question paper is being fetched
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-32 h-32 mb-4">
          <Lottie animationData={loadingAnimation} loop />
        </div>
        <h2 className="text-lg font-semibold mb-2">Loading Questions...</h2>
        <p className="text-sm text-muted-foreground text-center">
          Please wait while we fetch your question paper.
        </p>
      </div>
    );
  }

  // Show this view only when there are no questions available (desktop/tablet)
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
        <p className="text-muted-foreground mb-6">
          Start building your question paper by adding your first question. You
          can create various types of questions including multiple choice,
          true/false, and fill-in-the-blank.
        </p>
        <Button
          onClick={() => navigate(`/question-paper/studio/${id}/add-question`)}
        >
          Add Your First Question
        </Button>
      </div>
    </div>
  );
}
