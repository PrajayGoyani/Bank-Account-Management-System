import { Bank } from "./src/Bank";
import { SavingsAccount } from "./src/SavingsAccount";
import { CurrentAccount } from "./src/CurrentAccount";
import { join } from "path";

const DATA_FILE = join(import.meta.dir, "bank_data.json");
const bank = new Bank();

async function main() {
  console.clear();
  console.log("==================================================");
  console.log("    WELCOME TO THE BANK ACCOUNT MANAGEMENT SYSTEM   ");
  console.log("==================================================");
  
  // Try to load existing data
  try {
    await bank.loadData(DATA_FILE);
    console.log(`Successfully loaded accounts from database.`);
  } catch (err) {
    console.log("No existing database found or error loading database. Starting fresh.");
  }
  
  await sleep(1500);

  let exit = false;
  while (!exit) {
    printMenu();
    const choice = prompt("\nSelect an option (0-11): ");
    
    if (choice === null) {
      console.log("\nGoodbye!");
      exit = true;
      break;
    }

    try {
      switch (choice.trim()) {
        case "1":
          createSavingsAccount();
          break;
        case "2":
          createCurrentAccount();
          break;
        case "3":
          depositMoney();
          break;
        case "4":
          withdrawMoney();
          break;
        case "5":
          transferFunds();
          break;
        case "6":
          applyInterest();
          break;
        case "7":
          searchAccounts();
          break;
        case "8":
          displayAccountInfo();
          break;
        case "9":
          manageAccountStatus();
          break;
        case "10":
          listAndSortAccounts();
          break;
        case "11":
          await saveDatabase();
          break;
        case "0":
          console.log("\nExiting and saving database...");
          await bank.saveData(DATA_FILE);
          console.log("Data saved. Goodbye!");
          exit = true;
          break;
        default:
          console.log("\n[Error] Invalid option. Please enter a number between 0 and 11.");
          pressEnterToContinue();
      }
    } catch (error: any) {
      console.log(`\n[Error] ${error.message}`);
      pressEnterToContinue();
    }
  }
}

function printMenu() {
  console.clear();
  console.log("==================================================");
  console.log("            BANK MANAGEMENT DASHBOARD             ");
  console.log("==================================================");
  console.log(" 1. Create Savings Account");
  console.log(" 2. Create Current Account");
  console.log(" 3. Deposit Money");
  console.log(" 4. Withdraw Money");
  console.log(" 5. Transfer Funds");
  console.log(" 6. Calculate & Apply Interest (Savings Accounts)");
  console.log(" 7. Search Accounts by Holder Name");
  console.log(" 8. Display Account Details & History");
  console.log(" 9. Manage Account Status (Close/Freeze/Unfreeze)");
  console.log(" 10. Sort & List All Accounts");
  console.log(" 11. Save Database Now");
  console.log(" 0. Save & Exit");
  console.log("==================================================");
}

function createSavingsAccount() {
  console.log("\n--- Create Savings Account ---");
  const name = prompt("Enter account holder name: ");
  if (!name || !name.trim()) throw new Error("Name is required.");
  
  const balanceStr = prompt("Enter initial deposit (default 100): ") || "100";
  const balance = parseFloat(balanceStr);
  if (isNaN(balance)) throw new Error("Invalid deposit amount.");

  const rateStr = prompt("Enter interest rate (e.g., 0.03 for 3%, default 3%): ") || "0.03";
  const rate = parseFloat(rateStr);
  if (isNaN(rate)) throw new Error("Invalid interest rate.");

  const minBalStr = prompt("Enter minimum required balance (default 100): ") || "100";
  const minBal = parseFloat(minBalStr);
  if (isNaN(minBal)) throw new Error("Invalid minimum balance.");

  const account = bank.createSavingsAccount(name, balance, rate, minBal);
  console.log(`\n[Success] Savings Account created successfully!`);
  console.log(`Account Number: ${account.accountNumber}`);
  console.log(`Holder Name:    ${account.accountHolderName}`);
  console.log(`Balance:        $${account.balance.toFixed(2)}`);
  pressEnterToContinue();
}

function createCurrentAccount() {
  console.log("\n--- Create Current Account ---");
  const name = prompt("Enter account holder name: ");
  if (!name || !name.trim()) throw new Error("Name is required.");

  const balanceStr = prompt("Enter initial deposit (default 0): ") || "0";
  const balance = parseFloat(balanceStr);
  if (isNaN(balance)) throw new Error("Invalid deposit amount.");

  const overdraftStr = prompt("Enter overdraft limit (default 500): ") || "500";
  const overdraft = parseFloat(overdraftStr);
  if (isNaN(overdraft)) throw new Error("Invalid overdraft limit.");

  const account = bank.createCurrentAccount(name, balance, overdraft);
  console.log(`\n[Success] Current Account created successfully!`);
  console.log(`Account Number:  ${account.accountNumber}`);
  console.log(`Holder Name:     ${account.accountHolderName}`);
  console.log(`Balance:         $${account.balance.toFixed(2)}`);
  console.log(`Overdraft Limit: $${account.overdraftLimit.toFixed(2)}`);
  pressEnterToContinue();
}

function depositMoney() {
  console.log("\n--- Deposit Money ---");
  const accNum = prompt("Enter account number: ");
  if (!accNum) throw new Error("Account number is required.");

  const account = bank.getAccount(accNum);
  if (!account) throw new Error("Account not found.");

  const amountStr = prompt(`Current Balance: $${account.balance.toFixed(2)}. Enter deposit amount: `);
  if (!amountStr) throw new Error("Amount is required.");
  const amount = parseFloat(amountStr);

  const desc = prompt("Enter deposit description (optional): ") || undefined;

  account.deposit(amount, desc);
  console.log(`\n[Success] Deposited $${amount.toFixed(2)} successfully.`);
  console.log(`New Balance: $${account.balance.toFixed(2)}`);
  pressEnterToContinue();
}

function withdrawMoney() {
  console.log("\n--- Withdraw Money ---");
  const accNum = prompt("Enter account number: ");
  if (!accNum) throw new Error("Account number is required.");

  const account = bank.getAccount(accNum);
  if (!account) throw new Error("Account not found.");

  console.log(`Current Balance: $${account.balance.toFixed(2)}`);
  if (account instanceof CurrentAccount) {
    console.log(`Remaining Overdraft: $${account.remainingOverdraft.toFixed(2)}`);
  } else if (account instanceof SavingsAccount) {
    console.log(`Minimum Balance Required: $${account.minimumBalance.toFixed(2)}`);
  }

  const amountStr = prompt("Enter withdrawal amount: ");
  if (!amountStr) throw new Error("Amount is required.");
  const amount = parseFloat(amountStr);

  const desc = prompt("Enter description (optional): ") || undefined;

  account.withdraw(amount, desc);
  console.log(`\n[Success] Withdrew $${amount.toFixed(2)} successfully.`);
  console.log(`New Balance: $${account.balance.toFixed(2)}`);
  pressEnterToContinue();
}

function transferFunds() {
  console.log("\n--- Transfer Funds ---");
  const fromNum = prompt("Enter source account number: ");
  if (!fromNum) throw new Error("Source account number is required.");

  const toNum = prompt("Enter destination account number: ");
  if (!toNum) throw new Error("Destination account number is required.");

  const amountStr = prompt("Enter transfer amount: ");
  if (!amountStr) throw new Error("Amount is required.");
  const amount = parseFloat(amountStr);

  const desc = prompt("Enter description (optional): ") || "Fund Transfer";

  bank.transferFunds(fromNum, toNum, amount, desc);
  console.log(`\n[Success] Transferred $${amount.toFixed(2)} successfully from ${fromNum} to ${toNum}.`);
  pressEnterToContinue();
}

function applyInterest() {
  console.log("\n--- Apply Interest ---");
  const confirm = prompt("Are you sure you want to apply interest to all Savings accounts? (y/n): ");
  if (confirm?.toLowerCase() === "y") {
    bank.calculateInterest();
    console.log("\n[Success] Interest calculated and credited to all active Savings accounts.");
  } else {
    console.log("\nOperation cancelled.");
  }
  pressEnterToContinue();
}

function searchAccounts() {
  console.log("\n--- Search Accounts by Holder Name ---");
  const query = prompt("Enter search query: ");
  if (!query) throw new Error("Query is required.");

  const results = bank.searchByHolderName(query);
  if (results.length === 0) {
    console.log("\nNo accounts found matching that name.");
  } else {
    console.log(`\nFound ${results.length} account(s):`);
    console.log("--------------------------------------------------");
    results.forEach(acc => {
      console.log(`[${acc.type}] No: ${acc.accountNumber} | Holder: ${acc.accountHolderName} | Balance: $${acc.balance.toFixed(2)} | Status: ${acc.status}`);
    });
    console.log("--------------------------------------------------");
  }
  pressEnterToContinue();
}

function displayAccountInfo() {
  console.log("\n--- Display Account Details & History ---");
  const accNum = prompt("Enter account number: ");
  if (!accNum) throw new Error("Account number is required.");

  const account = bank.getAccount(accNum);
  if (!account) throw new Error("Account not found.");

  const details = account.getDetails();
  console.log("\n==================================================");
  console.log(`Account Number:   ${details.accountNumber}`);
  console.log(`Holder Name:      ${details.accountHolderName}`);
  console.log(`Account Type:     ${details.type}`);
  console.log(`Current Balance:  $${details.balance.toFixed(2)}`);
  console.log(`Creation Date:    ${details.creationDate.toLocaleString()}`);
  console.log(`Account Status:   ${details.status}`);

  if (account instanceof SavingsAccount) {
    console.log(`Interest Rate:    ${(details.interestRate! * 100).toFixed(1)}%`);
    console.log(`Min Required Bal: $${details.minimumBalance!.toFixed(2)}`);
  } else if (account instanceof CurrentAccount) {
    console.log(`Overdraft Limit:  $${details.overdraftLimit!.toFixed(2)}`);
    console.log(`Rem Overdraft:    $${details.remainingOverdraft!.toFixed(2)}`);
  }
  console.log("==================================================");
  
  const showHistory = prompt("Show transaction history? (y/n): ");
  if (showHistory?.toLowerCase() === "y") {
    const history = account.transactionHistory;
    console.log("\n--- Transaction History ---");
    if (history.length === 0) {
      console.log("No transactions recorded.");
    } else {
      history.forEach((tx, idx) => {
        console.log(`${idx + 1}. [${tx.timestamp.toLocaleTimeString()}] ${tx.type.padEnd(12)} | $${tx.amount.toFixed(2).padEnd(8)} | ${tx.description}`);
      });
    }
    console.log("---------------------------------------");
  }
  pressEnterToContinue();
}

function manageAccountStatus() {
  console.log("\n--- Manage Account Status ---");
  const accNum = prompt("Enter account number: ");
  if (!accNum) throw new Error("Account number is required.");

  const account = bank.getAccount(accNum);
  if (!account) throw new Error("Account not found.");

  console.log(`Current Status: ${account.status}`);
  console.log("1. Close Account");
  console.log("2. Freeze Account");
  console.log("3. Unfreeze Account");
  const action = prompt("Select action (1-3): ");

  if (action === "1") {
    bank.closeAccount(accNum);
    console.log(`\n[Success] Account ${accNum} has been closed.`);
  } else if (action === "2") {
    bank.freezeAccount(accNum);
    console.log(`\n[Success] Account ${accNum} has been frozen.`);
  } else if (action === "3") {
    bank.unfreezeAccount(accNum);
    console.log(`\n[Success] Account ${accNum} has been unfrozen.`);
  } else {
    console.log("\nInvalid option.");
  }
  pressEnterToContinue();
}

function listAndSortAccounts() {
  console.log("\n--- List & Sort Accounts ---");
  console.log("Sort by:");
  console.log("1. Balance (Highest to Lowest)");
  console.log("2. Balance (Lowest to Highest)");
  console.log("3. Account Holder Name (A-Z)");
  console.log("4. Account Holder Name (Z-A)");
  const option = prompt("Select option (default 1): ") || "1";

  let sorted: any[] = [];
  if (option === "1") {
    sorted = bank.sortAccounts("balance", "desc");
  } else if (option === "2") {
    sorted = bank.sortAccounts("balance", "asc");
  } else if (option === "3") {
    sorted = bank.sortAccounts("holderName", "asc");
  } else if (option === "4") {
    sorted = bank.sortAccounts("holderName", "desc");
  } else {
    throw new Error("Invalid sorting option.");
  }

  console.log("\nSorted Accounts:");
  console.log("----------------------------------------------------------------------");
  sorted.forEach(acc => {
    console.log(`[${acc.type.padEnd(7)}] No: ${acc.accountNumber} | Holder: ${acc.accountHolderName.padEnd(15)} | Balance: $${acc.balance.toFixed(2).padEnd(10)} | Status: ${acc.status}`);
  });
  console.log("----------------------------------------------------------------------");
  pressEnterToContinue();
}

async function saveDatabase() {
  await bank.saveData(DATA_FILE);
  console.log(`\n[Success] Database successfully saved to: ${DATA_FILE}`);
  pressEnterToContinue();
}

function pressEnterToContinue() {
  prompt("\nPress Enter to continue...");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start CLI
main();
