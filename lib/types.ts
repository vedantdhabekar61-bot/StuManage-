export type Shift = 'Morning' | 'Evening' | 'Full Day';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';
export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer';

export interface Student {
  id: string;
  name: string;
  phone: string;
  deskNumber: number;
  shift: Shift;
  plan: string;
  price: number;
  startDate: string;
  expiryDate: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  lastPaymentDate?: string;
}

export interface LibraryStats {
  totalStudents: number;
  availableSeats: number;
  overdueFees: number;
  revenueThisMonth: number;
  pendingPayments: number;
  occupancyPercentage: number;
}
