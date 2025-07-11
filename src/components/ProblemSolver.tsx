import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { TutorChat } from "@/components/TutorChat";
import { CreditDisplay } from "@/components/CreditDisplay";
import { aiTutor } from "@/services/aiTutor";
import { useStepManager } from "@/hooks/useStepManager";
import { useMessageHistory } from "@/hooks/useMessageHistory";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useCredits } from "@/hooks/useCredits";
import { useSolutionManager } from "@/hooks/useSolutionManager";
import { errorHandler } from "@/services/errorHandler";
import { messageService } from "@/services/messageService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ProblemSolverProps {
  problemDescription: string;
  hasApiKey: boolean;
  onStartOver: () => void;
}

export function ProblemSolver({ problemDescription, hasApiKey, onStartOver }: ProblemSolverProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const stepManager = useStepManager();
  const messageHistory = useMessageHistory();
  const codeExecution = useCodeExecution();
  const creditManager = useCredits();
  const solutionManager = useSolutionManager();
  
  const { toast } = useToast();

  const generateProblemSpecificTemplate = (problem: string) => {
    return `# Write your solution here
def solution():
    # Your code implementation here
    pass`;
  };

  // Initialize problem on mount
  useEffect(() => {
    const initializeProblem = async () => {
      setIsProcessing(true);
      
      try {
        // Generate steps
        const generatedSteps = await aiTutor.generateStepsFromProblem(problemDescription);
        stepManager.initializeSteps(generatedSteps);
        
        // Generate initial welcome message
        // might come back to this later to add a problem title based on the description
        const welcomeMessage = messageService.createWelcomeMessage({
          problemDescription,
          currentStep: 1,
          hasApiKey,
          isInitial: true
        });
        
        if (hasApiKey) {
          try {
            const response = await aiTutor.generateTutorResponse({
              problemDescription,
              currentStep: 1,
              steps: generatedSteps,
              conversationHistory: []
            });
            messageHistory.addTutorMessage(response.message);
          } catch (error) {
            messageHistory.addTutorMessage(welcomeMessage);
          }
        } else {
          messageHistory.addTutorMessage(welcomeMessage);
        }
        
        // Set minimal template and generate solutions in background
        const problemSpecificTemplate = generateProblemSpecificTemplate(problemDescription);
        solutionManager.setTemplate(problemSpecificTemplate);
        
        if (hasApiKey) {
          solutionManager.setIsGeneratingSolution(true);
          try {
            const solutionWithSteps = await aiTutor.generateSolutionWithSteps(problemDescription, generatedSteps);
            
            solutionManager.setSolution(solutionWithSteps.solution);
            solutionManager.setPseudoCode(solutionWithSteps.algorithmSteps);
          } catch (error) {
            console.error('Error generating code templates:', error);
            solutionManager.setSolution(`# Solution for: ${problemDescription}\n# Unable to generate AI solution\n# Please check your API connection\n\ndef solution():\n    """\n    Problem-specific solution would be generated here\n    Please check your API connection\n    """\n    # Your implementation here\n    pass`);
            solutionManager.setPseudoCode(`# Algorithm steps for: ${problemDescription}\n# Unable to generate AI steps\n# Step 1: Understand the problem requirements\n# Step 2: Choose appropriate data structures  \n# Step 3: Implement the main logic\n# Step 4: Handle edge cases and optimize`);
          } finally {
            solutionManager.setIsGeneratingSolution(false);
          }
        }
      } catch (error) {
        console.error('Problem initialization error:', error);
        const errorMsg = errorHandler.handleApiError(error);
        messageHistory.addTutorMessage(errorHandler.createUserFriendlyError(errorMsg));
      } finally {
        setIsProcessing(false);
      }
    };

    initializeProblem();
  }, [problemDescription, hasApiKey]);

  const handleRunCode = async (code: string) => {
    const result = await codeExecution.executeCode(code);
    
    // Provide AI feedback if there's an error and API key is available
    if (!result.passed && result.error && hasApiKey) {
      try {
        const analysis = await aiTutor.analyzeCode(code, []);
        messageHistory.addTutorMessage(analysis.suggestion || messageService.createErrorFeedbackMessage(hasApiKey));
      } catch (error) {
        messageHistory.addTutorMessage(messageService.createErrorFeedbackMessage(hasApiKey));
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage = messageHistory.addUserMessage(message);
    
    if (hasApiKey) {
      try {
        const conversationHistory = messageHistory.getConversationHistory();
        const response = await aiTutor.generateTutorResponse({
          problemDescription,
          currentStep: stepManager.currentStep,
          steps: stepManager.steps,
          conversationHistory,
          userCode: codeExecution.currentCode,
          lastError: codeExecution.lastResult?.error
        });
        
        setTimeout(() => {
          messageHistory.addTutorMessage(response.message);
        }, 500);
      } catch (error) {
        setTimeout(() => {
          messageHistory.addTutorMessage(messageService.createFallbackResponse(hasApiKey));
        }, 1000);
      }
    } else {
      setTimeout(() => {
        messageHistory.addTutorMessage(messageService.createFallbackResponse(hasApiKey));
      }, 1000);
    }
  };

  const handleRequestHint = async () => {
    if (!creditManager.useHint()) return;

    try {
      const hint = await aiTutor.generateHint({
        problemDescription,
        currentStep: stepManager.currentStep,
        steps: stepManager.steps,
        userCode: codeExecution.currentCode,
        hintNumber: creditManager.totalHintsUsed
      });
      messageHistory.addHintMessage(hint);
    } catch (error) {
      const fallbackHint = messageService.createFallbackHint(creditManager.totalHintsUsed);
      messageHistory.addHintMessage(fallbackHint);
    }
  };

  const handleRevealSolution = () => {
    const cost = 5;
    if (creditManager.spendCredits(cost, 'reveal the solution')) {
      solutionManager.revealSolution(cost, true);
    }
  };

  const handleRevealPseudoCode = () => {
    const cost = 3;
    if (creditManager.spendCredits(cost, 'reveal algorithm steps')) {
      solutionManager.revealPseudoCode(cost, true);
    }
  };

  const handleStartOver = () => {
    stepManager.resetSteps();
    messageHistory.resetMessages();
    codeExecution.resetExecution();
    creditManager.resetCredits();
    solutionManager.resetSolutions();
    onStartOver();
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your learning session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">DSA Tutor Learning Session</h1>
            <p className="text-muted-foreground">Caglar Yildirim</p>
          </div>
          <div className="flex items-center gap-4">
            <CreditDisplay 
              credits={creditManager.credits}
              onEarnCredits={() => {
                toast({
                  title: "Quiz feature coming soon!",
                  description: "Mini-quizzes to earn credits will be available soon.",
                });
              }}
            />
            <Button onClick={handleStartOver} variant="outline">
              Start Over
            </Button>
          </div>
        </div>

        {/* Problem Description Panel */}
        <div className="bg-card border rounded-lg p-3 mb-4">
          <h2 className="text-sm font-medium mb-1 text-primary">Problem:</h2>
          <p className="text-sm text-card-foreground leading-snug">{problemDescription}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column - Code Editor */}
          <div className="h-full overflow-hidden">
            <CodeEditor
              initialCode={solutionManager.initialCodeTemplate}
              onRunCode={handleRunCode}
              onReset={() => codeExecution.setCurrentCode(solutionManager.initialCodeTemplate)}
              isRunning={codeExecution.isRunning}
              lastResult={codeExecution.lastResult}
              solution={solutionManager.generatedSolution}
              credits={creditManager.credits}
              solutionCost={5}
              onRevealSolution={handleRevealSolution}
              isSolutionRevealed={solutionManager.solutionRevealed}
              isGeneratingSolution={solutionManager.isGeneratingSolution}
              pseudoCode={solutionManager.generatedPseudoCode}
              pseudoCodeCost={3}
              onRevealPseudoCode={handleRevealPseudoCode}
              isPseudoCodeRevealed={solutionManager.pseudoCodeRevealed}
              isGeneratingPseudoCode={solutionManager.isGeneratingPseudoCode}
            />
          </div>

          {/* Right Column - AI Tutor Chat */}
          <div className="h-full overflow-hidden">
            <TutorChat
              messages={messageHistory.messages}
              onSendMessage={handleSendMessage}
              onRequestHint={handleRequestHint}
              hintsRemaining={creditManager.getRemainingHints()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}