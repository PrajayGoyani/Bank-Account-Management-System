# CLI Interface & Demonstration

This guide outlines the structure of the interactive Command Line Interface (CLI) in `index.tsx` (using React & Ink) and the automated tests execution using `bun test`.

---

## Interactive React & Ink CLI (`index.tsx`)

A stateful terminal dashboard in `index.tsx` using **Ink** (React for CLI). The application handles user input asynchronously, renders formatted tables, and steps the user through input validation menus.

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

Use `bun test` to create unit tests validating the system's requirements.

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