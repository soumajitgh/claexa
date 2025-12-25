import { PaymentCurrency } from '@entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';

export class BuyPackDto {
  @ApiProperty({ enum: PaymentCurrency })
  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
