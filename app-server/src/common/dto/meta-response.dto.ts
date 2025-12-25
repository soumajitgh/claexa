import { ApiProperty } from '@nestjs/swagger';

class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ nullable: true })
  nextPage: number | null;
}
export class MetaResponseDto {
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
