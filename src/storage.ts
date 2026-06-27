import { BankAccount } from "./BankAccount";
import { SavingsAccount } from "./SavingsAccount";
import { CurrentAccount } from "./CurrentAccount";
import type { AccountStatus, Transaction } from "./types";

interface SerializedAccount {
  accountNumber: string;
  accountHolderName: string;
  type: "Savings" | "Current";
  balance: number;
  creationDate: string;
  status: AccountStatus;
  transactionHistory: {
    id: string;
    type: string;
    amount: number;
    timestamp: string;
    description: string;
  }[];
  interestRate?: number;
  minimumBalance?: number;
  overdraftLimit?: number;
}

export async function saveAccounts(accounts: BankAccount[], filePath: string): Promise<void> {
  const serializedList: SerializedAccount[] = accounts.map(acc => {
    return {
      accountNumber: acc.accountNumber,
      accountHolderName: acc.accountHolderName,
      type: acc.type,
      balance: acc.balance,
      creationDate: acc.creationDate.toISOString(),
      status: acc.status,
      transactionHistory: acc.transactionHistory.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        timestamp: tx.timestamp.toISOString(),
        description: tx.description
      })),
      ...(acc instanceof SavingsAccount ? {
        interestRate: acc.interestRate,
        minimumBalance: acc.minimumBalance
      } : {}),
      ...(acc instanceof CurrentAccount ? {
        overdraftLimit: acc.overdraftLimit
      } : {})
    };
  });

  const jsonStr = JSON.stringify(serializedList, null, 2);
  await Bun.write(filePath, jsonStr);
}

export async function loadAccounts(filePath: string): Promise<BankAccount[]> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return [];
  }

  const jsonStr = await file.text();
  if (!jsonStr.trim()) {
    return [];
  }

  const parsedList = JSON.parse(jsonStr) as SerializedAccount[];
  const accounts: BankAccount[] = [];

  for (const data of parsedList) {
    const creationDate = new Date(data.creationDate);
    const txHistory: Transaction[] = data.transactionHistory.map(tx => ({
      id: tx.id,
      type: tx.type as any,
      amount: tx.amount,
      timestamp: new Date(tx.timestamp),
      description: tx.description
    }));

    if (data.type === "Savings") {
      const interestRate = data.interestRate ?? 0.03;
      const minimumBalance = data.minimumBalance ?? 100;
      const acc = new SavingsAccount(
        data.accountNumber,
        data.accountHolderName,
        data.balance,
        interestRate,
        minimumBalance,
        creationDate,
        data.status,
        txHistory
      );
      accounts.push(acc);
    } else if (data.type === "Current") {
      const overdraftLimit = data.overdraftLimit ?? 500;
      const acc = new CurrentAccount(
        data.accountNumber,
        data.accountHolderName,
        data.balance,
        overdraftLimit,
        creationDate,
        data.status,
        txHistory
      );
      accounts.push(acc);
    }
  }

  return accounts;
}
