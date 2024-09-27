import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

// Types
type Operator = 'S' | 'C' | 'Z' | 'J';

interface Instruction {
  id: number;
  operator: Operator;
  params: number[];
}

interface DataItem {
  values: number[];
  instruction: string;
  step: number;
}

interface URMProgram {
  instructions: { operator: Operator; params: number[] }[];
}

interface APIResponse {
  result?: {
    registers_from_steps: number[][];
    ops_from_steps: string[];
    serialized_program: {
      instructions: { operator: Operator; params: number[] }[];
      safetyLimit: number;
    };
  };
  error?: string;
}

// URMProgramCreator Component
interface URMProgramCreatorProps {
  handleSubmit: (program: URMProgram) => void;
  savedInstructions: Instruction[];
}

const URMProgramCreator: React.FC<URMProgramCreatorProps> = ({ handleSubmit, savedInstructions }) => {
  const [instructions, setInstructions] = useState<Instruction[]>(savedInstructions);
  const [selectedOperator, setSelectedOperator] = useState<Operator | ''>('');
  const [params, setParams] = useState<string[]>(['', '', '']);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const operators: Operator[] = ['S', 'C', 'Z', 'J'];

  useEffect(() => {
    setInstructions(savedInstructions);
  }, [savedInstructions]);

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
    if (isNaN(numValue) || numValue < 0) return;

    setParams(prevParams => {
      const newParams = [...prevParams];
      newParams[index] = value;
      return newParams;
    });
  };

  const onSubmit = () => {
    if (instructions.length === 0) {
      setErrorMessage('Cannot submit an empty program. Please add at least one instruction.');
      return;
    }

    const program: URMProgram = {
      instructions: instructions.map(({ operator, params }) => ({ operator, params })),
    };
    handleSubmit(program);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">URM Program Creator</h1>
      
      <div className="mb-4 p-4 border rounded">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {operators.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOperator(op)}
              className={`w-full h-20 text-2xl font-bold rounded-lg transition-colors ${
                selectedOperator === op
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
        <div className="flex flex-col space-y-2 mb-4">
          {selectedOperator && [...Array(getParamCount(selectedOperator))].map((_, index) => (
            <input
              key={index}
              type="number"
              min="0"
              placeholder={`Param ${index + 1}`}
              value={params[index]}
              onChange={(e) => handleParamChange(index, e.target.value)}
              className="border p-2 rounded w-full"
            />
          ))}
          <button 
            onClick={addInstruction}
            disabled={!selectedOperator}
            className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed w-full text-center"
          >
            Add
          </button>
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

      <div className="mb-4">
        <button
          onClick={onSubmit}
          className="bg-green-500 text-white p-2 rounded w-full text-center"
        >
          Build URM Instructions
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

// URMSequenceVisualization Component
interface URMSequenceVisualizationProps {
  onBackToCreator: () => void;
  program: URMProgram;
  initialRegisterCount: number;
}

const URMSequenceVisualization: React.FC<URMSequenceVisualizationProps> = ({ 
  onBackToCreator, 
  program,
  initialRegisterCount
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [initialRegisters, setInitialRegisters] = useState<number[]>(Array(initialRegisterCount).fill(0));
  const [data, setData] = useState<DataItem[]>([]);
  const [serializedProgram, setSerializedProgram] = useState<URMProgram | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyLimit, setSafetyLimit] = useState<number>(10000);
  const [finalResult, setFinalResult] = useState<number[] | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  useEffect(() => {
    console.log('Current instruction:', getCurrentInstruction());
    console.log('Serialized program:', serializedProgram);
  }, [currentStep, serializedProgram]);

  const handleRegisterChange = (index: number, value: string) => {
    const newValue = parseInt(value) || 0;
    setInitialRegisters(prev => {
      const newRegisters = [...prev];
      newRegisters[index] = newValue;
      return newRegisters;
    });
  };

  const handleSafetyLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSafetyLimit(value);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const requestBody = {
        program: {
          ...program,
          safetyLimit: safetyLimit
        },
        initialRegisters: initialRegisters
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('http://localhost:8975/run_urm_program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result: APIResponse = await response.json();
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.result) {
        const newData = result.result.registers_from_steps.map((values, index) => ({
          values,
          instruction: result.result!.ops_from_steps[index],
          step: index
        }));

        setData(newData);
        setSerializedProgram(result.result.serialized_program);
        setCurrentStep(0);
        setFinalResult(newData[newData.length - 1].values);
        console.log('API response ops:', result.result.ops_from_steps);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, data.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getCurrentInstruction = () => {
    return data[currentStep]?.instruction || '';
  };

  const normalizeInstruction = (instruction: string) => {
    return instruction.replace(/\s+/g, '').replace(/\[.*?\]/, '');
  };

  const removeStepNumber = (instruction: string) => {
    return instruction.replace(/^\[\d+\]/, '');
  };

  const getCellColor = (instruction: string, index: number): string => {
    if (!instruction) return '';
    const [cmd, args] = instruction.split('(');
    const [arg1, arg2] = (args ? args.slice(0, -1).split(',') : []).map(Number);
  
    switch (cmd) {
      case 'S':
        return index === arg1 ? 'bg-yellow-100' : '';
      case 'J':
        if (index === arg1) return 'bg-green-100';
        if (index === arg2) return 'bg-blue-100';
        return '';
      case 'Z':
        return index === arg1 ? 'bg-orange-100' : '';
      case 'C':
        if (index === arg1) return 'bg-green-100';
        if (index === arg2) return 'bg-red-100';
        return '';
      default:
        return '';
    }
  };

  const Cell: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className={`w-12 h-12 border border-gray-300 flex items-center justify-center m-1 ${color}`}>
      {value}
    </div>
  );

  const Row: React.FC<{ index: number; values: number[]; instruction: string }> = ({ index, values, instruction }) => (
    <div className="flex items-center mb-2">
      <div className="w-8 mr-2 text-right">{index}:</div>
      <div className="flex mr-4">
        {values.map((value, idx) => (
          <Cell 
            key={idx} 
            value={value} 
            color={getCellColor(instruction, idx)}
          />
        ))}
      </div>
      <div className="flex-grow">{instruction}</div>
    </div>
  );

  const Instruction: React.FC<{ step: number; instruction: string; isHighlighted: boolean }> = ({ step, instruction, isHighlighted }) => {
    console.log(`Instruction ${step}: ${instruction}, Highlighted: ${isHighlighted}`);
    return (
      <div className={`p-2 ${isHighlighted ? 'bg-yellow-200' : ''}`}>
        [{step}]{instruction}
      </div>
    );
  };

  return (
    <div className="p-4 pb-32 relative min-h-screen">
      <h2 className="text-2xl font-bold mb-4">URM Instruction Sequence Visualization</h2>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Initialize Registers</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {initialRegisters.map((value, index) => (
            <input
            key={index}
            type="number"
            min="0"
            value={value}
            onChange={(e) => handleRegisterChange(index, e.target.value)}
            className="w-12 h-12 text-center border rounded"
          />
        ))}
      </div>

      {finalResult && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Final Result</h3>
          <div className="flex flex-wrap gap-2 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
            {finalResult.map((value, index) => (
              <div key={index} className="w-12 h-12 flex items-center justify-center bg-white border border-green-500 rounded-lg font-bold text-green-700">
                {value}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 mb-4 mt-4">
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
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out disabled:bg-gray-400"
        >
          {isLoading ? 'Loading...' : 'Running simulator'}
        </button>
      </div>
    </div>

    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )}

    <div className="w-full pr-64 flex flex-col mb-20">
      <div 
        ref={scrollContainerRef}
        className="flex-grow overflow-auto mb-4 border rounded shadow-inner p-4 max-h-[60vh]"
      >
        {data.slice(0, currentStep + 1).map((item, index) => (
          <Row 
            key={index}
            index={index} 
            values={item.values} 
            instruction={item.instruction}
          />
        ))}
      </div>
    </div>
    <div className="fixed top-4 right-4 w-60 bg-white p-4 border rounded shadow-lg">
      <h3 className="text-xl font-bold mb-2">URM Program</h3>
      {serializedProgram && serializedProgram.instructions.map((item, index) => (
        <Instruction
          key={index}
          step={index + 1}
          instruction={`${item.operator}(${item.params.join(',')})`}
          isHighlighted={
            normalizeInstruction(removeStepNumber(`${item.operator}(${item.params.join(',')})`)) ===
            normalizeInstruction(removeStepNumber(getCurrentInstruction()))
          }
        />
      ))}
    </div>
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous Step
        </button>
        <div className="text-lg font-semibold">
          Current Step: {currentStep + 1} / {data.length}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
          onClick={handleNext}
          disabled={currentStep === data.length - 1}
        >
          Next Step
        </button>
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
        onClick={onBackToCreator}
      >
        Back to Creator
      </button>
    </div>
  </div>
);
};

// Main Application Component
const URMIntegratedApp: React.FC = () => {
const [showVisualization, setShowVisualization] = useState(false);
const [urmProgram, setUrmProgram] = useState<URMProgram | null>(null);
const [initialRegisterCount, setInitialRegisterCount] = useState(4); // Default to 4 registers
const [error, setError] = useState<string | null>(null);
const [savedInstructions, setSavedInstructions] = useState<Instruction[]>([]);

const handleSubmit = async (program: URMProgram) => {
  try {
    const response = await fetch('http://localhost:8975/get_max_register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(program),
    });
    
    const data: { haddr?: number; error?: string } = await response.json();
    console.log('Get Max Register Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.haddr !== undefined) {
      setInitialRegisterCount(data.haddr);
      setUrmProgram(program);
      setSavedInstructions(program.instructions.map((instr, index) => ({
        id: index,
        ...instr
      })));
      setShowVisualization(true);
      setError(null);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error fetching max register:', error);
    setError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

const handleBackToCreator = () => {
  setShowVisualization(false);
  setUrmProgram(null);
  setError(null);
  // We don't clear savedInstructions here, so they're preserved
};

return (
  <div className="container mx-auto p-4">
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )}
    
    {!showVisualization ? (
      <URMProgramCreator handleSubmit={handleSubmit} savedInstructions={savedInstructions} />
    ) : (
      urmProgram && (
        <URMSequenceVisualization 
          onBackToCreator={handleBackToCreator}
          program={urmProgram}
          initialRegisterCount={initialRegisterCount}
        />
      )
    )}
  </div>
);
};

export default URMIntegratedApp;