# CLI Interface & Demonstration

This guide outlines the steps to build the interactive Command Line Interface (CLI) in `index.ts` and write automated tests using `bun test` in `tests/bank.test.ts`.

---

## Interactive CLI (`index.ts`)

We will build a simple console interface in `index.ts` to interact with our Bank Account Management System in real time. We will use standard input stream parsing or simple prompt loops.

### Key CLI Operations to Support
1. Create a Savings Account (input holder name, initial balance, interest rate, minimum balance).
2. Create a Current Account (input holder name, initial balance, overdraft limit).
3. Deposit money into an account.
4. Withdraw money from an account.
5. Transfer funds between accounts.
6. Apply interest to savings accounts.
7. Search accounts by holder name.
8. Search account by number and show its transaction history/details.
9. Close/Freeze/Unfreeze an account.
10. Save and load database files.
---

## Automated Tests (`tests/bank.test.ts`)

We will use `bun test` to create unit tests validating the system's requirements.

### Key Scenarios to Test
1. **Core Validations**:
   - Verify deposit amount must be > 0.
   - Verify withdrawal amount must be > 0.
   - Verify transaction amounts for transfers must be > 0.
   - Operations on a closed account throw errors.
   - Unique account numbers.
2. **Savings Account Logic**:
   - Withdrawals cannot drop balance below minimum required balance.
   - Interest is calculated and applied correctly.
3. **Current Account Logic**:
   - Withdrawals allow going negative down to the overdraft limit.
   - Remaining overdraft amount is reported correctly.
4. **Bank Coordinator Logic**:
   - Transfers succeed and update both balances correctly.
   - Searching by name works.
   - Sorting by name or balance works.
5. **Persistence**:
   - Saving and loading correctly reconstructs accounts as instances of their subclasses.