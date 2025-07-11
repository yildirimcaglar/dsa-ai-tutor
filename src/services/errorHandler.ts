export interface ApiError {
  message: string;
  status?: number;
  type: 'api' | 'cors' | 'network' | 'validation';
}

class ErrorHandlerService {
  handleApiError(error: unknown): ApiError {
    console.error('API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('CORS')) {
      return {
        type: 'cors',
        message: '⚠️ CORS Error: Direct API calls to Claude aren\'t supported in browsers. For a working demo, I\'ll provide guided questions. In production, this would use a backend proxy.'
      };
    }
    
    if (error instanceof Error) {
      if (error.message.includes('API call failed')) {
        return {
          type: 'api',
          message: `⚠️ API Connection Error: ${error.message}`,
          status: parseInt(error.message.match(/\d+/)?.[0] || '0')
        };
      }
      
      if (error.message.includes('Failed to fetch')) {
        return {
          type: 'network',
          message: '⚠️ Network Error: Unable to connect to the AI service. Please check your internet connection.'
        };
      }
      
      return {
        type: 'api',
        message: `⚠️ Error: ${error.message}`
      };
    }
    
    return {
      type: 'api',
      message: '⚠️ An unexpected error occurred. Please try again.'
    };
  }

  getFallbackResponse(context: { isQuestion?: boolean } = {}): string {
    const questions = [
      "What do you think should be the first step in solving this problem?",
      "How would you approach this step by step?",
      "What data structure might be most efficient here?",
      "Can you break down the problem into smaller parts?"
    ];
    
    if (context.isQuestion) {
      return questions[Math.floor(Math.random() * questions.length)];
    }
    
    return "Let me help you with a guided question: " + questions[0];
  }

  createUserFriendlyError(error: ApiError): string {
    switch (error.type) {
      case 'cors':
        return error.message + " " + this.getFallbackResponse({ isQuestion: true });
      case 'network':
        return error.message + " Let's continue with guided learning.";
      case 'api':
        return error.message + " " + this.getFallbackResponse();
      default:
        return error.message + " " + this.getFallbackResponse();
    }
  }
}

export const errorHandler = new ErrorHandlerService();