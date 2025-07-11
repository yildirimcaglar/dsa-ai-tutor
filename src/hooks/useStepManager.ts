import { useState, useCallback } from 'react';

interface Step {
  id: number;
  description: string;
  completed: boolean;
  current: boolean;
  hints: string[];
  testCases: Array<{
    input: string;
    expected: string;
  }>;
}

export const useStepManager = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const initializeSteps = useCallback((generatedSteps: Step[]) => {
    setSteps(generatedSteps);
    setCurrentStep(1);
  }, []);

  const handleStepClick = useCallback((stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && (step.completed || step.current)) {
      setCurrentStep(stepId);
    }
  }, [steps]);

  const resetSteps = useCallback(() => {
    setSteps([]);
    setCurrentStep(1);
  }, []);

  return {
    steps,
    currentStep,
    initializeSteps,
    handleStepClick,
    resetSteps
  };
};