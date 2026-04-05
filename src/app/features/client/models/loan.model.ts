export type LoanStatus = 'APPROVED' | 'OVERDUE' | 'REPAID' | 'REJECTED';

export enum LoanType {
  MORTGAGE = 'MORTGAGE',
  PERSONAL = 'PERSONAL',
  AUTO = 'AUTO',
  STUDENT = 'STUDENT',
  BUSINESS = 'BUSINESS'
}

export type InstallmentStatus = 'PAID' | 'UNPAID' | 'LATE';

export const InstallmentStatusLabels: Record<InstallmentStatus, string> = {
  'PAID': 'Plaćeno',
  'UNPAID': 'Neplaćeno',
  'LATE': 'Kasni'
};

export const LoanTypeLabels: Record<string, string> = {
  'PERSONAL': 'Keš kredit',
  'MORTGAGE': 'Stambeni kredit',
  'AUTO': 'Auto kredit',
  'STUDENT': 'Studentski kredit',
  'BUSINESS': 'Poslovni kredit'
};

export interface Installment {
  id?: number | string;
  expectedDueDate: string;
  actualPaymentDate?: string | null;
  amount: number;
  currency: string;
  interestRateAtPayment: number;
  status: InstallmentStatus;
}

export interface Loan {
  id: string | number;
  type: LoanType | string;
  number: string;
  amount: number;
  currency: string;
  status: LoanStatus | string;
  remainingDebt: number;
  contractDate: string;
  dueDate: string;
  repaymentPeriod?: number;
  nominalInterestRate?: number;
  effectiveInterestRate?: number;
  nextInstallmentAmount?: number;
  nextInstallmentDate?: string;
}
