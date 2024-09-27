import React, { useState, useCallback, ChangeEvent } from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const operators = ['S', 'C', 'Z', 'J'] as const;
type Operator = typeof operators[number];

interface Instruction {
  id: number;
  operator: Operator;
  params: number[];
}

const URMProgramCreator: React.FC = () => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | ''>('');
  const [params, setParams] = useState<string[]>(['', '', '']);
  const [safetyLimit, setSafetyLimit] = useState<number>(10000);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const addInstruction = useCallback(() => {
    if (selectedOperator) {
      setInstructions(prevInstructions => [
        ...prevInstructions,
        {
          id: Date.now(),
          operator: selectedOperator,
          params: params.slice(0, getParamCount(selectedOperator)).map(Number),
        }
      ]);
      setSelectedOperator('');
      setParams(['', '', '']);
      setErrorMessage('');
    }
  }, [selectedOperator, params]);

  const removeInstruction = useCallback((id: number) => {
    setInstructions(prevInstructions => 
      prevInstructions.filter(instruction => instruction.id !== id)
    );
  }, []);

  const moveInstruction = useCallback((index: number, direction: 'up' | 'down') => {
    setInstructions(prevInstructions => {
      const newInstructions = [...prevInstructions];
      if (direction === 'up' && index > 0) {
        [newInstructions[index - 1], newInstructions[index]] = [newInstructions[index], newInstructions[index - 1]];
      } else if (direction === 'down' && index < newInstructions.length - 1) {
        [newInstructions[index], newInstructions[index + 1]] = [newInstructions[index + 1], newInstructions[index]];
      }
      return newInstructions;
    });
  }, []);

  const getParamCount = (operator: Operator): number => {
    switch (operator) {
      case 'S':
      case 'Z':
        return 1;
      case 'C':
        return 2;
      case 'J':
        return 3;
      default:
        return 0;
    }
  };

  const handleParamChange = (index: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return; // 不允许负数

    setParams(prevParams => {
      const newParams = [...prevParams];
      newParams[index] = value;
      return newParams;
    });
  };

  const handleSafetyLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSafetyLimit(value);
    }
  };

  const handleSubmit = () => {
    if (instructions.length === 0) {
      setErrorMessage('Cannot submit an empty program. Please add at least one instruction.');
      return;
    }

    const program = {
      instructions: instructions.map(({ operator, params }) => ({ operator, params })),
      safetyLimit
    };
    console.log(JSON.stringify(program, null, 2));
    setErrorMessage(''); // Clear any previous error message
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">URM Program Creator</h1>
      
      <div className="mb-4 p-4 border rounded">
        <div className="flex items-end space-x-2 mb-4">
          <select
            value={selectedOperator}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedOperator(e.target.value as Operator)}
            className="border p-2 rounded"
          >
            <option value="">Select operator</option>
            {operators.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          {[...Array(getParamCount(selectedOperator as Operator))].map((_, index) => (
            <input
              key={index}
              type="number"
              min="0"
              placeholder={`Param ${index + 1}`}
              value={params[index]}
              onChange={(e) => handleParamChange(index, e.target.value)}
              className="border p-2 rounded w-20"
            />
          ))}
          <button onClick={addInstruction} className="bg-blue-500 text-white p-2 rounded">Add</button>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {instructions.map((instruction, index) => (
          <li key={instruction.id} className="bg-white p-2 rounded shadow flex items-center">
            <span className="w-8 text-right mr-4 font-bold">{index + 1}.</span>
            <span className="flex-grow">{`${instruction.operator}(${instruction.params.join(',')})`}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => moveInstruction(index, 'up')}
                disabled={index === 0}
                className="text-gray-500 disabled:text-gray-300"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => moveInstruction(index, 'down')}
                disabled={index === instructions.length - 1}
                className="text-gray-500 disabled:text-gray-300"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeInstruction(instruction.id)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center">
          <span className="mr-2">Safety Limit:</span>
          <input
            type="number"
            min="1"
            value={safetyLimit}
            onChange={handleSafetyLimitChange}
            className="border p-2 rounded w-24"
          />
        </label>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white p-2 rounded"
        >
          Submit
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default URMProgramCreator;