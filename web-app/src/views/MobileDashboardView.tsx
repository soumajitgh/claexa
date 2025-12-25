import React from "react";
import { useAuth } from "@/context/auth";
import { getGreetingBasedOnTime } from "@/util/greetings";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import {
  FilePlus2,
  Wand2,
  PlusCircle,
  FileText,
  Bot,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { questionPaperService, QuestionPaperListResponse } from "@/api";
import { motion } from "motion/react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Utility to create a soft gradient primary surface
const primaryGradient =
  "bg-gradient-to-br from-primary via-primary/90 to-primary/80";

// ============ Dashboard Header ============
const DashboardHeader: React.FC<{
  greeting: string;
  name: string;
}> = ({ greeting, name }) => {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
      className="relative px-6 pt-8 pb-6 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)] bg-gradient-to-br from-primary/50 via-transparent to-accent/30" />
      <div className="relative">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {name}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ready to create something new?
          </p>
        </div>
      </div>
    </motion.header>
  );
};

// ============ Quick Action Button ============
const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  to?: string;
  variant?: "primary" | "secondary";
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ icon, label, to, variant = "primary", ariaLabel, onClick }) => {
  const content = (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex-1 h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl p-4 text-[11px] font-medium text-center transition-all border shadow-sm touch-manipulation select-none overflow-hidden",
        variant === "primary"
          ? `${primaryGradient} text-primary-foreground border-primary/40 shadow-md`
          : "bg-muted/70 text-foreground border-border hover:bg-muted"
      )}
      aria-label={ariaLabel || label}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={0}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="h-8 w-8 rounded-md flex items-center justify-center bg-background/20 ring-1 ring-white/10">
          {icon}
        </div>
        <span className="leading-tight max-w-[92%] mx-auto line-clamp-2 break-words tracking-tight">
          {label}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
    </motion.div>
  );

  return to && !onClick ? (
    <Link to={to} aria-label={ariaLabel || label} className="flex-1">
      {content}
    </Link>
  ) : (
    content
  );
};

// ============ Quick Actions Section ============
const QuickActionsSection: React.FC<{
  mode: "paper" | "solver";
}> = ({ mode }) => {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-2 gap-3"
      aria-label="Quick actions"
    >
      <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
        <QuickActionButton
          to="/question-paper"
          icon={<Wand2 className="h-5 w-5" />}
          label="Question Paper Generator"
          ariaLabel="Open Question Paper Generator"
          variant={mode === "paper" ? "primary" : "secondary"}
        />
      </motion.div>
      <motion.div variants={fadeInUp} transition={{ duration: 0.4 }}>
        <QuickActionButton
          icon={<Bot className="h-5 w-5" />}
          label="Question Paper Solver"
          ariaLabel="Question Paper Solver Coming Soon"
          variant={mode === "solver" ? "primary" : "secondary"}
          onClick={(e) => {
            e.preventDefault();
            toast.info("Question Paper Solver is coming soon");
          }}
        />
      </motion.div>
    </motion.section>
  );
};

// ============ Empty State ============
const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center gap-4"
    >
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
        <FilePlus2 className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-sm">No recent papers</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Start by generating your first one.
        </p>
      </div>
      <Button size="sm" className="gap-1" asChild>
        <Link to="/question-paper">
          <PlusCircle className="h-4 w-4" /> New Paper
        </Link>
      </Button>
    </motion.div>
  );
};

// ============ Error State ============
const ErrorState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border bg-card shadow-sm p-6 text-sm text-destructive flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Failed to load papers
    </motion.div>
  );
};

// ============ Loading State ============
const LoadingState: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="h-14 rounded-xl border bg-muted/40 animate-pulse"
        />
      ))}
    </div>
  );
};

// ============ Recent Paper Card ============
const RecentPaperCard: React.FC<{
  paper: QuestionPaperListResponse;
  index: number;
}> = ({ paper, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/mobile/question-paper/studio/${paper.id}`}
        role="listitem"
        aria-label={`Open ${paper.name}`}
        className="block group"
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex items-center gap-3 hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 relative overflow-hidden"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium leading-tight truncate">
              {paper.name}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {paper.totalQuestions}{" "}
              {paper.totalQuestions === 1 ? "question" : "questions"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </Link>
    </motion.div>
  );
};

// ============ Recent Papers Section ============
const RecentPapersSection: React.FC<{
  isLoading: boolean;
  isError: boolean;
  recents: QuestionPaperListResponse[];
  hasMore: boolean;
}> = ({ isLoading, isError, recents, hasMore }) => {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay: 0.2, duration: 0.5 }}
      aria-label="Recent question papers"
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border/60 shadow-sm">
            Recent
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
      <div className="space-y-3" role="list">
        {isLoading && <LoadingState />}
        {isError && <ErrorState />}
        {!isLoading && !isError && recents.length === 0 && <EmptyState />}
        {!isLoading &&
          !isError &&
          recents.map((paper, index) => (
            <RecentPaperCard key={paper.id} paper={paper} index={index} />
          ))}
      </div>

      {/* View All Button */}
      {!isLoading && !isError && hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
            <Link to="/mobile/history">
              View All Papers
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}
    </motion.section>
  );
};

export const MobileDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "solver" ? "solver" : "paper";

  const greeting = getGreetingBasedOnTime();
  const name = currentUser?.profile?.fullName?.split(" ")[0] || "Student";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recent-question-papers"],
    queryFn: () => questionPaperService.getAll({ limit: 5 }), // Fetch 5 to check if there are more
  });

  const allRecents = data?.data ?? [];
  const recents = allRecents.slice(0, 4); // Show only first 4
  const hasMore = allRecents.length > 4; // Check if there are more than 4

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background text-foreground"
      role="main"
    >
      {/* Fixed Header and Quick Actions */}
      <div className="sticky top-0 z-10 bg-background">
        <DashboardHeader greeting={greeting} name={name} />
        <div className="px-6 pb-4">
          <QuickActionsSection mode={mode} />
        </div>
      </div>

      {/* Scrollable Recent Papers Section */}
      <main className="flex-1 overflow-y-auto px-6 pb-8">
        <RecentPapersSection
          isLoading={isLoading}
          isError={isError}
          recents={recents}
          hasMore={hasMore}
        />
      </main>
    </motion.div>
  );
};

export default MobileDashboardView;
