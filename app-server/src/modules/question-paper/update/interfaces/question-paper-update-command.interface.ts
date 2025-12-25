export interface IQuestionPaperUpdateCommand {
  verifyAccess(): Promise<{
    isValid: boolean;
    message: string;
  }>;
  validate(): {
    isValid: boolean;
    errors: string[];
  };
  execute(): Promise<void>;
}
