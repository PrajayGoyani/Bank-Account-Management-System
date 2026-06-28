import React from 'react';
import { Box, Text } from 'ink';
import type { BankAccount } from '../BankAccount';
import { SavingsAccount } from '../SavingsAccount';
import { CurrentAccount } from '../CurrentAccount';

interface AccountListProps {
  accounts: BankAccount[];
}

export function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <Box padding={1}>
        <Text color="yellow">No accounts found.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" padding={1} width={80}>
      <Box borderStyle="single" borderColor="gray" borderBottom={true} borderTop={false} borderLeft={false} borderRight={false} paddingBottom={0}>
        <Box width={10}><Text bold color="yellow">[Type]</Text></Box>
        <Box width={12}><Text bold color="yellow">Account No</Text></Box>
        <Box width={20}><Text bold color="yellow">Holder Name</Text></Box>
        <Box width={12}><Text bold color="yellow">Balance</Text></Box>
        <Box width={10}><Text bold color="yellow">Status</Text></Box>
        <Box width={12}><Text bold color="yellow">Details</Text></Box>
      </Box>

      {accounts.map((acc) => {
        const details = acc.getDetails();
        let extraInfo = '';
        if (acc instanceof SavingsAccount) {
          extraInfo = `Rate: ${(details.interestRate! * 100).toFixed(0)}%`;
        } else if (acc instanceof CurrentAccount) {
          extraInfo = `O/D: $${details.overdraftLimit?.toFixed(0)}`;
        }

        let statusColor = 'green';
        if (details.status === 'Frozen') statusColor = 'blue';
        if (details.status === 'Closed') statusColor = 'red';

        return (
          <Box key={details.accountNumber} marginTop={0}>
            <Box width={10}><Text color="cyan">{details.type}</Text></Box>
            <Box width={12}><Text>{details.accountNumber}</Text></Box>
            <Box width={20}><Text>{details.accountHolderName}</Text></Box>
            <Box width={12}><Text color="green">${details.balance.toFixed(2)}</Text></Box>
            <Box width={10}><Text color={statusColor}>{details.status}</Text></Box>
            <Box width={12}><Text color="dim">{extraInfo}</Text></Box>
          </Box>
        );
      })}
    </Box>
  );
}
