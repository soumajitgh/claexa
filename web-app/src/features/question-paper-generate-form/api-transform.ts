// Internal interface that matches the service method signature
interface ServiceAIGenerationRequest {
  course: string;
  audience: string;
  topics: string[];
  mediaIds?: string[];
  itemSchema: Array<{
    type: string;
    count: number;
    marksEach: number;
    difficulty: string;
    imageRequired: boolean;
    bloomLevel?: number;
    filteredTopics?: string[];
    subQuestions?: Array<{
      type: string;
      count: number;
      marksEach: number;
      bloomLevel?: number;
    }>;
  }>;
}

/**
 * Transform form data to API payload format for question paper generation
 */
export const transformFormDataToAPI = (
  data: {
    course?: string;
    audience?: string;
    board?: string;
    classLevel?: string;
    degree?: string;
    collegeName?: string;
    topics?: string[];
    mediaIds?: string[];
    questionPatterns?: Array<{
      type: string;
      count: number;
      marksEach: number;
      difficulty: "very-easy" | "easy" | "medium" | "hard" | "very-hard";
      imageRequired: boolean;
      bloomLevel?: number;
      targetTopic?: string;
      subQuestions?: Array<{
        type: string;
        count: number;
        marksEach: number;
        bloomLevel?: number;
      }>;
    }>;
  }
): ServiceAIGenerationRequest => {
  const isSchool = data.audience?.toLowerCase() === "school";
  const isUndergraduate = data.audience?.toLowerCase() === "undergraduate";
  const isPostgraduate = data.audience?.toLowerCase() === "postgraduate";

  // Create concatenated audience
  let audience = data.audience || "";
  
  if (isSchool && data.board && data.classLevel) {
    // For school: "CBSE Class 10"
    audience = `${data.board} ${data.classLevel}`;
  } else if ((isUndergraduate || isPostgraduate) && data.degree && data.collegeName) {
    // For college: "B.Tech - CSE, MIT College"
    audience = `${data.degree}, ${data.collegeName}`;
  }

  // Helper function to convert frontend difficulty format to backend format
  const convertDifficultyToAPI = (difficulty: string): string => {
    // Convert "very-hard" to "very_hard" for backend
    if (difficulty === "very-hard") return "very_hard";
    if (difficulty === "very-easy") return "very_easy";
    return difficulty;
  };

  return {
    course: data.course || "",
    audience,
    topics: data.topics || [],
    mediaIds: data.mediaIds || [],
    itemSchema: (data.questionPatterns || []).map((pattern) => ({
      type: pattern.type,
      count: pattern.count,
      marksEach: pattern.marksEach,
      difficulty: convertDifficultyToAPI(pattern.difficulty),
      imageRequired: pattern.imageRequired,
      bloomLevel: pattern.bloomLevel || 1, // Default bloom level
      filteredTopics: pattern.targetTopic ? [pattern.targetTopic] : [],
      subQuestions: pattern.subQuestions?.map((subQ) => ({
        type: subQ.type,
        count: subQ.count,
        marksEach: subQ.marksEach,
        bloomLevel: subQ.bloomLevel || 1, // Default bloom level
      })),
    })),
  };
};
