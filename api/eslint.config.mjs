import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node
    },
    rules: {
      "indent": ["error", 4],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-unused-vars": ["warn"],
      "no-console": "off"
    }
  }
];