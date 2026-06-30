import type { AccountStatus, AccountType, Transaction, TransactionType, AccountDetails } from "./types";

export abstract class BankAccount {
  readonly accountNumber: string;
  readonly accountHolderName: string;
  protected _balance: number;
  readonly creationDate: Date;
  protected _status: AccountStatus;
  protected _transactionHistory: Transaction[];

  constructor(
    accountNumber: string,
    accountHolderName: string,
    initialBalance: number = 0,
    creationDate: Date = new Date(),
    status: AccountStatus = "Active",
    transactionHistory: Transaction[] = []
  ) {
    this.accountNumber = accountNumber;
    this.accountHolderName = accountHolderName;
    this._balance = initialBalance;
    this.creationDate = creationDate;
    this._status = status;
    this._transactionHistory = transactionHistory;
  }

  // Getters
  get balance(): number {
    return this._balance;
  }

  get status(): AccountStatus {
    return this._status;
  }

  get transactionHistory(): Transaction[] {
    return [...this._transactionHistory];
  }

  abstract get type(): AccountType;

  // Behaviors
  deposit(amount: number, description: string = "Deposit"): void {
    this.ensureActive();
    if (amount <= 0) {
      throw new Error("Deposit amount must be greater than zero.");
    }
    this._balance += amount;
    this.addTransaction("Deposit", amount, description);
  }

  withdraw(amount: number, description: string = "Withdrawal"): void {
    this.ensureActive();
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero.");
    }
    
    // Subclass hook to validate type-specific withdrawal rules
    this.validateWithdrawal(amount);

    this._balance -= amount;
    this.addTransaction("Withdrawal", amount, description);
  }

  transfer(toAccount: BankAccount, amount: number, description: string = "Transfer"): void {
    this.ensureActive();
    toAccount.ensureActive();

    if (amount <= 0) {
      throw new Error("Transfer amount must be greater than zero.");
    }
    if (toAccount.accountNumber === this.accountNumber) {
      throw new Error("Cannot transfer to the same account.");
    }

    // Validate if withdrawal is permitted in source account
    this.validateWithdrawal(amount);
    
    this._balance -= amount;
    this.addTransaction("TransferOut", amount, `${description} to ${toAccount.accountNumber}`);

    toAccount._balance += amount;
    toAccount.addTransaction("TransferIn", amount, `${description} from ${this.accountNumber}`);
  }

  close(): void {
    if (this._status === "Closed") {
      throw new Error("Account is already closed.");
    }
    this._status = "Closed";
  }

  freeze(): void {
    if (this._status === "Closed") {
      throw new Error("Cannot freeze a closed account.");
    }
    this._status = "Frozen";
  }

  unfreeze(): void {
    if (this._status === "Closed") {
      throw new Error("Cannot unfreeze a closed account.");
    }
    this._status = "Active";
  }

  protected abstract validateWithdrawal(amount: number): void;

  protected addTransaction(type: TransactionType, amount: number, description: string): void {
    const transaction: Transaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      type,
      amount,
      timestamp: new Date(),
      description
    };
    this._transactionHistory.push(transaction);
  }

  abstract getDetails(): AccountDetails;
  
  protected ensureActive(): void {
    if (this._status === "Closed") {
      throw new Error("Operation not allowed: Account is closed.");
    }
    if (this._status === "Frozen") {
      throw new Error("Operation not allowed: Account is frozen.");
    }
  }
}
