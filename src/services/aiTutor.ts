import { errorHandler } from './errorHandler';
import { messageService } from './messageService';

interface TutorContext {
  problemDescription: string;
  currentStep: number;
  steps: Array<{
    id: number;
    description: string;
    completed: boolean;
  }>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userCode?: string;
  lastError?: string;
}

interface TutorResponse {
  message: string;
  isQuestion: boolean;
  suggestedHint?: string;
}

export class AITutorService {
  private apiKey: string | null = null;
  
  constructor() {
    this.apiKey = localStorage.getItem('claude_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('claude_api_key', key);
  }

  private async makeApiCall(
    prompt: string, 
    maxTokens: number = 200,
    options: { dangerousBrowserAccess?: boolean } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };

    if (options.dangerousBrowserAccess) {
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async generateTutorResponse(context: TutorContext): Promise<TutorResponse> {
    if (!this.apiKey) {
      return {
        message: messageService.createApiKeyMissingMessage(),
        isQuestion: false
      };
    }

    try {
      const systemPrompt = this.buildTutorPrompt(context);
      const message = await this.makeApiCall(systemPrompt, 200, { dangerousBrowserAccess: true });
      
      return {
        message,
        isQuestion: message.includes('?')
      };
    } catch (error) {
      const apiError = errorHandler.handleApiError(error);
      return {
        message: errorHandler.createUserFriendlyError(apiError),
        isQuestion: true
      };
    }
  }

  private buildTutorPrompt(context: TutorContext): string {
    const conversationContext = context.conversationHistory.length > 0 
      ? `Previous conversation:\n${context.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
      : '';

    const codeContext = context.userCode 
      ? `\n\nStudent's current code:\n${context.userCode}`
      : '';

    const errorContext = context.lastError 
      ? `\n\nLast error encountered:\n${context.lastError}`
      : '';

    const currentStepInfo = context.steps.find(s => s.id === context.currentStep);
    const stepContext = currentStepInfo 
      ? `\n\nCurrent step (${context.currentStep}): ${currentStepInfo.description}`
      : '';

    return `You are an expert coding tutor using the Socratic method. Your role is to guide students through problem-solving using questions and hints, not direct answers.

PROBLEM TO SOLVE:
${context.problemDescription}

CONTEXT:
${stepContext}${conversationContext}${codeContext}${errorContext}

INSTRUCTIONS:
- Ask guiding questions to help the student think through the problem
- Provide hints when they're stuck, but don't give away the solution
- Be encouraging and supportive
- Keep responses concise (under 80 words)
- Focus on helping them understand the approach, not just get the answer
- If they have an error, guide them to discover what's wrong

Respond as the tutor would in a natural conversation.`;
  }

  async generateStepsFromProblem(problemDescription: string): Promise<Array<{
    id: number;
    description: string;
    completed: boolean;
    current: boolean;
    hints: string[];
    testCases: Array<{ input: string; expected: string }>;
  }>> {
    if (!this.apiKey) {
      return this.getFallbackSteps();
    }

    const systemPrompt = `Break down this coding problem into 4-6 step-by-step instructions for a student:

Problem: ${problemDescription}

Return a JSON array with this exact format:
[
  {
    "id": 1,
    "description": "Step description",
    "hints": ["hint1", "hint2"],
    "testCases": [{"input": "test input", "expected": "expected output"}]
  }
]

Focus on problem-solving approach, not specific syntax. Each step should build logically.`;

    try {
      const stepsText = await this.makeApiCall(systemPrompt, 800);
      const jsonMatch = stepsText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) throw new Error('No valid JSON found in response');
      
      const aiSteps = JSON.parse(jsonMatch[0]);
      
      return aiSteps.map((step: any, index: number) => ({
        ...step,
        id: index + 1,
        completed: false,
        current: index === 0
      }));
    } catch (error) {
      console.error('Step generation error:', error);
      return this.getFallbackSteps();
    }
  }

  private getFallbackSteps() {
    return [
      {
        id: 1,
        description: "Analyze the problem requirements and constraints",
        completed: false,
        current: true,
        hints: ["What are the inputs and outputs?", "Are there any edge cases to consider?"],
        testCases: [{ input: "basic input", expected: "expected output" }]
      },
      {
        id: 2,
        description: "Design your approach and choose appropriate data structures",
        completed: false,
        current: false,
        hints: ["What algorithm or pattern fits this problem?", "Consider time and space complexity"],
        testCases: [{ input: "test case", expected: "expected result" }]
      },
      {
        id: 3,
        description: "Implement the solution step by step",
        completed: false,
        current: false,
        hints: ["Start with the function signature", "Handle the main logic first"],
        testCases: [{ input: "main case", expected: "main result" }]
      },
      {
        id: 4,
        description: "Test and debug your implementation",
        completed: false,
        current: false,
        hints: ["Test with edge cases", "Check for off-by-one errors"],
        testCases: [{ input: "edge case", expected: "edge result" }]
      }
    ];
  }

  async generateSolutionWithSteps(problemDescription: string, steps: any[]): Promise<{
    solution: string;
    algorithmSteps: string;
  }> {
    const prompt = `Generate both a Python solution AND algorithm steps for this problem:

Problem: ${problemDescription}

Please return your response in this EXACT format:

SOLUTION:
[Clean Python code that solves the problem]

ALGORITHM_STEPS:
[Step-by-step algorithm explanation as Python comments, specific to this problem]

Requirements:
- Solution: Clean, optimized Python code with time/space complexity comments
- Algorithm Steps: Problem-specific step-by-step algorithm as Python comments (not generic)
- Use descriptive variable names
- Include edge case handling where relevant
- Algorithm steps should be specific to this exact problem, not generic programming steps`;

    try {
      const responseText = await this.makeApiCall(prompt, 1500, { dangerousBrowserAccess: true });
      
      const solutionMatch = responseText.match(/SOLUTION:\s*([\s\S]*?)(?=ALGORITHM_STEPS:|$)/);
      const stepsMatch = responseText.match(/ALGORITHM_STEPS:\s*([\s\S]*?)$/);
      
      let solution = solutionMatch ? solutionMatch[1].trim() : '';
      let algorithmSteps = stepsMatch ? stepsMatch[1].trim() : '';
      
      // Strip markdown code block markers
      solution = solution.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim();
      algorithmSteps = algorithmSteps.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim();
      
      return { solution, algorithmSteps };
    } catch (error) {
      console.error('Solution and steps generation error:', error);
      throw error;
    }
  }

  async generateSolutionSteps(problemDescription: string, steps: any[]): Promise<string> {
    const prompt = `Generate step-by-step code template for this problem:

Problem: ${problemDescription}

Requirements:
- Return ONLY Python code with step-by-step comments
- Include function signature and basic structure
- Add comments for each logical step
- Don't provide the complete solution, just guidance
- Use descriptive variable names

Format: Python code template with detailed step comments.`;

    try {
      let template = await this.makeApiCall(prompt, 800, { dangerousBrowserAccess: true });
      template = template.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim();
      return template;
    } catch (error) {
      console.error('Template generation error:', error);
      throw error;
    }
  }

  async generateHint(context: {
    problemDescription: string;
    currentStep: number;
    steps: any[];
    userCode: string;
    hintNumber: number;
  }): Promise<string> {
    const prompt = `Provide a helpful hint for this coding problem:

Problem: ${context.problemDescription}
Current Step: ${context.currentStep}
Student's Code: ${context.userCode}
Hint Number: ${context.hintNumber}

Requirements:
- Give a guiding hint, not the direct answer
- Keep it under 50 words
- Be encouraging and helpful
- Focus on the approach or concept`;

    try {
      return await this.makeApiCall(prompt, 150, { dangerousBrowserAccess: true });
    } catch (error) {
      return messageService.createFallbackHint(context.hintNumber);
    }
  }

  async analyzeCode(code: string, testCases: any[]): Promise<{ suggestion: string }> {
    const prompt = `Analyze this Python code and provide a helpful suggestion:

Code: ${code}

Requirements:
- Identify potential issues or improvements
- Be encouraging and educational
- Keep response under 60 words
- Focus on helping the student learn`;

    try {
      const suggestion = await this.makeApiCall(prompt, 150, { dangerousBrowserAccess: true });
      return { suggestion };
    } catch (error) {
      return { suggestion: messageService.createErrorFeedbackMessage(true) };
    }
  }
}

export const aiTutor = new AITutorService();