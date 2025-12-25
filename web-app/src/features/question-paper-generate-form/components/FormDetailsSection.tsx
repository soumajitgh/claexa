import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AUDIENCE_OPTIONS, 
  BOARD_OPTIONS, 
  CLASS_OPTIONS, 
  UNDERGRADUATE_DEGREES,
  POSTGRADUATE_DEGREES 
} from "../constants";
import { FormData } from "../types";
import ReferenceFilesUploader from "./ReferenceFilesUploader";
import SubjectInput from "./SubjectInput";
import DegreeInput from "./DegreeInput";

interface FormDetailsSectionProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

export default function FormDetailsSection({
  data,
  onUpdate,
}: FormDetailsSectionProps) {
  const isSchool = data.audience?.toLowerCase() === "school";
  const isUndergraduate = data.audience?.toLowerCase() === "undergraduate";
  const isPostgraduate = data.audience?.toLowerCase() === "postgraduate";
  const isHigherEducation = isUndergraduate || isPostgraduate;

  // Determine which degree list to show
  const degreeOptions = isUndergraduate 
    ? UNDERGRADUATE_DEGREES 
    : isPostgraduate 
    ? POSTGRADUATE_DEGREES 
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className=" space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course/Subject</Label>
          <SubjectInput
            value={data.course || ""}
            onChange={(value: string) => onUpdate({ course: value })}
            placeholder="Search for course or subject..."
            
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Institution Type</Label>
          <Select
            value={data.audience || ""}
            onValueChange={(value) => onUpdate({ audience: value })}
          >
            <SelectTrigger id="audience" className="w-full">
              <SelectValue placeholder="Select institution type" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* School-specific fields */}
        {isSchool && (
          <>
            <div className="space-y-2">
              <Label htmlFor="board">Board</Label>
              <Select
                value={data.board || ""}
                onValueChange={(value) => onUpdate({ board: value })}
              >
                <SelectTrigger id="board" className="w-full">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_OPTIONS.map((board) => (
                    <SelectItem key={board} value={board}>
                      {board}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classLevel">Class</Label>
              <Select
                value={data.classLevel || ""}
                onValueChange={(value) => onUpdate({ classLevel: value })}
              >
                <SelectTrigger id="classLevel" className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Undergraduate/Postgraduate-specific fields */}
        {isHigherEducation && (
          <>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <DegreeInput
                value={data.degree || ""}
                onChange={(value: string) => onUpdate({ degree: value })}
                placeholder="Search for your degree..."
                degreeList={degreeOptions}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeName">
                College/University Name <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="collegeName"
                type="text"
                value={data.collegeName || ""}
                onChange={(e) => onUpdate({ collegeName: e.target.value })}
                placeholder="Enter your college or university name"
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      <ReferenceFilesUploader data={data} onUpdate={onUpdate} />
    </div>
  );
}
