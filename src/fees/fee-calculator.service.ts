import { Injectable } from '@nestjs/common';

export interface ConcessionInput {
  id: number;
  studentId: number;
  type: string;
  discountPercentage: number;
  validFrom: Date;
  validTo: Date;
  approved: boolean;
}

@Injectable()
export class FeeCalculatorService {
  /**
   * Given an array of concessions, returns the highest applicable discount
   * percentage. Filters out unapproved and expired concessions.
   */
  calculateEffectiveDiscount(
    concessions: ConcessionInput[],
    asOfDate?: Date,
  ): number {
    const now = asOfDate ?? new Date();

    const active = concessions.filter(
      (c) =>
        c.approved &&
        new Date(c.validFrom) <= now &&
        new Date(c.validTo) >= now,
    );

    if (active.length === 0) return 0;

    return Math.max(...active.map((c) => c.discountPercentage));
  }

  /**
   * Apply discount percentage to an amount.
   * Returns rounded to nearest integer (no paise for simplicity).
   */
  applyDiscount(amount: number, discountPercentage: number): number {
    const discounted = amount * (1 - discountPercentage / 100);
    return Math.round(discounted);
  }
}
