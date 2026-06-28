import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

export interface FormField {
  key: string;
  label: string;
  defaultValue?: string;
  validate?: (val: string) => boolean | string;
}

interface InteractiveFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}

export function InteractiveForm({ title, fields, onSubmit, onCancel }: InteractiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState(fields[currentStep]?.defaultValue || "");
  const [error, setError] = useState<string | null>(null);

  // Allow canceling the form using Escape
  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  const currentField = fields[currentStep];

  const handleEnter = (value: string) => {
    const val = value.trim() || currentField?.defaultValue || "";
    
    if (currentField?.validate) {
      const validationResult = currentField.validate(val);
      if (typeof validationResult === 'string') {
        setError(validationResult);
        return;
      } else if (validationResult === false) {
        setError("Invalid input value.");
        return;
      }
    }

    const updatedValues = { ...values, [currentField!.key]: val };
    setValues(updatedValues);
    setError(null);

    if (currentStep < fields.length - 1) {
      const nextField = fields[currentStep + 1];
      setCurrentStep(currentStep + 1);
      setInputValue(nextField?.defaultValue || "");
    } else {
      onSubmit(updatedValues);
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1} width={60}>
      <Text bold color="yellow">--- {title} ---</Text>
      
      {/* Show completed fields */}
      {fields.slice(0, currentStep).map((f) => (
        <Box key={f.key} marginTop={0}>
          <Box width={30}>
            <Text color="gray">{f.label}:</Text>
          </Box>
          <Text color="green">{values[f.key]}</Text>
        </Box>
      ))}

      {/* Show current field input */}
      {currentField && (
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Box width={30}>
              <Text bold color="cyan">{currentField.label}:</Text>
            </Box>
            <TextInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleEnter}
            />
          </Box>
          {error && (
            <Box marginTop={0}>
              <Text color="red" bold>[!] {error}</Text>
            </Box>
          )}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="dim">[Press ESC to cancel / go back to menu]</Text>
      </Box>
    </Box>
  );
}
