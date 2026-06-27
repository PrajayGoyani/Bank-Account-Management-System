# Specific Accounts (Savings & Current)

This guide outlines the steps to extend the base `BankAccount` class and implement the specific business logic for the `SavingsAccount` and `CurrentAccount` subclasses.

---

## `SavingsAccount` Class (`src/SavingsAccount.ts`)

The `SavingsAccount` class introduces interest rate computations and enforces a minimum required balance constraint.

### Subclass-Specific Rules
1. **Properties**:
   - `interestRate` (number, e.g., 0.05 for 5% per annum).
   - `minimumBalance` (number, e.g., 100).
2. **Withdrawal / Transfer Checks**:
   - Subclass overrides `validateWithdrawal(amount: number): void`.
   - If `balance - amount < minimumBalance`, throw an error ("Cannot withdraw: Balance would drop below the minimum required balance").
3. **Interest Calculations**:
   - `calculateInterest(): number`: Returns `balance * interestRate`.
   - `applyInterest(): void`: Invokes `deposit(interest, "Interest Credit")` using the computed interest.


---

## `CurrentAccount` Class (`src/CurrentAccount.ts`)

The `CurrentAccount` class introduces overdraft privileges, allowing negative balances down to a specific overdraft limit.

### Subclass-Specific Rules
1. **Properties**:
   - `overdraftLimit` (number, e.g., 500).
2. **Withdrawal / Transfer Checks**:
   - Subclass overrides `validateWithdrawal(amount: number): void`.
   - If `balance - amount < -overdraftLimit`, throw an error ("Cannot withdraw: Overdraft limit exceeded").
3. **Remaining Overdraft**:
   - `remainingOverdraft` (getter): If balance is positive or zero, returns `overdraftLimit`. If balance is negative, returns `overdraftLimit + balance` (which reduces the limit).
