import React, { useState, useRef, useEffect } from 'react';

interface DataItem {
  values: number[];
  instruction: string;
  step: number;
}

interface Instruction {
  step: number;
  instruction: string;
}

const data: DataItem[] = [
  { values: [0, 5, 7, 0], instruction: "Initial", step: 0 },
  { values: [7, 5, 7, 0], instruction: "C(2, 0)", step: 1 },
  { values: [7, 5, 0, 0], instruction: "Z(2)", step: 2 },
  { values: [7, 5, 0, 0], instruction: "J(1, 2, 0)", step: 3 },
  { values: [8, 5, 0, 0], instruction: "S(0)", step: 4 },
  { values: [8, 5, 1, 0], instruction: "S(2)", step: 5 },
  { values: [8, 5, 1, 0], instruction: "J(3, 3, 3)", step: 6 },
  { values: [8, 5, 1, 0], instruction: "J(1, 2, 0)", step: 3 },
  { values: [9, 5, 1, 0], instruction: "S(0)", step: 4 },
  { values: [9, 5, 2, 0], instruction: "S(2)", step: 5 },
  { values: [9, 5, 2, 0], instruction: "J(3, 3, 3)", step: 6 },
  { values: [9, 5, 2, 0], instruction: "J(1, 2, 0)", step: 3 },
  { values: [10, 5, 2, 0], instruction: "S(0)", step: 4 },
  { values: [10, 5, 3, 0], instruction: "S(2)", step: 5 },
  { values: [10, 5, 3, 0], instruction: "J(3, 3, 3)", step: 6 },
  { values: [10, 5, 3, 0], instruction: "J(1, 2, 0)", step: 3 },
  { values: [11, 5, 3, 0], instruction: "S(0)", step: 4 },
  { values: [11, 5, 4, 0], instruction: "S(2)", step: 5 },
  { values: [11, 5, 4, 0], instruction: "J(3, 3, 3)", step: 6 },
  { values: [11, 5, 4, 0], instruction: "J(1, 2, 0)", step: 3 },
  { values: [12, 5, 4, 0], instruction: "S(0)", step: 4 },
  { values: [12, 5, 5, 0], instruction: "S(2)", step: 5 },
  { values: [12, 5, 5, 0], instruction: "J(3, 3, 3)", step: 6 },
  { values: [12, 5, 5, 0], instruction: "J(1, 2, 0)", step: 3 }
];

const initialInstructions: Instruction[] = [
  { step: 1, instruction: "C(2, 0)" },
  { step: 2, instruction: "Z(2)" },
  { step: 3, instruction: "J(1, 2, 0)" },
  { step: 4, instruction: "S(0)" },
  { step: 5, instruction: "S(2)" },
  { step: 6, instruction: "J(3, 3, 3)" }
];

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

interface CellProps {
  value: number;
  color: string;
}

const Cell: React.FC<CellProps> = ({ value, color }) => (
  <div className={`w-12 h-12 border border-gray-300 flex items-center justify-center m-1 ${color}`}>
    {value}
  </div>
);

interface RowProps {
  index: number;
  values: number[];
  instruction: string;
}

const Row: React.FC<RowProps> = ({ index, values, instruction }) => (
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

interface InstructionProps {
  step: number;
  instruction: string;
  isHighlighted: boolean;
}

const Instruction: React.FC<InstructionProps> = ({ step, instruction, isHighlighted }) => (
  <div className={`p-2 ${isHighlighted ? 'bg-yellow-200' : ''}`}>
    [{step}]{instruction}
  </div>
);

const URMSequenceVisualization: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, data.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getCurrentInstruction = () => {
    return data[currentStep].instruction;
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  return (
    <div className="p-4 pb-20 relative h-screen">
      <div className="w-full pr-64 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">URM指令序列可视化</h2>
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-auto mb-4 border rounded shadow-inner p-4"
        >
          {data.slice(0, currentStep + 1).map((row, index) => (
            <Row 
              key={index}
              index={index} 
              values={row.values} 
              instruction={row.instruction}
            />
          ))}
        </div>
      </div>
      <div className="fixed top-4 right-4 w-60 bg-white p-4 border rounded shadow-lg">
        <h3 className="text-xl font-bold mb-2">初始构建指令</h3>
        {initialInstructions.map((item, index) => (
          <Instruction
            key={index}
            step={item.step}
            instruction={item.instruction}
            isHighlighted={item.instruction === getCurrentInstruction()}
          />
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-center items-center space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          上一步
        </button>
        <div className="text-lg font-semibold">
          当前步骤: {currentStep + 1} / {data.length}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
          onClick={handleNext}
          disabled={currentStep === data.length - 1}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default URMSequenceVisualization;