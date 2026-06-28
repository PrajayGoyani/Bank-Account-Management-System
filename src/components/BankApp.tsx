import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { Bank } from '../Bank';
import { SavingsAccount } from '../SavingsAccount';
import { CurrentAccount } from '../CurrentAccount';
import { InteractiveForm, type FormField } from './InteractiveForm';
import { AccountList } from './AccountList';

type Screen =
  | 'LOADING'
  | 'MENU'
  | 'CREATE_SAVINGS'
  | 'CREATE_CURRENT'
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'TRANSFER'
  | 'APPLY_INTEREST'
  | 'SEARCH_FORM'
  | 'SEARCH'
  | 'DISPLAY_INFO_FORM'
  | 'DISPLAY_INFO'
  | 'DISPLAY_INFO_SELECTED'
  | 'DISPLAY_HISTORY'
  | 'MANAGE_STATUS_FORM'
  | 'MANAGE_STATUS'
  | 'LIST_ACCOUNTS_SORT_SELECT'
  | 'LIST_ACCOUNTS'
  | 'SAVE_DATABASE'
  | 'STATUS_MESSAGE';

interface BankAppProps {
  dataFile: string;
}

export function BankApp({ dataFile }: BankAppProps) {
  const [bank] = useState(() => new Bank());
  const [screen, setScreen] = useState<Screen>('LOADING');
  const [loadingStatus, setLoadingStatus] = useState('Initializing Bank Management System...');
  
  // Status message screen state
  const [statusTitle, setStatusTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Search screen state
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Detailed view state
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // List accounts state
  const [sortedAccounts, setSortedAccounts] = useState<any[]>([]);

  const { exit } = useApp();

  // Load database on start
  useEffect(() => {
    async function loadData() {
      try {
        await bank.loadData(dataFile);
        setLoadingStatus('Database loaded successfully!');
      } catch (err) {
        setLoadingStatus('No existing database found. Starting fresh.');
      }
      setTimeout(() => {
        setScreen('MENU');
      }, 1200);
    }
    loadData();
  }, [bank, dataFile]);

  // Global ESC to menu handling (except when in forms or loading)
  useInput((_input, key) => {
    if (key.escape && screen !== 'LOADING' && screen !== 'MENU') {
      setScreen('MENU');
    }
  });

  const showStatus = (title: string, msg: string, success: boolean = true) => {
    setStatusTitle(title);
    setStatusMessage(msg);
    setIsSuccess(success);
    setScreen('STATUS_MESSAGE');
  };

  const handleMainMenuSelect = async (item: { label: string; value: string }) => {
    if (item.value === 'EXIT') {
      try {
        await bank.saveData(dataFile);
        showStatus('System Exit', 'Database saved. Goodbye!', true);
        setTimeout(() => {
          exit();
        }, 1000);
      } catch (err: any) {
        showStatus('System Exit Error', `Failed to save: ${err.message}`, false);
      }
      return;
    }

    setScreen(item.value as Screen);
  };

  // Helper validators
  const validateFloat = (val: string) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed >= 0 ? true : "Must be a valid positive number.";
  };

  const validateFloatPositive = (val: string) => {
    const parsed = parseFloat(val);
    return !isNaN(parsed) && parsed > 0 ? true : "Must be a number greater than 0.";
  };

  // 1. Create Savings
  const handleCreateSavings = (data: Record<string, string>) => {
    try {
      const name = data['name']!;
      const balance = parseFloat(data['balance'] || '100');
      const rate = parseFloat(data['rate'] || '0.03');
      const minBal = parseFloat(data['minBal'] || '100');
      
      const account = bank.createSavingsAccount(name, balance, rate, minBal);
      showStatus(
        'Account Created',
        `Savings Account created successfully!\nAccount No: ${account.accountNumber}\nHolder: ${account.accountHolderName}\nBalance: $${account.balance.toFixed(2)}`
      );
    } catch (err: any) {
      showStatus('Error Creating Account', err.message, false);
    }
  };

  // 2. Create Current
  const handleCreateCurrent = (data: Record<string, string>) => {
    try {
      const name = data['name']!;
      const balance = parseFloat(data['balance'] || '0');
      const overdraft = parseFloat(data['overdraft'] || '500');

      const account = bank.createCurrentAccount(name, balance, overdraft);
      showStatus(
        'Account Created',
        `Current Account created successfully!\nAccount No: ${account.accountNumber}\nHolder: ${account.accountHolderName}\nBalance: $${account.balance.toFixed(2)}\nOverdraft Limit: $${account.overdraftLimit.toFixed(2)}`
      );
    } catch (err: any) {
      showStatus('Error Creating Account', err.message, false);
    }
  };

  // 3. Deposit
  const handleDeposit = (data: Record<string, string>) => {
    try {
      const accNum = data['accNum']!;
      const amount = parseFloat(data['amount']!);
      const desc = data['desc'] || 'Deposit';

      const account = bank.getAccount(accNum);
      if (!account) throw new Error('Account not found.');

      account.deposit(amount, desc);
      showStatus(
        'Deposit Successful',
        `Deposited $${amount.toFixed(2)} to ${accNum}.\nNew Balance: $${account.balance.toFixed(2)}`
      );
    } catch (err: any) {
      showStatus('Deposit Failed', err.message, false);
    }
  };

  // 4. Withdraw
  const handleWithdraw = (data: Record<string, string>) => {
    try {
      const accNum = data['accNum']!;
      const amount = parseFloat(data['amount']!);
      const desc = data['desc'] || 'Withdrawal';

      const account = bank.getAccount(accNum);
      if (!account) throw new Error('Account not found.');

      account.withdraw(amount, desc);
      showStatus(
        'Withdrawal Successful',
        `Withdrew $${amount.toFixed(2)} from ${accNum}.\nNew Balance: $${account.balance.toFixed(2)}`
      );
    } catch (err: any) {
      showStatus('Withdrawal Failed', err.message, false);
    }
  };

  // 5. Transfer
  const handleTransfer = (data: Record<string, string>) => {
    try {
      const fromAcc = data['fromAcc']!;
      const toAcc = data['toAcc']!;
      const amount = parseFloat(data['amount']!);
      const desc = data['desc'] || 'Fund Transfer';

      bank.transferFunds(fromAcc, toAcc, amount, desc);
      showStatus(
        'Transfer Successful',
        `Transferred $${amount.toFixed(2)} from ${fromAcc} to ${toAcc} successfully.`
      );
    } catch (err: any) {
      showStatus('Transfer Failed', err.message, false);
    }
  };

  // 6. Calculate & Apply Interest
  const handleApplyInterestSelect = (item: { label: string; value: string }) => {
    if (item.value === 'yes') {
      try {
        bank.calculateInterest();
        showStatus('Interest Applied', 'Interest calculated and credited to all active Savings accounts.');
      } catch (err: any) {
        showStatus('Interest Failed', err.message, false);
      }
    } else {
      setScreen('MENU');
    }
  };

  // 7. Search
  const handleSearch = (data: Record<string, string>) => {
    const query = data['query']!;
    const results = bank.searchByHolderName(query);
    setSearchResults(results);
    setScreen('SEARCH'); // Change screen to view search results
  };

  // 8. Account Details
  const handleDisplayInfo = (data: Record<string, string>) => {
    const accNum = data['accNum']!;
    const account = bank.getAccount(accNum);
    if (!account) {
      showStatus('Account Not Found', `No account exists with account number: ${accNum}`, false);
    } else {
      setSelectedAccount(account);
      setScreen('DISPLAY_INFO_SELECTED');
    }
  };

  const handleInfoActionSelect = (item: { label: string; value: string }) => {
    if (item.value === 'history') {
      setScreen('DISPLAY_HISTORY');
    } else {
      setScreen('MENU');
    }
  };

  // 9. Manage Account Status
  const [statusAccNum, setStatusAccNum] = useState('');
  const handleStatusAccSearch = (data: Record<string, string>) => {
    const accNum = data['accNum']!;
    const account = bank.getAccount(accNum);
    if (!account) {
      showStatus('Account Not Found', `No account exists with account number: ${accNum}`, false);
    } else {
      setStatusAccNum(accNum);
      setSelectedAccount(account);
      setScreen('MANAGE_STATUS'); // Advance to status modification
    }
  };

  const handleStatusActionSelect = (item: { label: string; value: string }) => {
    if (item.value === 'cancel') {
      setScreen('MENU');
      return;
    }
    try {
      if (item.value === 'close') {
        bank.closeAccount(statusAccNum);
        showStatus('Status Updated', `Account ${statusAccNum} has been closed.`);
      } else if (item.value === 'freeze') {
        bank.freezeAccount(statusAccNum);
        showStatus('Status Updated', `Account ${statusAccNum} has been frozen.`);
      } else if (item.value === 'unfreeze') {
        bank.unfreezeAccount(statusAccNum);
        showStatus('Status Updated', `Account ${statusAccNum} has been unfrozen.`);
      }
    } catch (err: any) {
      showStatus('Status Update Failed', err.message, false);
    }
  };

  // 10. Sort & List Accounts
  const handleSortSelect = (item: { label: string; value: string }) => {
    let sorted: any[] = [];
    if (item.value === 'bal_desc') {
      sorted = bank.sortAccounts('balance', 'desc');
    } else if (item.value === 'bal_asc') {
      sorted = bank.sortAccounts('balance', 'asc');
    } else if (item.value === 'name_asc') {
      sorted = bank.sortAccounts('holderName', 'asc');
    } else if (item.value === 'name_desc') {
      sorted = bank.sortAccounts('holderName', 'desc');
    }
    setSortedAccounts(sorted);
    setScreen('LIST_ACCOUNTS');
  };

  // 11. Save Database
  const handleSaveDatabaseSelect = async (item: { label: string; value: string }) => {
    if (item.value === 'yes') {
      try {
        await bank.saveData(dataFile);
        showStatus('Save Successful', `Database saved successfully to:\n${dataFile}`);
      } catch (err: any) {
        showStatus('Save Failed', err.message, false);
      }
    } else {
      setScreen('MENU');
    }
  };

  // Enter handler on message screens
  useInput((_input, key) => {
    if (key.return) {
      if (screen === 'STATUS_MESSAGE') {
        setScreen('MENU');
      } else if (screen === 'SEARCH') {
        setScreen('MENU');
      } else if (screen === 'LIST_ACCOUNTS') {
        setScreen('MENU');
      } else if (screen === 'DISPLAY_HISTORY') {
        setScreen('DISPLAY_INFO_SELECTED');
      }
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Title Header */}
      <Box borderStyle="double" borderColor="yellow" padding={1} width={80} justifyContent="center" marginBottom={1}>
        <Text bold color="yellow">BANK ACCOUNT MANAGEMENT SYSTEM</Text>
      </Box>

      {/* Screen Loader / Flow Router */}
      {screen === 'LOADING' && (
        <Box borderStyle="round" borderColor="gray" padding={1} width={80}>
          <Text color="cyan">{loadingStatus}</Text>
        </Box>
      )}

      {screen === 'MENU' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold color="green">Select a dashboard option below:</Text>
          </Box>
          <SelectInput
            items={[
              { label: ' 1. Create Savings Account', value: 'CREATE_SAVINGS' },
              { label: ' 2. Create Current Account', value: 'CREATE_CURRENT' },
              { label: ' 3. Deposit Money', value: 'DEPOSIT' },
              { label: ' 4. Withdraw Money', value: 'WITHDRAW' },
              { label: ' 5. Transfer Funds', value: 'TRANSFER' },
              { label: ' 6. Calculate & Apply Interest (Savings)', value: 'APPLY_INTEREST' },
              { label: ' 7. Search Accounts by Holder Name', value: 'SEARCH_FORM' },
              { label: ' 8. Display Account Details & History', value: 'DISPLAY_INFO_FORM' },
              { label: ' 9. Manage Account Status', value: 'MANAGE_STATUS_FORM' },
              { label: '10. Sort & List All Accounts', value: 'LIST_ACCOUNTS_SORT_SELECT' },
              { label: '11. Save Database Now', value: 'SAVE_DATABASE' },
              { label: ' 0. Save & Exit', value: 'EXIT' },
            ]}
            onSelect={handleMainMenuSelect}
          />
        </Box>
      )}

      {screen === 'CREATE_SAVINGS' && (
        <InteractiveForm
          title="Create Savings Account"
          fields={[
            { key: 'name', label: 'Enter account holder name', validate: (v) => v.trim() !== '' || "Name cannot be empty." },
            { key: 'balance', label: 'Initial deposit (default 100)', defaultValue: '100', validate: validateFloat },
            { key: 'rate', label: 'Interest rate (e.g. 0.03, default 3%)', defaultValue: '0.03', validate: validateFloat },
            { key: 'minBal', label: 'Minimum required balance (default 100)', defaultValue: '100', validate: validateFloat },
          ]}
          onSubmit={handleCreateSavings}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'CREATE_CURRENT' && (
        <InteractiveForm
          title="Create Current Account"
          fields={[
            { key: 'name', label: 'Enter account holder name', validate: (v) => v.trim() !== '' || "Name cannot be empty." },
            { key: 'balance', label: 'Initial deposit (default 0)', defaultValue: '0', validate: validateFloat },
            { key: 'overdraft', label: 'Overdraft limit (default 500)', defaultValue: '500', validate: validateFloat },
          ]}
          onSubmit={handleCreateCurrent}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'DEPOSIT' && (
        <InteractiveForm
          title="Deposit Money"
          fields={[
            { key: 'accNum', label: 'Enter account number', validate: (v) => v.trim() !== '' || "Account number is required." },
            { key: 'amount', label: 'Enter deposit amount', validate: validateFloatPositive },
            { key: 'desc', label: 'Enter description (optional)', defaultValue: 'Deposit' },
          ]}
          onSubmit={handleDeposit}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'WITHDRAW' && (
        <InteractiveForm
          title="Withdraw Money"
          fields={[
            { key: 'accNum', label: 'Enter account number', validate: (v) => v.trim() !== '' || "Account number is required." },
            { key: 'amount', label: 'Enter withdrawal amount', validate: validateFloatPositive },
            { key: 'desc', label: 'Enter description (optional)', defaultValue: 'Withdrawal' },
          ]}
          onSubmit={handleWithdraw}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'TRANSFER' && (
        <InteractiveForm
          title="Transfer Funds"
          fields={[
            { key: 'fromAcc', label: 'Enter source account number', validate: (v) => v.trim() !== '' || "Source account is required." },
            { key: 'toAcc', label: 'Enter destination account number', validate: (v) => v.trim() !== '' || "Destination account is required." },
            { key: 'amount', label: 'Enter transfer amount', validate: validateFloatPositive },
            { key: 'desc', label: 'Enter description (optional)', defaultValue: 'Fund Transfer' },
          ]}
          onSubmit={handleTransfer}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'APPLY_INTEREST' && (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1} width={60}>
          <Text bold color="yellow">--- Apply Interest ---</Text>
          <Box marginTop={1} marginBottom={1}>
            <Text>Are you sure you want to apply interest to all active Savings accounts?</Text>
          </Box>
          <SelectInput
            items={[
              { label: 'Yes, Apply Interest', value: 'yes' },
              { label: 'No, Cancel', value: 'no' },
            ]}
            onSelect={handleApplyInterestSelect}
          />
        </Box>
      )}

      {screen === 'SEARCH_FORM' && (
        <InteractiveForm
          title="Search Accounts"
          fields={[
            { key: 'query', label: 'Enter holder name query', validate: (v) => v.trim() !== '' || "Query cannot be empty." },
          ]}
          onSubmit={handleSearch}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'SEARCH' && (
        <Box flexDirection="column">
          <Text bold color="yellow">Search Results:</Text>
          <AccountList accounts={searchResults} />
          <Box marginTop={1}>
            <Text color="dim">[Press ENTER to return to menu]</Text>
          </Box>
        </Box>
      )}

      {screen === 'DISPLAY_INFO_FORM' && (
        <InteractiveForm
          title="Account Details"
          fields={[
            { key: 'accNum', label: 'Enter account number', validate: (v) => v.trim() !== '' || "Account number is required." },
          ]}
          onSubmit={handleDisplayInfo}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'DISPLAY_INFO_SELECTED' && selectedAccount && (
        <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1} width={60}>
          <Text bold color="yellow">--- Account Details ---</Text>
          <Box marginTop={1}>
            <Box width={22}><Text color="gray">Account Number:</Text></Box>
            <Text bold color="cyan">{selectedAccount.accountNumber}</Text>
          </Box>
          <Box>
            <Box width={22}><Text color="gray">Holder Name:</Text></Box>
            <Text>{selectedAccount.accountHolderName}</Text>
          </Box>
          <Box>
            <Box width={22}><Text color="gray">Account Type:</Text></Box>
            <Text color="cyan">{selectedAccount.type}</Text>
          </Box>
          <Box>
            <Box width={22}><Text color="gray">Current Balance:</Text></Box>
            <Text color="green">${selectedAccount.balance.toFixed(2)}</Text>
          </Box>
          <Box>
            <Box width={22}><Text color="gray">Account Status:</Text></Box>
            <Text color={selectedAccount.status === 'Active' ? 'green' : 'red'}>{selectedAccount.status}</Text>
          </Box>
          <Box>
            <Box width={22}><Text color="gray">Creation Date:</Text></Box>
            <Text>{new Date(selectedAccount.creationDate).toLocaleString()}</Text>
          </Box>

          {selectedAccount instanceof SavingsAccount && (
            <Box flexDirection="column">
              <Box>
                <Box width={22}><Text color="gray">Interest Rate:</Text></Box>
                <Text>{(selectedAccount.getDetails().interestRate! * 100).toFixed(1)}%</Text>
              </Box>
              <Box>
                <Box width={22}><Text color="gray">Min Required Bal:</Text></Box>
                <Text>${selectedAccount.minimumBalance.toFixed(2)}</Text>
              </Box>
            </Box>
          )}

          {selectedAccount instanceof CurrentAccount && (
            <Box flexDirection="column">
              <Box>
                <Box width={22}><Text color="gray">Overdraft Limit:</Text></Box>
                <Text>${selectedAccount.overdraftLimit.toFixed(2)}</Text>
              </Box>
              <Box>
                <Box width={22}><Text color="gray">Remaining Overdraft:</Text></Box>
                <Text>${selectedAccount.remainingOverdraft.toFixed(2)}</Text>
              </Box>
            </Box>
          )}

          <Box marginTop={1} flexDirection="column">
            <Text bold color="yellow">Select Action:</Text>
            <SelectInput
              items={[
                { label: 'View Transaction History', value: 'history' },
                { label: 'Back to Menu', value: 'menu' },
              ]}
              onSelect={handleInfoActionSelect}
            />
          </Box>
        </Box>
      )}

      {screen === 'DISPLAY_HISTORY' && selectedAccount && (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1} width={80}>
          <Text bold color="yellow">--- Transaction History for {selectedAccount.accountNumber} ---</Text>
          {selectedAccount.transactionHistory.length === 0 ? (
            <Box marginTop={1}>
              <Text color="gray">No transactions recorded.</Text>
            </Box>
          ) : (
            <Box flexDirection="column" marginTop={1}>
              <Box borderStyle="single" borderColor="gray" borderBottom={true} borderTop={false} borderLeft={false} borderRight={false}>
                <Box width={12}><Text bold>Time</Text></Box>
                <Box width={15}><Text bold>Type</Text></Box>
                <Box width={12}><Text bold>Amount</Text></Box>
                <Box width={30}><Text bold>Description</Text></Box>
              </Box>
              {selectedAccount.transactionHistory.map((tx: any) => (
                <Box key={tx.id}>
                  <Box width={12}><Text>{new Date(tx.timestamp).toLocaleTimeString()}</Text></Box>
                  <Box width={15}><Text color="cyan">{tx.type}</Text></Box>
                  <Box width={12}>
                    <Text color={tx.type.includes('Deposit') || tx.type.includes('In') || tx.type.includes('Interest') ? 'green' : 'red'}>
                      ${tx.amount.toFixed(2)}
                    </Text>
                  </Box>
                  <Box width={30}><Text>{tx.description}</Text></Box>
                </Box>
              ))}
            </Box>
          )}
          <Box marginTop={1}>
            <Text color="dim">[Press ENTER to return to account details]</Text>
          </Box>
        </Box>
      )}

      {screen === 'MANAGE_STATUS_FORM' && (
        <InteractiveForm
          title="Search Account for Status Change"
          fields={[
            { key: 'accNum', label: 'Enter account number', validate: (v) => v.trim() !== '' || "Account number is required." },
          ]}
          onSubmit={handleStatusAccSearch}
          onCancel={() => setScreen('MENU')}
        />
      )}

      {screen === 'MANAGE_STATUS' && selectedAccount && (
        <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1} width={60}>
          <Text bold color="yellow">--- Manage Account Status ---</Text>
          <Box marginTop={1}>
            <Text>Account No: {selectedAccount.accountNumber}</Text>
          </Box>
          <Text>Holder:     {selectedAccount.accountHolderName}</Text>
          <Box marginBottom={1}>
            <Text>Current Status: <Text color={selectedAccount.status === 'Active' ? 'green' : 'red'} bold>{selectedAccount.status}</Text></Text>
          </Box>
          
          <SelectInput
            items={[
              { label: 'Close Account', value: 'close' },
              { label: 'Freeze Account', value: 'freeze' },
              { label: 'Unfreeze Account', value: 'unfreeze' },
              { label: 'Cancel', value: 'cancel' },
            ]}
            onSelect={handleStatusActionSelect}
          />
        </Box>
      )}

      {screen === 'LIST_ACCOUNTS_SORT_SELECT' && (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1} width={60}>
          <Text bold color="yellow">--- Sort & List Accounts ---</Text>
          <Box marginTop={1} marginBottom={1}>
            <Text>Choose sorting method:</Text>
          </Box>
          <SelectInput
            items={[
              { label: 'Balance (Highest to Lowest)', value: 'bal_desc' },
              { label: 'Balance (Lowest to Highest)', value: 'bal_asc' },
              { label: 'Holder Name (A-Z)', value: 'name_asc' },
              { label: 'Holder Name (Z-A)', value: 'name_desc' },
            ]}
            onSelect={handleSortSelect}
          />
        </Box>
      )}

      {screen === 'LIST_ACCOUNTS' && (
        <Box flexDirection="column">
          <Text bold color="yellow">All Accounts:</Text>
          <AccountList accounts={sortedAccounts} />
          <Box marginTop={1}>
            <Text color="dim">[Press ENTER to return to menu]</Text>
          </Box>
        </Box>
      )}

      {screen === 'SAVE_DATABASE' && (
        <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1} width={60}>
          <Text bold color="yellow">--- Save Database ---</Text>
          <Box marginTop={1} marginBottom={1}>
            <Text>Save changes to disk now?</Text>
          </Box>
          <SelectInput
            items={[
              { label: 'Yes, Save Now', value: 'yes' },
              { label: 'No, Cancel', value: 'no' },
            ]}
            onSelect={handleSaveDatabaseSelect}
          />
        </Box>
      )}

      {screen === 'STATUS_MESSAGE' && (
        <Box
          flexDirection="column"
          borderStyle="classic"
          borderColor={isSuccess ? 'green' : 'red'}
          padding={1}
          width={60}
        >
          <Text bold color={isSuccess ? 'green' : 'red'}>
            [{isSuccess ? 'SUCCESS' : 'ERROR'}] {statusTitle}
          </Text>
          <Box marginTop={1} marginBottom={1}>
            <Text>{statusMessage}</Text>
          </Box>
          <Text color="dim">[Press ENTER to return to menu]</Text>
        </Box>
      )}
    </Box>
  );
}
