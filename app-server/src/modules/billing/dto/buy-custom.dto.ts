import { PaymentCurrency } from '@entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

export class BuyCustomDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: PaymentCurrency })
  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
