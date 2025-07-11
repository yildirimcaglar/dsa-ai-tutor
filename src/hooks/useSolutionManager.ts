import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSolutionManager = () => {
  const [generatedSolution, setGeneratedSolution] = useState<string>('');
  const [generatedPseudoCode, setGeneratedPseudoCode] = useState<string>('');
  const [initialCodeTemplate, setInitialCodeTemplate] = useState<string>('');
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [isGeneratingPseudoCode, setIsGeneratingPseudoCode] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [pseudoCodeRevealed, setPseudoCodeRevealed] = useState(false);
  
  const { toast } = useToast();

  const setSolution = useCallback((solution: string) => {
    setGeneratedSolution(solution);
  }, []);

  const setPseudoCode = useCallback((pseudoCode: string) => {
    setGeneratedPseudoCode(pseudoCode);
  }, []);

  const setTemplate = useCallback((template: string) => {
    setInitialCodeTemplate(template);
  }, []);

  const revealSolution = useCallback((cost: number, hasEnoughCredits: boolean) => {
    if (!hasEnoughCredits) return false;
    
    setSolutionRevealed(true);
    toast({
      title: "Solution revealed!",
      description: "The solution has been added to your code editor.",
    });
    return true;
  }, [toast]);

  const revealPseudoCode = useCallback((cost: number, hasEnoughCredits: boolean) => {
    if (!hasEnoughCredits) return false;
    
    setPseudoCodeRevealed(true);
    toast({
      title: "Algorithm steps revealed!",
      description: "The step-by-step approach has been added to your code editor.",
    });
    return true;
  }, [toast]);

  const resetSolutions = useCallback(() => {
    setGeneratedSolution('');
    setGeneratedPseudoCode('');
    setInitialCodeTemplate('');
    setSolutionRevealed(false);
    setPseudoCodeRevealed(false);
    setIsGeneratingSolution(false);
    setIsGeneratingPseudoCode(false);
  }, []);

  return {
    generatedSolution,
    generatedPseudoCode,
    initialCodeTemplate,
    isGeneratingSolution,
    isGeneratingPseudoCode,
    solutionRevealed,
    pseudoCodeRevealed,
    setSolution,
    setPseudoCode,
    setTemplate,
    setIsGeneratingSolution,
    setIsGeneratingPseudoCode,
    revealSolution,
    revealPseudoCode,
    resetSolutions
  };
};