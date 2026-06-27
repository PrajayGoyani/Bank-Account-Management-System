import { BankAccount } from "./BankAccount";
import type { AccountDetails, AccountType, AccountStatus, Transaction } from "./types";

export class CurrentAccount extends BankAccount {
  readonly overdraftLimit: number;

  constructor(
    accountNumber: string,
    accountHolderName: string,
    initialBalance: number = 0,
    overdraftLimit: number = 500,
    creationDate: Date = new Date(),
    status: AccountStatus = "Active",
    transactionHistory: Transaction[] = []
  ) {
    if (overdraftLimit < 0) {
      throw new Error("Overdraft limit cannot be negative.");
    }
    super(accountNumber, accountHolderName, initialBalance, creationDate, status, transactionHistory);
    this.overdraftLimit = overdraftLimit;
  }

  get type(): AccountType {
    return "Current";
  }

  protected validateWithdrawal(amount: number): void {
    if (this._balance - amount < -this.overdraftLimit) {
      throw new Error(`Withdrawal denied: Exceeds overdraft limit of ${this.overdraftLimit}. Maximum withdrawable is ${Number((this._balance + this.overdraftLimit).toFixed(2))}.`);
    }
  }

  get remainingOverdraft(): number {
    if (this._balance >= 0) {
      return this.overdraftLimit;
    }
    return Number((this.overdraftLimit + this._balance).toFixed(2));
  }

  getDetails(): AccountDetails {
    return {
      accountNumber: this.accountNumber,
      accountHolderName: this.accountHolderName,
      type: this.type,
      balance: this.balance,
      creationDate: this.creationDate,
      status: this.status,
      overdraftLimit: this.overdraftLimit,
      remainingOverdraft: this.remainingOverdraft
    };
  }
}
