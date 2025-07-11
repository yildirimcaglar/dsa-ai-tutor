import { CheckCircle, Circle, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  description: string;
  completed: boolean;
  current: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepNavigation({ steps, currentStep, onStepClick }: StepNavigationProps) {
  const currentStepData = steps.find(s => s.id === currentStep);
  
  return (
    <Card className="p-4 bg-gradient-card shadow-card">
      <div className="space-y-4">
        {/* Progress bar and step indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          <div className="flex-1 mx-4 bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Current step description */}
        {currentStepData && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Current Step:</span>
            </div>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
          </div>
        )}
        
        {/* Horizontal step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-muted/50",
                step.current && "bg-primary/20 border border-primary/50",
                step.completed && "bg-success/20 border border-success/50"
              )}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : step.current ? (
                  <PlayCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                step.completed && "text-success",
                step.current && "text-primary",
                !step.completed && !step.current && "text-muted-foreground"
              )}>
                {step.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}