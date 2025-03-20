// import PythonExecutor from "../containers/pythonExecutor.js";
import { CodeExecutorStrategy } from "../types/codeExecutorStrategy.js";
import CPPExecutor from "../containers/cppExecutor.js";
// import javaExecutor from "../containers/javaExecutor.js";
// import RustExecutor from "../containers/rustExecutor.js";
// import GoExecutor from "../containers/goExecutor.js";
// import JavaScriptExecutor from "../containers/javascriptExecutor.js";

export default function createExecutor(
  codeLanguage: string,
): CodeExecutorStrategy | null {
  if (codeLanguage.toLowerCase() === "cpp") {
    return new CPPExecutor();
  } else {
    return null;
  }
}
