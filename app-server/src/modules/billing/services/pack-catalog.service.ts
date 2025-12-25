import { Inject, Injectable } from '@nestjs/common';
import { CreditPackDto } from '../interfaces/credit-packs.dto';
import { PACKS_TOKEN } from '../tokens';

@Injectable()
export class PackCatalogService {
  constructor(@Inject(PACKS_TOKEN) private readonly packs: CreditPackDto[]) {}

  getAll(): CreditPackDto[] {
    return this.packs;
  }

  findById(id: string): CreditPackDto | undefined {
    return this.packs.find((p) => p.id === id);
  }
}
