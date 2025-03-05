import PythonExecutor from "../containers/pythonExecutor.js";
import CodeExecutorStrategy from "../types/codeExecutorStrategy.js";
import CPPExecutor from "../containers/cppExecutor.js";
import javaExecutor from "../containers/javaExecutor.js";
import RustExecutor from "../containers/rustExecutor.js";
import GoExecutor from "../containers/goExecutor.js";
import JavaScriptExecutor from "../containers/javascriptExecutor.js";

export default function createExecutor(
  codeLanguage: string,
): CodeExecutorStrategy | null {
  if (codeLanguage.toLowerCase() === "java") {
    return new javaExecutor();
  } else if (codeLanguage.toLowerCase() === "cpp") {
    return new CPPExecutor();
  } else if (codeLanguage.toLowerCase() === "python") {
    return new PythonExecutor();
  } else if (codeLanguage.toLowerCase() === "rust") {
    return new RustExecutor();
  } else if (codeLanguage.toLowerCase() === "go") {
    return new GoExecutor();
  } else if (codeLanguage.toLowerCase() === "javascript") {
    return new JavaScriptExecutor();
  } else {
    return null;
  }
}
