export type MoneyMap = { INR: number; USD: number };

export interface CreditPackDto {
  id: string;
  name: string;
  credits: number;
  price: MoneyMap; // price per currency
}
