import { useState } from "react";
import { useQuestionPaper } from "@/context/question-paper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Download, FileText, FileBadge2, FileCode, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import { api } from "@/api";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  iconColor: string;
  bgColor: string;
  available: boolean;
  disabled?: boolean;
  disabledReason?: string;
  action: () => void;
}

export function ExportButton() {
  const { questionPaper } = useQuestionPaper();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isMobile } = useDeviceBreakpoint();

  const handleDocxExport = async () => {
    if (!questionPaper) return;

    setIsDropdownOpen(false);

    const exportPromise = api.questionPapers
      .exportQuestionPaperDocx(questionPaper.id)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${questionPaper.name}.docx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { filename: `${questionPaper.name}.docx` };
      });

    toast.promise(exportPromise, {
      loading: "Preparing DOCX export...",
      success: (data) => `${data.filename} downloaded successfully!`,
      error: "Failed to export as DOCX. Please try again.",
    });
  };

  const handlePdfExport = async () => {
    if (!questionPaper) return;

    setIsDropdownOpen(false);

    const exportPromise = api.questionPapers
      .exportQuestionPaperPdf(questionPaper.id)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${questionPaper.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { filename: `${questionPaper.name}.pdf` };
      });

    toast.promise(exportPromise, {
      loading: "Preparing PDF export...",
      success: (data) => `${data.filename} downloaded successfully!`,
      error: "Failed to export as PDF. Please try again.",
    });
  };

  const handleComingSoon = (format: string) => {
    toast.info("Feature Coming Soon", {
      description: `Exporting as ${format} is not yet available.`,
    });
  };

  const exportOptions: ExportOption[] = [
    {
      id: "docx",
      name: "Word Document",
      description: "Export as .docx file format",
      icon: FileText,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      available: true,
      action: handleDocxExport,
    },
    {
      id: "pdf",
      name: "PDF Document",
      description: "Export as .pdf file format",
      icon: FileBadge2,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      available: true,
      action: handlePdfExport,
    },
    {
      id: "google-form",
      name: "Google Form",
      description: "Temporarily unavailable",
      icon: Share2,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      available: true,
      disabled: true,
      disabledReason: "Disabled",
      action: () => {},
    },
    {
      id: "markdown",
      name: "Markdown",
      description: "Export as .md file for developers",
      icon: FileCode,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted",
      available: false,
      action: () => handleComingSoon("Markdown"),
    },
  ];

  const availableOptions = exportOptions.filter((option) => option.available);
  const comingSoonOptions = exportOptions.filter((option) => !option.available);

  if (!questionPaper) {
    return (
      <Button
        variant="default"
        size="sm"
        disabled
        className={isMobile ? "p-2" : "gap-2"}
      >
        <Download className="h-4 w-4" />
        {!isMobile && "Export"}
      </Button>
    );
  }

  const renderOption = (option: ExportOption, isComingSoon = false) => {
    const Icon = option.icon;
    const isDisabled = option.disabled || isComingSoon;

    return (
      <DropdownMenuItem
        key={option.id}
        onClick={isDisabled ? undefined : option.action}
        disabled={isDisabled}
        className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
          isDisabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:bg-accent focus:bg-accent"
        } ${isComingSoon ? "hover:opacity-80" : ""}`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${option.bgColor}`}
        >
          <Icon className={`h-5 w-5 ${option.iconColor}`} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${
                isComingSoon ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {option.name}
            </p>
            {option.disabledReason && (
              <Badge variant="secondary" className="text-xs">
                {option.disabledReason}
              </Badge>
            )}
            {isComingSoon && (
              <Badge variant="secondary" className="text-xs">
                Soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{option.description}</p>
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={isMobile ? "p-2" : "gap-2"}
        >
          <Download className="h-4 w-4" />
          {!isMobile && "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <div className="px-2 py-1.5">
          <h4 className="text-sm font-semibold text-foreground">
            Export Options
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your preferred export format
          </p>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Available Options */}
        <div className="space-y-1">
          {availableOptions.map((option) => renderOption(option))}
        </div>

        {comingSoonOptions.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-3" />

            {/* Coming Soon Options */}
            <div className="space-y-1">
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </p>
              </div>
              {comingSoonOptions.map((option) => renderOption(option, true))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
