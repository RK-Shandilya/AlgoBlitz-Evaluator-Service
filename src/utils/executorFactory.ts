// import PythonExecutor from "../containers/pythonExecutor";
import CodeExecutorStrategy from "../types/codeExecutorStrategy";
import CPPExecutor from "../containers/cppExecutor";
import javaExecutor from "../containers/javaExecutor";

export default function createExecutor(
  codeLanguage: string,
): CodeExecutorStrategy | null {
  if (codeLanguage.toLowerCase() === "java") {
    return new javaExecutor();
  } else if (codeLanguage.toLowerCase() === "cpp") {
    return new CPPExecutor();
  } else {
    return null;
  }
}
