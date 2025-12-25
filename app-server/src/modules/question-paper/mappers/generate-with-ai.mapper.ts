import { UploadStatus } from '@entities';
import { Injectable } from '@nestjs/common';
import { QuestionPaperGenerateRequest } from '../../../libs/ai-bridge';
import { MediaService } from '../../media/media.service';
import { GenerateWithAiDto } from '../dto/generate-with-ai.dto';

@Injectable()
export class GenerateWithAiMapper {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Maps GenerateWithAiDto to gRPC QuestionPaperGenerateRequest
   * Fetches media URLs for uploaded media IDs
   * @param generateDto - The generate with AI DTO
   * @returns Promise<QuestionPaperGenerateRequest> - The gRPC request payload
   */
  async toAiBridgeRequest(
    generateDto: GenerateWithAiDto,
  ): Promise<QuestionPaperGenerateRequest> {
    // Fetch media URLs for all media IDs
    const mediaUrls = await this.getMediaUrls(generateDto.mediaIds);

    return {
      course: generateDto.course,
      audience: generateDto.audience,
      topics: generateDto.topics,
      user_reference_media_urls: mediaUrls,
      item_schema: generateDto.itemSchema.map((item) => ({
        type: item.type,
        count: item.count,
        marks_each: item.marksEach,
        image_required: item.imageRequired ?? false,
        difficulty: item.difficulty,
        bloom_level: item.bloomLevel ?? 0,
        filtered_topics: item.filteredTopics,
        sub_questions: item.subQuestions?.map((sq) => ({
          type: sq.type,
          count: sq.count,
          marks_each: sq.marksEach,
          bloom_level: sq.bloomLevel ?? 0,
        })),
      })),
    } as QuestionPaperGenerateRequest;
  }

  /**
   * Fetches download URLs for media IDs
   * Only includes media that has been successfully uploaded
   * @param mediaIds - Array of media IDs
   * @returns Promise<string[]> - Array of media URLs
   */
  private async getMediaUrls(mediaIds: string[]): Promise<string[]> {
    const mediaUrls: string[] = [];

    for (const mediaId of mediaIds) {
      try {
        const media = await this.mediaService.findById(mediaId);

        // Check if media has been uploaded successfully
        if (media.uploadStatus !== UploadStatus.COMPLETED) {
          throw new Error(
            `Media ${mediaId} has not been uploaded successfully. Status: ${media.uploadStatus}`,
          );
        }

        // Get the download URL for the media
        const downloadUrl = await this.mediaService.getDownloadUrl(mediaId);
        mediaUrls.push(downloadUrl);
      } catch (error) {
        throw new Error(
          `Failed to get media URL for ID ${mediaId}: ${error.message}`,
        );
      }
    }

    return mediaUrls;
  }
}
