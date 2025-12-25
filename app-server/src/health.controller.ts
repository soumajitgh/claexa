import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import * as process from 'process';
import { AiBridgeHealthService } from './libs/ai-bridge/ai-bridge-health.service';

class HealthDetailsDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: '2023-10-27T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '123.45 seconds' })
  uptime: string;
}

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly aiBridgeHealthService: AiBridgeHealthService) {}

  @Get('/health')
  @ApiOperation({ summary: 'Get application health status' })
  @ApiOkResponse({
    description: 'Returns the health status of the application.',
    type: HealthDetailsDto,
  })
  async getHealth(): Promise<HealthDetailsDto & { ai_available: boolean }> {
    const uptimeInSeconds = process.uptime();
    const uptimeFormatted = `${uptimeInSeconds.toFixed(2)} seconds`;
    const aiAvailable = await this.aiBridgeHealthService.isAvailable();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      ai_available: aiAvailable,
    };
  }
}
