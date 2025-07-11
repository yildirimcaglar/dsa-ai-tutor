import { useState, useEffect } from "react";
import { ProblemInput } from "@/components/ProblemInput";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { ProblemSolver } from "@/components/ProblemSolver";
import { aiTutor } from "@/services/aiTutor";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [problemDescription, setProblemDescription] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const apiKey = localStorage.getItem('claude_api_key');
    setHasApiKey(!!apiKey);
  }, []);

  const handleSubmitProblem = async (problem: string) => {
    setProblemDescription(problem);
  };

  const handleApiKeySet = (key: string) => {
    aiTutor.setApiKey(key);
    setHasApiKey(true);
    toast({
      title: "AI Tutoring Enabled!",
      description: "You can now get personalized guidance from Claude.",
    });
  };

  const handleStartOver = () => {
    setProblemDescription("");
  };

  if (!problemDescription) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">DSA Tutor</h1>
            <p className="text-muted-foreground">
              Master Data Structures and Algorithms through step-by-step guidance and Socratic learning
            </p>
          </div>
          
          <ApiKeyInput 
            onApiKeySet={handleApiKeySet}
            hasApiKey={hasApiKey}
          />
          <ProblemInput 
            onSubmitProblem={handleSubmitProblem}
            isProcessing={false}
          />
        </div>
      </div>
    );
  }

  return (
    <ProblemSolver
      problemDescription={problemDescription}
      hasApiKey={hasApiKey}
      onStartOver={handleStartOver}
    />
  );
};

export default Index;