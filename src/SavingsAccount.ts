import { BankAccount } from "./BankAccount";
import type { AccountDetails, AccountType, AccountStatus, Transaction } from "./types";

export class SavingsAccount extends BankAccount {
  readonly interestRate: number;
  readonly minimumBalance: number;

  constructor(
    accountNumber: string,
    accountHolderName: string,
    initialBalance: number = 0,
    interestRate: number = 0.03,
    minimumBalance: number = 100,
    creationDate: Date = new Date(),
    status: AccountStatus = "Active",
    transactionHistory: Transaction[] = []
  ) {
    if (initialBalance < minimumBalance) {
      throw new Error(`Initial balance cannot be less than the minimum required balance of ${minimumBalance}.`);
    }
    super(accountNumber, accountHolderName, initialBalance, creationDate, status, transactionHistory);
    this.interestRate = interestRate;
    this.minimumBalance = minimumBalance;
  }

  get type(): AccountType {
    return "Savings";
  }

  protected validateWithdrawal(amount: number): void {
    if (this._balance - amount < this.minimumBalance) {
      throw new Error(`Withdrawal denied: Balance would fall below the minimum required balance of ${this.minimumBalance}.`);
    }
  }

  calculateInterest(): number {
    return Number((this._balance * this.interestRate).toFixed(2));
  }

  applyInterest(): void {
    this.ensureActive();
    const interest = this.calculateInterest();
    if (interest > 0) {
      this._balance = Number((this._balance + interest).toFixed(2));
      this.addTransaction("Interest", interest, `Interest Credit (${(this.interestRate * 100).toFixed(1)}% per annum)`);
    }
  }

  getDetails(): AccountDetails {
    return {
      accountNumber: this.accountNumber,
      accountHolderName: this.accountHolderName,
      type: this.type,
      balance: this.balance,
      creationDate: this.creationDate,
      status: this.status,
      interestRate: this.interestRate,
      minimumBalance: this.minimumBalance
    };
  }
}
