import { Media } from '@entities';
import { MediaResponseDto } from '../dto/media-response.dto';

export class MediaMapper {
  /**
   * Maps Media entity to MediaResponseDto
   */
  static toResponseDto(media: Media): MediaResponseDto {
    const mediaResponse: MediaResponseDto = {
      id: media.id,
      originalName: media.originalName,
      mimetype: media.mimetype,
      size: media.size,
      uploadStatus: media.uploadStatus,
    };

    return mediaResponse;
  }

  /**
   * Maps multiple Media entities to MediaResponseDto array
   */
  static toResponseDtoArray(medias: Media[]): MediaResponseDto[] {
    return medias.map((media) => this.toResponseDto(media));
  }
}
