import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCredits = () => {
  const [credits, setCredits] = useState(10);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const { toast } = useToast();

  const spendCredits = useCallback((amount: number, description: string): boolean => {
    if (credits < amount) {
      toast({
        title: "Not enough credits",
        description: `You need at least ${amount} credit${amount > 1 ? 's' : ''} to ${description}.`,
        variant: "destructive",
      });
      return false;
    }
    
    setCredits(prev => prev - amount);
    return true;
  }, [credits, toast]);

  const useHint = useCallback((): boolean => {
    if (totalHintsUsed >= 5) {
      toast({
        title: "Hint limit reached",
        description: "You've used all 5 available hints for this session.",
        variant: "destructive",
      });
      return false;
    }

    if (spendCredits(1, 'get a hint')) {
      setTotalHintsUsed(prev => prev + 1);
      return true;
    }
    return false;
  }, [totalHintsUsed, spendCredits]);

  const resetCredits = useCallback(() => {
    setCredits(10);
    setTotalHintsUsed(0);
  }, []);

  const getRemainingHints = useCallback(() => {
    return Math.max(0, 5 - totalHintsUsed);
  }, [totalHintsUsed]);

  return {
    credits,
    totalHintsUsed,
    spendCredits,
    useHint,
    resetCredits,
    getRemainingHints
  };
};