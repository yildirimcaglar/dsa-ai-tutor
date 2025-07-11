import { loadPyodide } from 'pyodide';

interface ExecutionResult {
  passed: boolean;
  output: string;
  error?: string;
}

class CodeExecutorService {
  private pyodide: any = null;
  private isLoading = false;

  async initialize() {
    if (this.pyodide || this.isLoading) return;
    
    this.isLoading = true;
    try {
      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/"
      });
      console.log("Pyodide loaded successfully");
    } catch (error) {
      console.error("Failed to load Pyodide:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async executeCode(code: string, testCases?: Array<{input: string, expected: string}>): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
      if (!this.pyodide) {
        return {
          passed: false,
          output: "Python interpreter not available",
          error: "Failed to initialize Python environment"
        };
      }
    }

    try {
      // Clear previous variables
      this.pyodide.runPython("import sys; sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
      
      // Capture stdout and stderr
      this.pyodide.runPython(`
import sys
from io import StringIO
import traceback

# Capture output
captured_output = StringIO()
captured_error = StringIO()
sys.stdout = captured_output
sys.stderr = captured_error
`);

      // Execute user code
      try {
        this.pyodide.runPython(code);
        
        // Get captured output
        const output = this.pyodide.runPython("captured_output.getvalue()");
        const error = this.pyodide.runPython("captured_error.getvalue()");
        
        // Reset stdout/stderr
        this.pyodide.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
        
        if (error && error.trim()) {
          return {
            passed: false,
            output: output || "",
            error: error.trim()
          };
        }

        // If there are test cases, try to run them
        if (testCases && testCases.length > 0) {
          let allTestsPassed = true;
          let testOutput = output ? output + "\n\n=== Test Results ===\n" : "=== Test Results ===\n";
          
          for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
              // Skip generic placeholder test cases
              if (testCase.input.includes('basic input') || 
                  testCase.input.includes('test case') || 
                  testCase.input.includes('sample input') ||
                  testCase.expected.includes('expected output') ||
                  testCase.expected.includes('expected result')) {
                continue;
              }

              // Try to find and call the solution function
              const result = this.pyodide.runPython(`
try:
    if 'solution' in globals():
        # Try to safely evaluate the input
        import ast
        try:
            input_value = ast.literal_eval('${testCase.input.replace(/'/g, "\\'")}')
        except:
            input_value = '${testCase.input.replace(/'/g, "\\'")}'
        
        result = solution(input_value)
        str(result)
    else:
        "No solution function found"
except Exception as e:
    f"Error: {e}"
`);
              
              const expectedStr = testCase.expected.toString();
              const resultStr = result.toString();
              
              if (resultStr === expectedStr) {
                testOutput += `✓ Test ${i + 1}: PASSED (${testCase.input} → ${result})\n`;
              } else {
                testOutput += `✗ Test ${i + 1}: FAILED (${testCase.input} → ${result}, expected ${expectedStr})\n`;
                allTestsPassed = false;
              }
            } catch (testError) {
              testOutput += `✗ Test ${i + 1}: ERROR (${testCase.input}) - ${testError}\n`;
              allTestsPassed = false;
            }
          }
          
          // If no valid test cases were found, just return the output
          if (testOutput === (output ? output + "\n\n=== Test Results ===\n" : "=== Test Results ===\n")) {
            return {
              passed: true,
              output: output || "Code executed successfully (no output)",
              error: undefined
            };
          }
          
          return {
            passed: allTestsPassed,
            output: testOutput,
            error: allTestsPassed ? undefined : "Some tests failed"
          };
        }

        return {
          passed: true,
          output: output || "Code executed successfully (no output)",
          error: undefined
        };
        
      } catch (executionError: any) {
        // Reset stdout/stderr
        this.pyodide.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
        
        return {
          passed: false,
          output: "",
          error: executionError.message || "Execution error"
        };
      }
      
    } catch (error: any) {
      return {
        passed: false,
        output: "",
        error: `Python execution failed: ${error.message}`
      };
    }
  }
}

export const codeExecutor = new CodeExecutorService();