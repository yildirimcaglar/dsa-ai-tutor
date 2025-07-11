import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Eye, Lock, Copy, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  initialCode: string;
  onRunCode: (code: string) => void;
  onReset: () => void;
  isRunning?: boolean;
  lastResult?: {
    passed: boolean;
    output: string;
    error?: string;
  };
  // Solution reveal props
  solution?: string;
  credits?: number;
  solutionCost?: number;
  onRevealSolution?: () => void;
  isSolutionRevealed?: boolean;
  isGeneratingSolution?: boolean;
  // Pseudo code props
  pseudoCode?: string;
  pseudoCodeCost?: number;
  onRevealPseudoCode?: () => void;
  isPseudoCodeRevealed?: boolean;
  isGeneratingPseudoCode?: boolean;
}

export function CodeEditor({ 
  initialCode, 
  onRunCode, 
  onReset, 
  isRunning = false,
  lastResult,
  solution,
  credits,
  solutionCost = 5,
  onRevealSolution,
  isSolutionRevealed = false,
  isGeneratingSolution = false,
  pseudoCode,
  pseudoCodeCost = 3,
  onRevealPseudoCode,
  isPseudoCodeRevealed = false,
  isGeneratingPseudoCode = false
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Update code when pseudo code is revealed
  useEffect(() => {
    if (isPseudoCodeRevealed && pseudoCode && !code.includes("=== ALGORITHM STEPS ===")) {
      const newCode = code + "\n\n# === ALGORITHM STEPS ===\n" + pseudoCode;
      setCode(newCode);
    }
  }, [isPseudoCodeRevealed, pseudoCode, code]);

  // Update code when solution is revealed
  useEffect(() => {
    if (isSolutionRevealed && solution && !code.includes("=== SOLUTION ===")) {
      const newCode = code + "\n\n# === SOLUTION ===\n" + solution;
      setCode(newCode);
    }
  }, [isSolutionRevealed, solution, code]);

  const handleRunCode = () => {
    onRunCode(code);
  };

  const handleReset = () => {
    setCode(initialCode);
    onReset();
  };

  const handleRevealSolution = () => {
    if (!solution || isSolutionRevealed) return;
    
    // Append solution to existing code
    const newCode = code + "\n\n# === SOLUTION ===\n" + solution;
    setCode(newCode);
    
    // Call the parent callback to update credits and state
    if (onRevealSolution) {
      onRevealSolution();
    }
  };

  const handleRevealPseudoCode = () => {
    if (isPseudoCodeRevealed) return;
    
    // Call the parent callback to update credits and state
    // The parent will handle generating and setting the pseudo code
    if (onRevealPseudoCode) {
      onRevealPseudoCode();
    }
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Code Editor</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-muted hover:bg-muted/80"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            size="sm"
            className="bg-gradient-primary hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-1" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden mb-4 flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-light"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="flex-shrink-0">
        {lastResult && (
          <div className="space-y-3 mb-4 max-h-32 overflow-y-auto">
            <div className="bg-muted rounded-lg p-3">
              <h4 className="font-medium mb-2">Output:</h4>
              <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                {lastResult.output || "No output"}
              </pre>
            </div>

            {lastResult.error && (
              <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3">
                <h4 className="font-medium mb-2 text-destructive">Error:</h4>
                <pre className="text-sm font-mono whitespace-pre-wrap text-destructive">
                  {lastResult.error}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Pseudo code and solution reveal buttons at bottom */}
        {(onRevealPseudoCode || onRevealSolution) && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onRevealPseudoCode && !isPseudoCodeRevealed && (isGeneratingSolution || solution) && pseudoCode && (
                  <Button
                    onClick={handleRevealPseudoCode}
                    disabled={isGeneratingPseudoCode || (credits !== undefined && credits < pseudoCodeCost)}
                    variant="outline"
                    size="sm"
                    className="bg-muted hover:bg-muted/80"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isGeneratingPseudoCode 
                      ? "Generating Steps..." 
                      : `Show Steps (${pseudoCodeCost} credits)`
                    }
                  </Button>
                )}
                {isPseudoCodeRevealed && (
                  <Badge variant="default" className="bg-success">
                    ✓ Steps Added
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onRevealSolution && !isSolutionRevealed && (isGeneratingSolution || solution) && (
                  <Button
                    onClick={handleRevealSolution}
                    disabled={isGeneratingSolution || (credits !== undefined && credits < solutionCost)}
                    variant="outline"
                    size="sm"
                    className="bg-muted hover:bg-muted/80"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isGeneratingSolution 
                      ? "Generating Solution..." 
                      : `Reveal Solution (${solutionCost} credits)`
                    }
                  </Button>
                )}
                {isSolutionRevealed && (
                  <Badge variant="default" className="bg-success">
                    ✓ Solution Added
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}