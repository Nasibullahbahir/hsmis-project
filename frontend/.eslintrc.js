module.exports = {
  rules: {
    // Critical issues - RED
    "no-debugger": "error",
    eqeqeq: "error",
    "no-duplicate-imports": "error",

    // Code quality issues - YELLOW
    "no-console": "warn",
    "no-unused-vars": "warn",
    "react/prop-types": "warn",

    // Style issues - YELLOW (or off if too noisy)
    semi: "warn",
    "comma-spacing": "warn",
    "keyword-spacing": "warn",

    // Disabled
    "react/react-in-jsx-scope": "off",
  },
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  plugins: ["react"],
  rules: {
    "no-console": "warn", // Changed to warn (yellow)
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn", // Dev: warn, Prod: error
    "react/prop-types": "warn", // Changed to warn (yellow)

    // Best Practices - Some changed to warn
    eqeqeq: "error",
    "no-invalid-this": "warn", // Changed to warn
    "no-return-assign": "warn", // Changed to warn
    "no-unused-expressions": ["warn", { allowTernary: true }], // Changed to warn
    "no-useless-concat": "warn", // Changed to warn
    "no-useless-return": "warn", // Changed to warn

    // Variable
    "no-use-before-define": "warn", // Changed to warn
    "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z]" }], // Changed to warn

    // Stylistic Issues - Many changed to warn
    "array-bracket-spacing": "warn",
    "brace-style": ["warn", "1tbs", { allowSingleLine: true }],
    "block-spacing": "warn",
    "comma-dangle": ["warn", "only-multiline"],
    "comma-spacing": "warn",
    "comma-style": "warn",
    "computed-property-spacing": "warn",
    "keyword-spacing": "warn",
    "no-mixed-operators": "warn",
    "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],
    "no-tabs": "warn",
    "no-unneeded-ternary": "warn",
    "no-whitespace-before-property": "warn",
    "object-property-newline": ["warn", { allowAllPropertiesOnSameLine: true }],
    "quote-props": ["warn", "as-needed"],
    semi: ["warn", "always"], // Changed to warn
    "semi-spacing": "warn",
    "space-before-blocks": "warn",
    "space-in-parens": "warn",
    "space-infix-ops": "warn",
    "space-unary-ops": "warn",

    // ES6
    "arrow-spacing": "warn",
    "no-confusing-arrow": "warn",
    "no-duplicate-imports": "warn",
    "no-var": "warn",
    "object-shorthand": "warn",
    "prefer-const": "warn",
    "prefer-template": "warn",

    // React
    "react/react-in-jsx-scope": "off",

    // Additional warnings you might want
    "react/no-unused-state": "warn",
    "react/no-direct-mutation-state": "warn",
    "react/jsx-no-duplicate-props": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
