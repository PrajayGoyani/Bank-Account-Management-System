import { BankAccount } from "./BankAccount";
import { SavingsAccount } from "./SavingsAccount";
import { CurrentAccount } from "./CurrentAccount";
import { saveAccounts, loadAccounts } from "./storage";

export class Bank {
  private accounts: BankAccount[] = [];

  /**
   * Get all accounts in the bank
   */
  getAllAccounts(): BankAccount[] {
    return [...this.accounts];
  }

  /**
   * Find an account by its unique account number
   */
  getAccount(accountNumber: string): BankAccount | undefined {
    return this.accounts.find(acc => acc.accountNumber === accountNumber);
  }

  /**
   * Create a new Savings Account
   */
  createSavingsAccount(
    holderName: string,
    initialBalance: number,
    interestRate?: number,
    minimumBalance?: number
  ): SavingsAccount {
    if (!holderName.trim()) {
      throw new Error("Account holder name cannot be empty.");
    }
    const accountNumber = this.generateAccountNumber("SAV");
    const account = new SavingsAccount(
      accountNumber,
      holderName,
      initialBalance,
      interestRate,
      minimumBalance
    );
    this.accounts.push(account);
    return account;
  }

  /**
   * Create a new Current Account
   */
  createCurrentAccount(
    holderName: string,
    initialBalance: number,
    overdraftLimit?: number
  ): CurrentAccount {
    if (!holderName.trim()) {
      throw new Error("Account holder name cannot be empty.");
    }
    const accountNumber = this.generateAccountNumber("CUR");
    const account = new CurrentAccount(
      accountNumber,
      holderName,
      initialBalance,
      overdraftLimit
    );
    this.accounts.push(account);
    return account;
  }

  /**
   * Close a specific bank account
   */
  closeAccount(accountNumber: string): void {
    const account = this.getAccount(accountNumber);
    if (!account) {
      throw new Error(`Account ${accountNumber} not found.`);
    }
    account.close();
  }

  /**
   * Freeze a specific bank account
   */
  freezeAccount(accountNumber: string): void {
    const account = this.getAccount(accountNumber);
    if (!account) {
      throw new Error(`Account ${accountNumber} not found.`);
    }
    account.freeze();
  }

  /**
   * Unfreeze a specific bank account
   */
  unfreezeAccount(accountNumber: string): void {
    const account = this.getAccount(accountNumber);
    if (!account) {
      throw new Error(`Account ${accountNumber} not found.`);
    }
    account.unfreeze();
  }

  /**
   * Calculate and apply interest to all active Savings accounts
   */
  calculateInterest(): void {
    for (const account of this.accounts) {
      if (account instanceof SavingsAccount && account.status === "Active") {
        account.applyInterest();
      }
    }
  }

  /**
   * Transfer funds between two accounts managed by this bank
   */
  transferFunds(fromNumber: string, toNumber: string, amount: number, description?: string): void {
    const fromAccount = this.getAccount(fromNumber);
    const toAccount = this.getAccount(toNumber);

    if (!fromAccount) {
      throw new Error(`Source account ${fromNumber} not found.`);
    }
    if (!toAccount) {
      throw new Error(`Destination account ${toNumber} not found.`);
    }

    fromAccount.transfer(toAccount, amount, description);
  }

  /**
   * Search accounts by holder name (case-insensitive substring match)
   */
  searchByHolderName(query: string): BankAccount[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];
    return this.accounts.filter(acc => 
      acc.accountHolderName.toLowerCase().includes(cleanQuery)
    );
  }

  /**
   * Sort accounts by balance or holder name
   */
  sortAccounts(sortBy: "balance" | "holderName", order: "asc" | "desc" = "asc"): BankAccount[] {
    return [...this.accounts].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "balance") {
        comparison = a.balance - b.balance;
      } else if (sortBy === "holderName") {
        comparison = a.accountHolderName.localeCompare(b.accountHolderName);
      }

      return order === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Load accounts from a JSON file
   */
  async loadData(filePath: string): Promise<void> {
    this.accounts = await loadAccounts(filePath);
  }

  /**
   * Save accounts to a JSON file
   */
  async saveData(filePath: string): Promise<void> {
    await saveAccounts(this.accounts, filePath);
  }

  /**
   * Generate a unique account number
   */
  private generateAccountNumber(prefix: "SAV" | "CUR"): string {
    let accountNumber = "";
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
      accountNumber = `${prefix}-${randomDigits}`;
      isUnique = !this.accounts.some(acc => acc.accountNumber === accountNumber);
    }
    return accountNumber;
  }
}
