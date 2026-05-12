import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      // Formatting
      indent: ["error", 2, { SwitchCase: 1 }],
      quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ["error", "always"],
      "comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "always-multiline",
        },
      ],

      // Variables
      "no-unused-vars": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",

      // ES6+
      "object-shorthand": ["error", "always"],
      "quote-props": ["error", "as-needed"],
      "prefer-template": "error",
      "template-curly-spacing": ["error", "never"],
      "dot-notation": "error",
      "no-useless-escape": "error",

      // Arrow functions
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "arrow-spacing": ["error", { before: true, after: true }],
      "arrow-parens": ["error", "always"],
      "arrow-body-style": ["error", "as-needed"],
      "no-confusing-arrow": ["error", { allowParens: true }],
      "implicit-arrow-linebreak": ["error", "beside"],

      // Imports
      "no-duplicate-imports": "error",

      // Whitespace
      "no-multi-spaces": "error",
      "space-before-blocks": "error",
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": "error",
      "eol-last": ["error", "always"],
      "newline-per-chained-call": ["error", { ignoreChainWithDepth: 4 }],
      "no-whitespace-before-property": "error",
      "padded-blocks": ["error", "never"],
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
      "space-in-parens": ["error", "never"],
      "array-bracket-spacing": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "block-spacing": ["error", "always"],
      "comma-spacing": ["error", { before: false, after: true }],
      "computed-property-spacing": ["error", "never"],
      "func-call-spacing": ["error", "never"],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "no-trailing-spaces": "error",

      // Naming
      camelcase: ["error", { properties: "never", ignoreDestructuring: false }],
      "new-cap": ["error", { newIsCap: true, capIsNew: false }],

      // Import order
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
      "import/extensions": "off",
    },
  },

  {
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".ts"],
        },
      },
      "import/extensions": [".js", ".ts"],
    },
  },

  globalIgnores(["**/node_modules/**", "**/dist/**"]),
]);
