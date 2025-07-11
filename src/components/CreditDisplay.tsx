import { Coins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CreditDisplayProps {
  credits: number;
  onEarnCredits: () => void;
}

export function CreditDisplay({ credits, onEarnCredits }: CreditDisplayProps) {
  return (
    <Card className="px-4 py-2 bg-gradient-accent text-credit-foreground shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span className="font-bold text-sm">{credits}</span>
          <span className="text-sm">Credits</span>
        </div>
        {credits <= 0 && (
          <Button
            onClick={onEarnCredits}
            size="sm"
            variant="outline"
            className="bg-white/20 border-white/30 hover:bg-white/30"
          >
            <Plus className="w-4 h-4 mr-1" />
            Earn More
          </Button>
        )}
      </div>
    </Card>
  );
}