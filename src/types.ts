export type AccountType = "Savings" | "Current";

export type AccountStatus = "Active" | "Closed" | "Frozen";

export type TransactionType = "Deposit" | "Withdrawal" | "TransferIn" | "TransferOut" | "Interest";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  description: string;
}

export interface AccountDetails {
  accountNumber: string;
  accountHolderName: string;
  type: AccountType;
  balance: number;
  creationDate: Date;
  status: AccountStatus;
  interestRate?: number;
  minimumBalance?: number;
  overdraftLimit?: number;
  remainingOverdraft?: number;
}
