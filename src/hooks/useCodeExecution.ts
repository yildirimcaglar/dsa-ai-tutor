import { useState, useCallback } from 'react';
import { codeExecutor } from '@/services/codeExecutor';

interface ExecutionResult {
  passed: boolean;
  output: string;
  error?: string;
}

export const useCodeExecution = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  const executeCode = useCallback(async (code: string): Promise<ExecutionResult> => {
    setIsRunning(true);
    setCurrentCode(code);
    
    try {
      const result = await codeExecutor.executeCode(code);
      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: ExecutionResult = {
        passed: false,
        output: '',
        error: 'Failed to execute code. Please check your Python syntax.'
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const resetExecution = useCallback(() => {
    setCurrentCode('');
    setLastResult(null);
    setIsRunning(false);
  }, []);

  return {
    currentCode,
    isRunning,
    lastResult,
    executeCode,
    resetExecution,
    setCurrentCode
  };
};