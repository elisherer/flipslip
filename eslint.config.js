export default [
  {
    root: true,
    env: {
      browser: true,
      es2021: true,
    },
    extends: ["eslint:recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react", "@react-three"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-no-target-blank": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-spread": "off",
      "no-debugger": "warn",
      "no-constant-condition": "off",
      "no-unused-vars": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    ignores: ["!.*", "node_modules/", "coverage/", "reports/", "public/", "build/", "dist/"],
  },
];
