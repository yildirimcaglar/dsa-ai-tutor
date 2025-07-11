import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProblemInputProps {
  onSubmitProblem: (problem: string) => void;
  isProcessing?: boolean;
}

export function ProblemInput({ onSubmitProblem, isProcessing = false }: ProblemInputProps) {
  const [problem, setProblem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim()) {
      onSubmitProblem(problem.trim());
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-floating">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">DSA Tutor</h2>
        </div>
        <p className="text-muted-foreground">
          Paste your Data Structures and Algorithms problem below and I'll break it down into manageable steps with hints and guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="problem">Problem Description</Label>
          <Textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Paste your DSA problem here..."
            className="min-h-[120px] resize-none bg-background border-border"
            disabled={isProcessing}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!problem.trim() || isProcessing}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Send className="w-4 h-4 mr-2" />
            {isProcessing ? "Processing..." : "Start Learning"}
          </Button>
        </div>
      </form>
    </Card>
  );
}