import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { Bank } from "../src/Bank";
import { SavingsAccount } from "../src/SavingsAccount";
import { CurrentAccount } from "../src/CurrentAccount";
import { join } from "path";
import { unlinkSync, existsSync } from "fs";

const TEST_FILE = join(import.meta.dir, "test_bank_data.json");

describe("Bank Account Management System Tests", () => {
  let bank: Bank;

  beforeEach(() => {
    bank = new Bank();
  });

  afterEach(() => {
    if (existsSync(TEST_FILE)) {
      try {
        unlinkSync(TEST_FILE);
      } catch (e) {
        // ignore
      }
    }
  });

  describe("SavingsAccount Features", () => {
    test("Create Savings Account with defaults", () => {
      const sa = bank.createSavingsAccount("John Doe", 200);
      expect(sa.accountHolderName).toBe("John Doe");
      expect(sa.balance).toBe(200);
      expect(sa.interestRate).toBe(0.03);
      expect(sa.minimumBalance).toBe(100);
      expect(sa.type).toBe("Savings");
      expect(sa.status).toBe("Active");
    });

    test("Create Savings Account with custom settings", () => {
      const sa = bank.createSavingsAccount("John Doe", 500, 0.05, 150);
      expect(sa.interestRate).toBe(0.05);
      expect(sa.minimumBalance).toBe(150);
    });

    test("Initial balance must be >= minimum balance", () => {
      expect(() => {
        bank.createSavingsAccount("John Doe", 50, 0.03, 100);
      }).toThrow("Initial balance cannot be less than the minimum required balance of 100.");
    });

    test("Deposit must be greater than zero", () => {
      const sa = bank.createSavingsAccount("John Doe", 200);
      expect(() => sa.deposit(-50)).toThrow("Deposit amount must be greater than zero.");
      expect(() => sa.deposit(0)).toThrow("Deposit amount must be greater than zero.");
      sa.deposit(50);
      expect(sa.balance).toBe(250);
    });

    test("Withdrawal must not drop balance below minimum required balance", () => {
      const sa = bank.createSavingsAccount("John Doe", 200, 0.03, 100);
      expect(() => sa.withdraw(150)).toThrow("Withdrawal denied: Balance would fall below the minimum required balance of 100.");
      sa.withdraw(50);
      expect(sa.balance).toBe(150);
    });

    test("Calculate and apply interest", () => {
      const sa = bank.createSavingsAccount("John Doe", 200, 0.05, 100);
      const interest = sa.calculateInterest();
      expect(interest).toBe(10); // 200 * 0.05
      sa.applyInterest();
      expect(sa.balance).toBe(210);
      expect(sa.transactionHistory.length).toBe(1);
      expect(sa.transactionHistory[0]?.type).toBe("Interest");
    });
  });

  describe("CurrentAccount Features", () => {
    test("Create Current Account with defaults", () => {
      const ca = bank.createCurrentAccount("Jane Smith", 200);
      expect(ca.accountHolderName).toBe("Jane Smith");
      expect(ca.balance).toBe(200);
      expect(ca.overdraftLimit).toBe(500);
      expect(ca.type).toBe("Current");
    });

    test("Withdrawals can exceed balance up to overdraft limit", () => {
      const ca = bank.createCurrentAccount("Jane Smith", 100, 300);
      // Can withdraw up to $400
      expect(() => ca.withdraw(450)).toThrow("Withdrawal denied: Exceeds overdraft limit of 300.");
      ca.withdraw(250);
      expect(ca.balance).toBe(-150);
      expect(ca.remainingOverdraft).toBe(150); // 300 - 150
    });

    test("Remaining overdraft works for positive balance", () => {
      const ca = bank.createCurrentAccount("Jane Smith", 100, 300);
      expect(ca.remainingOverdraft).toBe(300);
    });
  });

  describe("Bank System Operations", () => {
    test("Account numbers are unique and correct", () => {
      const sa = bank.createSavingsAccount("John", 200);
      const ca = bank.createCurrentAccount("Jane", 200);
      expect(sa.accountNumber).not.toBe(ca.accountNumber);
      expect(sa.accountNumber.startsWith("SAV-")).toBe(true);
      expect(ca.accountNumber.startsWith("CUR-")).toBe(true);
    });

    test("Transfer respects minimum balance of Savings Account", () => {
      const sa = bank.createSavingsAccount("John", 200, 0.03, 100);
      const ca = bank.createCurrentAccount("Jane", 100);
      
      expect(() => bank.transferFunds(sa.accountNumber, ca.accountNumber, 150)).toThrow();
      bank.transferFunds(sa.accountNumber, ca.accountNumber, 50);
      expect(sa.balance).toBe(150);
      expect(ca.balance).toBe(150);
    });

    test("Transfer respects overdraft limit of Current Account", () => {
      const ca = bank.createCurrentAccount("Jane", 100, 200);
      const sa = bank.createSavingsAccount("John", 200);

      expect(() => bank.transferFunds(ca.accountNumber, sa.accountNumber, 400)).toThrow();
      bank.transferFunds(ca.accountNumber, sa.accountNumber, 250);
      expect(ca.balance).toBe(-150);
      expect(sa.balance).toBe(450);
    });

    test("Operations on closed/frozen accounts are forbidden", () => {
      const sa = bank.createSavingsAccount("John", 250);
      bank.closeAccount(sa.accountNumber);
      expect(() => sa.deposit(50)).toThrow("Operation not allowed: Account is closed.");
      expect(() => sa.withdraw(50)).toThrow("Operation not allowed: Account is closed.");

      const ca = bank.createCurrentAccount("Jane", 100);
      bank.freezeAccount(ca.accountNumber);
      expect(() => ca.deposit(50)).toThrow("Operation not allowed: Account is frozen.");
      
      bank.unfreezeAccount(ca.accountNumber);
      ca.deposit(50);
      expect(ca.balance).toBe(150);
    });

    test("Search by holder name is case-insensitive substring search", () => {
      bank.createSavingsAccount("Albert Einstein", 200);
      bank.createCurrentAccount("Marie Curie", 300);

      const results1 = bank.searchByHolderName("ein");
      expect(results1.length).toBe(1);
      expect(results1[0]?.accountHolderName).toBe("Albert Einstein");

      const results2 = bank.searchByHolderName("rie");
      expect(results2.length).toBe(1);
      expect(results2[0]?.accountHolderName).toBe("Marie Curie");
    });

    test("Sorting accounts by balance and name", () => {
      const sa1 = bank.createSavingsAccount("Zack", 200);
      const sa2 = bank.createSavingsAccount("Anna", 500);

      const sortedByBalanceDesc = bank.sortAccounts("balance", "desc");
      expect(sortedByBalanceDesc[0]?.accountHolderName).toBe("Anna");

      const sortedByNameAsc = bank.sortAccounts("holderName", "asc");
      expect(sortedByNameAsc[0]?.accountHolderName).toBe("Anna");
      expect(sortedByNameAsc[1]?.accountHolderName).toBe("Zack");
    });
  });

  describe("Persistence Features", () => {
    test("Save and Load data", async () => {
      const sa = bank.createSavingsAccount("John Doe", 200, 0.05, 100);
      const ca = bank.createCurrentAccount("Jane Smith", 500, 300);
      
      sa.deposit(50);
      ca.withdraw(200);

      await bank.saveData(TEST_FILE);
      expect(existsSync(TEST_FILE)).toBe(true);

      const newBank = new Bank();
      await newBank.loadData(TEST_FILE);

      const loadedSA = newBank.getAccount(sa.accountNumber);
      const loadedCA = newBank.getAccount(ca.accountNumber);

      expect(loadedSA).toBeDefined();
      expect(loadedSA instanceof SavingsAccount).toBe(true);
      expect(loadedSA!.balance).toBe(250);
      expect((loadedSA as SavingsAccount).interestRate).toBe(0.05);

      expect(loadedCA).toBeDefined();
      expect(loadedCA instanceof CurrentAccount).toBe(true);
      expect(loadedCA!.balance).toBe(300);
      expect((loadedCA as CurrentAccount).overdraftLimit).toBe(300);
      
      expect(loadedSA!.transactionHistory.length).toBe(1);
      expect(loadedSA!.transactionHistory[0]?.type).toBe("Deposit");
    });
  });
});
