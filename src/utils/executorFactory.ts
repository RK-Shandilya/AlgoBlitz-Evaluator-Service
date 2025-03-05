import PythonExecutor from "../containers/pythonExecutor";
import CodeExecutorStrategy from "../types/codeExecutorStrategy";
import CPPExecutor from "../containers/cppExecutor";
import javaExecutor from "../containers/javaExecutor";
import RustExecutor from "../containers/rustExecutor";

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
  } else {
    return null;
  }
}
