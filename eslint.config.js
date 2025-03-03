import eslintPluginPrettier from "eslint-plugin-prettier";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
      "semi": ["error", "always"],
      "no-unused-vars": "off"
    },
  },
];
