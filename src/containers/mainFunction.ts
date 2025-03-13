// import * as fs from "fs";
// import * as path from "path";
// import CPPExecutor from "./cppExecutor";
// // Import other executors similarly
// // import JavaExecutor from './javaExecutor';
// // import PythonExecutor from './pythonExecutor';
// // import RustExecutor from './rustExecutor';
// // import GoExecutor from './goExecutor';
// // import JavaScriptExecutor from './javascriptExecutor';

// /**
//  * Generates test code based on language, functionName and parameters
//  * @param language Programming language to generate test for
//  * @param functionName Name of the function being tested
//  * @param code User submitted code
//  * @param testCases Array of test cases with input and expected output
//  * @returns Generated test code that can be executed
//  */
// export default async function mainFunction(
//   language: string,
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): Promise<{ output: string; status: string }> {
//   // Validate inputs
//   if (
//     !["java", "cpp", "python", "rust", "go", "javascript"].includes(language)
//   ) {
//     return { output: "Unsupported language", status: "ERROR" };
//   }

//   if (!functionName || !code || !testCases || testCases.length === 0) {
//     return { output: "Missing required parameters", status: "ERROR" };
//   }

//   // Generate test code
//   const testCode = generateTestCode(language, functionName, code, testCases);

//   // Write test code to temp file for debugging if needed
//   const tempDir = path.join(process.cwd(), "temp");
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir);
//   }
//   fs.writeFileSync(
//     path.join(tempDir, `test.${getFileExtension(language)}`),
//     testCode,
//   );

//   // Execute test code using appropriate executor
//   try {
//     const executor = getExecutor(language);
//     // For simplicity, we'll execute only the first test case
//     // In a real implementation, you might want to execute all test cases
//     const result = await executor.execute(
//       testCode,
//       testCases[0].input,
//       testCases[0].output,
//     );
//     return result;
//   } catch (error) {
//     console.error(`Error executing ${language} code:`, error);
//     return {
//       output: error instanceof Error ? error.message : String(error),
//       status: "ERROR",
//     };
//   }
// }

// /**
//  * Get file extension for specified language
//  */
// function getFileExtension(language: string): string {
//   const extensions: Record<string, string> = {
//     java: "java",
//     cpp: "cpp",
//     python: "py",
//     rust: "rs",
//     go: "go",
//     javascript: "js",
//   };
//   return extensions[language] || "";
// }

// /**
//  * Get appropriate executor for the language
//  */
// function getExecutor(language: string) {
//   switch (language) {
//     case "cpp":
//       return new CPPExecutor();
//     // Add other executors as implemented
//     // case 'java':
//     //   return new JavaExecutor();
//     // etc.
//     default:
//       // Temporary fallback for non-implemented executors
//       return new CPPExecutor();
//   }
// }

// /**
//  * Parse input string into appropriate format for the language
//  */
// function parseInput(input: string, language: string): string {
//   // Remove whitespace and split by comma
//   const parts = input.trim().split(",");
//   const parsedParts = [];

//   for (let part of parts) {
//     // Extract variable name and value
//     const [name, valueStr] = part.split("=").map((s) => s.trim());
//     // Handle array values
//     if (valueStr.includes("[") && valueStr.includes("]")) {
//       const arrayValues = valueStr
//         .slice(valueStr.indexOf("[") + 1, valueStr.lastIndexOf("]"))
//         .split(",")
//         .map((s) => s.trim());

//       switch (language) {
//         case "python":
//           parsedParts.push(`${name} = [${arrayValues.join(", ")}]`);
//           break;
//         case "javascript":
//           parsedParts.push(`const ${name} = [${arrayValues.join(", ")}];`);
//           break;
//         case "java":
//           parsedParts.push(`int[] ${name} = {${arrayValues.join(", ")}};`);
//           break;
//         case "cpp":
//           parsedParts.push(
//             `std::vector<int> ${name} = {${arrayValues.join(", ")}};`,
//           );
//           break;
//         case "go":
//           parsedParts.push(`${name} := []int{${arrayValues.join(", ")}}`);
//           break;
//         case "rust":
//           parsedParts.push(`let ${name} = vec![${arrayValues.join(", ")}];`);
//           break;
//       }
//     } else {
//       // Handle scalar values
//       switch (language) {
//         case "python":
//           parsedParts.push(`${name} = ${valueStr}`);
//           break;
//         case "javascript":
//           parsedParts.push(`const ${name} = ${valueStr};`);
//           break;
//         case "java":
//           parsedParts.push(`int ${name} = ${valueStr};`);
//           break;
//         case "cpp":
//           parsedParts.push(`int ${name} = ${valueStr};`);
//           break;
//         case "go":
//           parsedParts.push(`${name} := ${valueStr}`);
//           break;
//         case "rust":
//           parsedParts.push(`let ${name} = ${valueStr};`);
//           break;
//       }
//     }
//   }

//   return parsedParts.join("\n");
// }

// /**
//  * Generate test code for specified language
//  */
// function generateTestCode(
//   language: string,
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   switch (language) {
//     case "python":
//       return generatePythonTestCode(functionName, code, testCases);
//     case "javascript":
//       return generateJavaScriptTestCode(functionName, code, testCases);
//     case "java":
//       return generateJavaTestCode(functionName, code, testCases);
//     case "cpp":
//       return generateCppTestCode(functionName, code, testCases);
//     case "go":
//       return generateGoTestCode(functionName, code, testCases);
//     case "rust":
//       return generateRustTestCode(functionName, code, testCases);
//     default:
//       throw new Error(`Unsupported language: ${language}`);
//   }
// }

// /**
//  * Generate Python test code
//  */
// function generatePythonTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   let testScript = `
// import sys
// from typing import List

// ${code}

// def run_tests():
//     test_cases = [
// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `        # Test case ${index + 1}\n`;
//     testScript += `        (lambda: (\n`;
//     testScript += `            (lambda: (\n`;
//     testScript += `                ${parseInput(testCase.input, "python")},\n`;
//     testScript += `                Solution().${functionName}(nums, target)\n`;
//     testScript += `            ))()\n`;
//     testScript += `        ), "${testCase.output}"),\n`;
//   });

//   testScript += `    ]

//     for i, (test_fn, expected) in enumerate(test_cases):
//         try:
//             result = test_fn()
//             actual_result = str(result[1])

//             if actual_result == expected:
//                 print(f"Test case {i + 1}: PASSED")
//             else:
//                 print(f"Test case {i + 1}: FAILED")
//                 print(f"  Expected: {expected}")
//                 print(f"  Got: {actual_result}")
//         except Exception as e:
//             print(f"Test case {i + 1}: ERROR - {str(e)}")

// run_tests()
// `;

//   return testScript;
// }

// /**
//  * Generate JavaScript test code
//  */
// function generateJavaScriptTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   let testScript = `${code}

// function runTests() {
//   const testCases = [
// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `    // Test case ${index + 1}\n`;
//     testScript += `    {\n`;
//     testScript += `      run: () => {\n`;
//     testScript += `        ${parseInput(testCase.input, "javascript")}\n`;
//     testScript += `        return ${functionName}(nums, target);\n`;
//     testScript += `      },\n`;
//     testScript += `      expected: ${testCase.output}\n`;
//     testScript += `    },\n`;
//   });

//   testScript += `  ];

//   testCases.forEach((testCase, index) => {
//     try {
//       const result = testCase.run();
//       const actualResult = JSON.stringify(result);
//       const expectedResult = JSON.stringify(testCase.expected);

//       if (actualResult === expectedResult) {
//         console.log(\`Test case \${index + 1}: PASSED\`);
//       } else {
//         console.log(\`Test case \${index + 1}: FAILED\`);
//         console.log(\`  Expected: \${expectedResult}\`);
//         console.log(\`  Got: \${actualResult}\`);
//       }
//     } catch (error) {
//       console.log(\`Test case \${index + 1}: ERROR - \${error.message}\`);
//     }
//   });
// }

// runTests();
// `;

//   return testScript;
// }

// /**
//  * Generate Java test code
//  */
// function generateJavaTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   let testScript = `
// import java.util.Arrays;

// ${code}

// public class Main {
//     public static void main(String[] args) {
//         Solution solution = new Solution();

// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `        // Test case ${index + 1}\n`;
//     testScript += `        try {\n`;
//     testScript += `            ${parseInput(testCase.input, "java")}\n`;
//     testScript += `            int[] result = solution.${functionName}(nums, target);\n`;
//     testScript += `            String actualResult = Arrays.toString(result);\n`;
//     testScript += `            String expectedResult = "${testCase.output}";\n`;
//     testScript += `            \n`;
//     testScript += `            if (actualResult.equals(expectedResult)) {\n`;
//     testScript += `                System.out.println("Test case ${index + 1}: PASSED");\n`;
//     testScript += `            } else {\n`;
//     testScript += `                System.out.println("Test case ${index + 1}: FAILED");\n`;
//     testScript += `                System.out.println("  Expected: " + expectedResult);\n`;
//     testScript += `                System.out.println("  Got: " + actualResult);\n`;
//     testScript += `            }\n`;
//     testScript += `        } catch (Exception e) {\n`;
//     testScript += `            System.out.println("Test case ${index + 1}: ERROR - " + e.getMessage());\n`;
//     testScript += `        }\n\n`;
//   });

//   testScript += `    }\n}\n`;

//   return testScript;
// }

// /**
//  * Generate C++ test code
//  */
// function generateCppTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   let testScript = `#include <iostream>
// #include <vector>
// #include <string>
// #include <sstream>

// ${code}

// std::string vectorToString(const std::vector<int>& vec) {
//     std::stringstream ss;
//     ss << "[";
//     for (size_t i = 0; i < vec.size(); ++i) {
//         if (i > 0) ss << ", ";
//         ss << vec[i];
//     }
//     ss << "]";
//     return ss.str();
// }

// int main() {
//     Solution solution;

// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `    // Test case ${index + 1}\n`;
//     testScript += `    try {\n`;
//     testScript += `        ${parseInput(testCase.input, "cpp")}\n`;
//     testScript += `        std::vector<int> result = solution.${functionName}(nums, target);\n`;
//     testScript += `        std::string actualResult = vectorToString(result);\n`;
//     testScript += `        std::string expectedResult = "${testCase.output}";\n`;
//     testScript += `        \n`;
//     testScript += `        if (actualResult == expectedResult) {\n`;
//     testScript += `            std::cout << "Test case ${index + 1}: PASSED" << std::endl;\n`;
//     testScript += `        } else {\n`;
//     testScript += `            std::cout << "Test case ${index + 1}: FAILED" << std::endl;\n`;
//     testScript += `            std::cout << "  Expected: " << expectedResult << std::endl;\n`;
//     testScript += `            std::cout << "  Got: " << actualResult << std::endl;\n`;
//     testScript += `        }\n`;
//     testScript += `    } catch (const std::exception& e) {\n`;
//     testScript += `        std::cout << "Test case ${index + 1}: ERROR - " << e.what() << std::endl;\n`;
//     testScript += `    }\n\n`;
//   });

//   testScript += `    return 0;\n}\n`;

//   return testScript;
// }

// /**
//  * Generate Go test code
//  */
// function generateGoTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   const formattedCode = code.replace(/^func/, "// Implementation\nfunc");

//   let testScript = `package main

// import (
// 	"fmt"
// 	"reflect"
// )

// ${formattedCode}

// func vectorToString(vec []int) string {
// 	result := "["
// 	for i, v := range vec {
// 		if i > 0 {
// 			result += ", "
// 		}
// 		result += fmt.Sprintf("%d", v)
// 	}
// 	result += "]"
// 	return result
// }

// func main() {
// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `	// Test case ${index + 1}\n`;
//     testScript += `	func() {\n`;
//     testScript += `		defer func() {\n`;
//     testScript += `			if r := recover(); r != nil {\n`;
//     testScript += `				fmt.Printf("Test case ${index + 1}: ERROR - %v\\n", r)\n`;
//     testScript += `			}\n`;
//     testScript += `		}()\n\n`;
//     testScript += `		${parseInput(testCase.input, "go")}\n`;
//     testScript += `		result := ${functionName}(nums, target)\n`;
//     testScript += `		actualResult := vectorToString(result)\n`;
//     testScript += `		expectedResult := "${testCase.output}"\n`;
//     testScript += `		\n`;
//     testScript += `		if actualResult == expectedResult {\n`;
//     testScript += `			fmt.Printf("Test case ${index + 1}: PASSED\\n")\n`;
//     testScript += `		} else {\n`;
//     testScript += `			fmt.Printf("Test case ${index + 1}: FAILED\\n")\n`;
//     testScript += `			fmt.Printf("  Expected: %s\\n", expectedResult)\n`;
//     testScript += `			fmt.Printf("  Got: %s\\n", actualResult)\n`;
//     testScript += `		}\n`;
//     testScript += `	}()\n\n`;
//   });

//   testScript += `}\n`;

//   return testScript;
// }

// /**
//  * Generate Rust test code
//  */
// function generateRustTestCode(
//   functionName: string,
//   code: string,
//   testCases: Array<{ input: string; output: string }>,
// ): string {
//   const formattedCode = code.replace(
//     /^impl Solution/,
//     "struct Solution;\n\nimpl Solution",
//   );

//   let testScript = `${formattedCode}

// fn vector_to_string(vec: &Vec<i32>) -> String {
//     let elements: Vec<String> = vec.iter().map(|&x| x.to_string()).collect();
//     format!("[{}]", elements.join(", "))
// }

// fn main() {
// `;

//   // Add test cases
//   testCases.forEach((testCase, index) => {
//     testScript += `    // Test case ${index + 1}\n`;
//     testScript += `    (|| {\n`;
//     testScript += `        ${parseInput(testCase.input, "rust")}\n`;
//     testScript += `        let result = Solution::${functionName.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()}(nums, target);\n`;
//     testScript += `        let actual_result = vector_to_string(&result);\n`;
//     testScript += `        let expected_result = "${testCase.output}";\n`;
//     testScript += `        \n`;
//     testScript += `        if actual_result == expected_result {\n`;
//     testScript += `            println!("Test case ${index + 1}: PASSED");\n`;
//     testScript += `        } else {\n`;
//     testScript += `            println!("Test case ${index + 1}: FAILED");\n`;
//     testScript += `            println!("  Expected: {}", expected_result);\n`;
//     testScript += `            println!("  Got: {}", actual_result);\n`;
//     testScript += `        }\n`;
//     testScript += `    })();\n\n`;
//   });

//   testScript += `}\n`;

//   return testScript;
// }
