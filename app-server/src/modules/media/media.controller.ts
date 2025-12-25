import { Media, MediaOriginType, User } from '@entities';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../../libs/auth/decorators/current-user.decorator';
import { FirebaseTokenGuard } from '../../libs/auth/guards/firebase-token.guard';
import { AbilityFactory } from '../../libs/authz/ability.factory';
import { Action } from '../../libs/authz/actions';
import { AuthzService } from '../../libs/authz/authz.service';
import { CompleteUploadDto, CreateMediaDto, MediaResponseDto } from './dto';
import { MediaMapper } from './mappers/media.mapper';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(FirebaseTokenGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly authz: AuthzService,
    private readonly abilityFactory: AbilityFactory,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned URL for file upload' })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/presigned-url',
        },
        record: {
          $ref: '#/components/schemas/MediaResponseDto',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUploadUrl(
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser() user: User,
  ): Promise<{ url: string; record: MediaResponseDto }> {
    this.authz.assert(user, Action.Create, 'Media');
    const { url, record } = await this.mediaService.getPresignedUrlForUpload({
      originalName: createMediaDto.originalName,
      mimetype: createMediaDto.mimetype,
      user,
      originType: MediaOriginType.UPLOADED,
    });
    return { url, record: MediaMapper.toResponseDto(record) };
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get presigned URL for file download' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/presigned-download-url',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ url: string }> {
    const m = await this.mediaRepo.findOne({
      where: { id },
      relations: { uploadedBy: true },
      select: { id: true } as any,
    });
    if (!m) {
      throw new NotFoundException('Media not found');
    }
    const subj = this.abilityFactory.mediaSubject({
      id: m.id,
      uploadedById: m.uploadedBy?.id,
    });
    this.authz.assert(user, Action.Read, subj);

    const url = await this.mediaService.getDownloadUrl(id);
    return { url };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata by ID' })
  @ApiResponse({
    status: 200,
    description: 'Media metadata retrieved successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<MediaResponseDto> {
    const m = await this.mediaRepo.findOne({
      where: { id },
      relations: { uploadedBy: true },
      select: { id: true } as any,
    });
    if (!m) {
      throw new NotFoundException('Media not found');
    }
    const subj = this.abilityFactory.mediaSubject({
      id: m.id,
      uploadedById: m.uploadedBy?.id,
    });
    this.authz.assert(user, Action.Read, subj);

    const media = await this.mediaService.findById(id);
    return MediaMapper.toResponseDto(media);
  }

  @Post(':id/complete-upload')
  @ApiOperation({ summary: 'Complete upload by updating size and status' })
  @ApiResponse({
    status: 200,
    description: 'Upload completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeUpload(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeUploadDto: CompleteUploadDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    const m = await this.mediaRepo.findOne({
      where: { id },
      relations: { uploadedBy: true },
      select: { id: true } as any,
    });
    if (!m) {
      throw new NotFoundException('Media not found');
    }
    const subj = this.abilityFactory.mediaSubject({
      id: m.id,
      uploadedById: m.uploadedBy?.id,
    });
    this.authz.assert(user, Action.Update, subj);

    const media = await this.mediaService.completeUpload(
      id,
      completeUploadDto.size,
      completeUploadDto.uploadStatus,
    );
    await MediaMapper.toResponseDto(media);
  }
}
