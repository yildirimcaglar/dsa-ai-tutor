interface MessageContext {
  problemDescription: string;
  currentStep: number;
  hasApiKey: boolean;
  isInitial?: boolean;
}

class MessageService {
  createWelcomeMessage(context: MessageContext): string {
    if (!context.hasApiKey) {
      return "Welcome to DSA Tutor! Enable AI tutoring for personalized guidance. Let's start with the first step of your problem.";
    }

    const problemLower = context.problemDescription.toLowerCase();
    
    if (problemLower.includes('two sum')) {
      return "Let's solve this Two Sum problem step by step! What data structure would be most efficient for checking if a number exists quickly?";
    }
    
    if (problemLower.includes('palindrome')) {
      return "Great! Let's work on this palindrome problem. What's the first thing we need to do with the input string?";
    }
    
    return "Welcome to DSA Tutor! Let's solve this step by step. What do you think the first step should be?";
  }

  createErrorFeedbackMessage(hasApiKey: boolean): string {
    if (!hasApiKey) {
      return "I notice there might be an issue with your code. Enable AI tutoring for detailed analysis.";
    }
    return "I notice there's an error in your code. What do you think might be causing it?";
  }

  createFallbackResponse(hasApiKey: boolean): string {
    if (!hasApiKey) {
      return "Great thinking! Enable AI tutoring for more personalized guidance. What would be the first step in your function?";
    }
    return "That's a good observation! What's the next step you should take?";
  }

  getFallbackHints(): string[] {
    return [
      "Think about what data structure would be most efficient for this problem.",
      "Consider the time complexity of your approach. Can it be optimized?",
      "Break down the problem into smaller, manageable steps.",
      "Think about edge cases that might break your solution.",
      "Consider what the function signature should look like based on the problem requirements."
    ];
  }

  createFallbackHint(hintNumber: number): string {
    const hints = this.getFallbackHints();
    const index = Math.min(hintNumber - 1, hints.length - 1);
    return hints[Math.max(0, index)];
  }

  createApiKeyMissingMessage(): string {
    return "Please set your Claude API key to enable AI tutoring. You can get one from https://console.anthropic.com/";
  }
}

export const messageService = new MessageService();