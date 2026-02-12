export enum PaymentStatusEnum {
  'pending' = 'pending',
  'partial' = 'partial',
  'paid' = 'paid',
  'overdue' = 'overdue',
  'waived' = 'waived',
  'refunded' = 'refunded',
}

export enum PaymentMethodEnum {
  'cash' = 'cash',
  'bank_transfer' = 'bank_transfer',
  'cheque' = 'cheque',
  'online' = 'online',
  'card' = 'card',
}

export enum FeeFrequencyEnum {
  'one_time' = 'one_time',
  'monthly' = 'monthly',
  'quarterly' = 'quarterly',
  'semi_annual' = 'semi_annual',
  'annual' = 'annual',
}
