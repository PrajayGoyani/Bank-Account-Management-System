# Bank Manager & Storage

This guide outlines the steps to implement the `Bank` manager class (which manages multiple accounts, performs search/sorting) and data persistence (loading/saving accounts using `Bun.file`).

---

## Data Persistence (`src/storage.ts`)

Since we are using OOP classes, saving them directly to JSON and parsing them back will strip them of their class methods and behaviors. We need a serializer/deserializer to properly reconstruct the objects as `SavingsAccount` or `CurrentAccount` instances.

### Storage Strategy
1. **Serialization**: Convert an array of `BankAccount` instances into a plain JSON array of objects. Since `transactionHistory` and other properties might have `Date` instances, serialize dates correctly.
2. **Deserialization**:
   - Parse the JSON string.
   - For each parsed account, inspect the `type` field.
   - If `"Savings"`, instantiate `new SavingsAccount(...)` using the stored details.
   - If `"Current"`, instantiate `new CurrentAccount(...)` using the stored details.
   - Re-populate transaction histories ensuring `timestamp` is converted back to a `Date` object.

---

## `Bank` Manager Class (`src/Bank.ts`)

The `Bank` class acts as the centralized coordinator to manage all accounts, enforce uniqueness constraints, and orchestrate transfers.

### Core Behaviors
1. **`createSavingsAccount(holderName: string, initialBalance: number, interestRate?: number, minimumBalance?: number): SavingsAccount`**:
   - Generate a unique account number (e.g. `SAV-XXXXXX` using a sequence or random string).
   - Ensure the generated number is unique.
   - Instantiate and store the account.
2. **`createCurrentAccount(holderName: string, initialBalance: number, overdraftLimit?: number): CurrentAccount`**:
   - Generate a unique account number (e.g. `CUR-XXXXXX`).
   - Instantiate and store the account.
3. **`getAccount(accountNumber: string): BankAccount | undefined`**:
   - Find and return the account.
4. **`closeAccount(accountNumber: string): void`**:
   - Find account and call its `close()` method.
5. **`calculateInterest(): void`**:
   - Loop through all accounts.
   - If an account is an instance of `SavingsAccount`, call `applyInterest()`.
6. **`searchByHolderName(query: string): BankAccount[]`**:
   - Return all accounts where the holder's name contains `query` (case-insensitive).
7. **`sortAccounts(sortBy: "balance" | "holderName", order: "asc" | "desc"): BankAccount[]`**:
   - Sort and return a copy of the accounts list.
8. **`loadData(filePath: string): Promise<void>`**:
   - Read accounts using `loadAccounts(filePath)` and replace internal state.
9. **`saveData(filePath: string): Promise<void>`**:
   - Write internal state of accounts using `saveAccounts(accounts, filePath)`.
