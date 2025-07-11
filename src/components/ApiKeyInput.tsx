import { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
  hasApiKey: boolean;
}

export function ApiKeyInput({ onApiKeySet, hasApiKey }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isVisible, setIsVisible] = useState(!hasApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setApiKey("");
      setIsVisible(false);
    }
  };

  if (!isVisible && hasApiKey) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        <Key className="w-4 h-4 mr-2" />
        Update AI Key
      </Button>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-card border-accent/20">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Enable AI Tutoring</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        To enable personalized AI tutoring with Claude, please enter your Anthropic API key. 
        Get one at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a>
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Claude API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={!apiKey.trim()}>
            Enable AI Tutoring
          </Button>
          {hasApiKey && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsVisible(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <p className="text-xs text-muted-foreground mt-3">
        Your API key is stored locally and used only for AI tutoring requests.
      </p>
    </Card>
  );
}