export type Shift = 'Morning' | 'Afternoon' | 'Evening' | 'Full Day';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';
export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer';

export interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  deskNumber: number;
  shift: Shift;
  plan: string;
  price: number;
  joinDate: string;
  expiryDate: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  lastPaymentDate?: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  ownerId: string;
  planPrice: number;
  startDate: string;
  expiryDate: string;
  status: 'trial' | 'active' | 'expired';
}

export interface Settings {
  totalSeats: number;
  messageTemplate: string;
  libraryName: string;
}

export interface LibraryStats {
  totalStudents: number;
  availableSeats: number;
  overdueFees: number;
  revenueThisMonth: number;
  pendingPayments: number;
  occupancyPercentage: number;
}
