import React from 'react';
import { render } from 'ink';
import { join } from 'path';
import { BankApp } from './src/components/BankApp';

const DATA_FILE = join(import.meta.dir, 'bank_data.json');

render(<BankApp dataFile={DATA_FILE} />);
