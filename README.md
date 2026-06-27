# Bank Account Management System (OOP in TypeScript)

A class-based Bank Account Management System written in TypeScript and powered by the **Bun** runtime. This project demonstrates core Object-Oriented Programming (OOP) principles—inheritance, encapsulation, polymorphism, and method overriding—to build a banking system.

---

## Key Features

*   **Savings Accounts**: Enforces minimum required balance limits, calculates interest, and applies interest credits.
*   **Current Accounts**: Supports overdraft allowances enabling negative balances down to a configurable limit, and tracks remaining overdraft availability.
*   **Data Encapsulation**: Protects account state from outside manipulation through private/protected variables, getters, and strict input validations.
*   **Transaction Logging**: Automatically logs transaction history (Deposits, Withdrawals, Transfers In/Out, and Interest Credits) for every account.
*   **Freeze/Unfreeze Control**: Allows administrators to freeze or unfreeze accounts to block or permit transaction flows.
*   **Bank Manager Class**: Coordinates deposits, withdrawals, searching, sorting, and batch interest payouts.
*   **Data Persistence**: Preserves accounts to a local JSON file database (`bank_data.json`) utilizing the Bun File API, and reconstructs correct subclass prototypes when parsed back.
*   **Interactive CLI Dashboard**: Includes a user-friendly console application to test banking workflows in real time.

---

## Project Architecture

This system demonstrates the following OOP concepts:

*   **Encapsulation**: Read-only properties (`accountNumber`, `creationDate`) are frozen upon instantiation. Balance and transaction history are protected and mutable only through validated methods (`deposit()`, `withdraw()`).
*   **Inheritance**: `SavingsAccount` and `CurrentAccount` inherit core characteristics and methods from the abstract `BankAccount` class.
*   **Polymorphism**: The abstract validation hook `validateWithdrawal(amount)` is implemented differently by subclasses to support different logic (minimum balance vs. overdraft allowance).
*   **Method Overriding**: Subclasses override `getDetails()` to export account-specific details (interest rates or overdraft limits) dynamically.

---

## File Directory Structure

```text
Bank-Account-Management-System/
├── docs/
│   ├── 1_core.md              # Core Classes & Types
│   ├── 2_accounts.md          # Specific Accounts
│   ├── 3_bank.md              # Bank Manager & Storage
│   └── 4_cli.md               # CLI Interface & Demonstration
├── src/                       # Main source code
│   ├── types.ts               # Shared Types and Interfaces
│   ├── BankAccount.ts         # Abstract Base BankAccount Class
│   ├── SavingsAccount.ts      # Savings Account Subclass
│   ├── CurrentAccount.ts      # Current Account Subclass
│   ├── Bank.ts                # Bank Coordinator Class
│   └── storage.ts             # Persistence / Serialization Handler
├── tests/                     # Unit Tests
│   └── bank.test.ts           # Bun Test Suite (16 cases)
├── index.ts                   # Entrypoint (Interactive CLI Dashboard)
├── tsconfig.json              # TypeScript compiler configuration
└── package.json               # Package dependencies configuration
```

---

## Getting Started

### Prerequisites

*   Make sure you have [Bun](https://bun.sh/) installed on your machine.

### Installation

Clone the repository and install the project dependencies:

```bash
bun install
```

### Running the Interactive CLI Dashboard

Start the interactive CLI dashboard:

```bash
bun run index.ts
```

*The CLI automatically loads any existing accounts from `bank_data.json` at startup and auto-saves the database upon exiting.*

### Running the Automated Tests

Execute the unit test suite (testing validations, constraints, interest calculations, overdraft limits, transfers, and persistence):

```bash
bun test
```