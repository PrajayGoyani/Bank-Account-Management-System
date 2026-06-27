# Base Core Classes & Types

This guide outlines the steps to implement the foundational components of our Bank Account Management System: the common TypeScript types and the base `BankAccount` class.

---

## Core Types (`src/types.ts`)

We will define standard types and interfaces that are used across multiple components of our system:

1. **`AccountStatus`**: An enum or union representing the state of an account. We'll support `"Active"`, `"Closed"`, and `"Frozen"` (to support the freeze/unfreeze bonus requirement).
2. **`TransactionType`**: A union type: `"Deposit" | "Withdrawal" | "TransferIn" | "TransferOut" | "Interest"`.
3. **`Transaction`**: An interface representing a record of a single transaction:
   - `id`: Unique string (UUID or timestamp-based).
   - `type`: `TransactionType`.
   - `amount`: Positive number.
   - `timestamp`: Date object.
   - `description`: Custom message for tracking.
4. **`AccountDetails`**: Structure returned for displaying account details.

---

## Base `BankAccount` Class (`src/BankAccount.ts`)

The base `BankAccount` class holds the common properties and behaviors for all bank accounts. It handles core validation and encapsulates the balance.

### Encapsulation
- Balance is protected to prevent direct external manipulation.
- Properties like `accountNumber` and `creationDate` are `readonly`.
- Mutators like `deposit` and `withdraw` will validate inputs (e.g. positive amounts, checking if account is active).

### Core Behaviors
1. **`deposit(amount: number, description?: string): void`**:
   - Check if account is active.
   - Validate `amount > 0`.
   - Increase balance.
   - Log transaction.
2. **`withdraw(amount: number, description?: string): void`**:
   - Check if account is active.
   - Validate `amount > 0`.
   - Perform type-specific balance check (delegated to subclasses via abstract validation/behavior or overridden method).
   - Decrease balance.
   - Log transaction.
3. **`transfer(toAccount: BankAccount, amount: number, description?: string): void`**:
   - Check if both accounts are active.
   - Validate `amount > 0`.
   - Withdraw from source account.
   - Deposit to destination account.
4. **`close(): void`**:
   - Change status to `"Closed"`.
5. **`freeze()` / `unfreeze()`**:
   - Support freezing/unfreezing the account (bonus).
