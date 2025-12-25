import React, { useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { FileText, ChevronRight, Clock, Search } from "lucide-react";
import { questionPaperService } from "@/api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatRelativeOrDate, formatCreatedDateTime } from "@/lib/date-utils";
import type { QuestionPaperListResponse } from "@/api/question-paper";

// Card Component
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div
    className={cn(
      "rounded-xl border bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

// Header Component
interface HistoryHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <motion.header
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur border-b px-2 py-4"
    >
      <div className="flex items-center gap-1 mb-4">
        <Link
          to="/"
          aria-label="Back to dashboard"
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-accent transition-colors active:scale-95 shrink-0"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl">Previously Generated</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search papers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>
    </motion.header>
  );
};

// Paper Card Component
interface PaperCardProps {
  paper: QuestionPaperListResponse;
  index: number;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/mobile/question-paper/studio/${paper.id}`}
        role="listitem"
        aria-label={`Open ${paper.name}`}
        className="block group"
      >
        <Card className="p-3.5 pl-3 flex items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 relative overflow-hidden">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium leading-tight truncate">
              {paper.name}
            </p>
            {paper.createdAt && (
              <div
                className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"
                title={formatCreatedDateTime(paper.createdAt)}
              >
                <Clock className="h-3 w-3" />
                <span className="whitespace-nowrap">
                  {formatRelativeOrDate(paper.createdAt)}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </Card>
      </Link>
    </motion.div>
  );
};

// Loading State Component
const LoadingState: React.FC = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="h-16 rounded-xl border bg-muted/40 animate-pulse"
        />
      ))}
    </div>
  );
};

// Error State Component
const ErrorState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 text-sm text-destructive flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Failed to load papers. Please try again.
      </Card>
    </motion.div>
  );
};

// Empty State Component
const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
          <FileText className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-sm">No papers yet</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your question papers will appear here.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// No Search Results Component
const NoSearchResults: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 flex flex-col items-center text-center gap-3">
        <Search className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">No results found</p>
          <p className="text-xs text-muted-foreground">
            Try a different search term
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// Main Component
export const MobileHistoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Query for all papers (no pagination)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-question-papers"],
    queryFn: () => questionPaperService.getAll({ pageParam: 0, limit: 1000 }),
  });

  const allPapers = data?.data ?? [];

  // Filter papers based on search query
  const filteredPapers = allPapers.filter((paper) =>
    paper.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]"
      role="main"
    >
      <HistoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 px-2 pb-24 pt-4 overflow-y-auto">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-3" role="list">
            {/* Loading State */}
            {isLoading && <LoadingState />}

            {/* Error State */}
            {isError && <ErrorState />}

            {/* Empty State */}
            {!isLoading && !isError && allPapers.length === 0 && <EmptyState />}

            {/* No Search Results */}
            {!isLoading &&
              !isError &&
              allPapers.length > 0 &&
              filteredPapers.length === 0 && <NoSearchResults />}

            {/* Papers List */}
            {filteredPapers.map((paper, index) => (
              <PaperCard key={paper.id} paper={paper} index={index} />
            ))}
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default MobileHistoryView;
