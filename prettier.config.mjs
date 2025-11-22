// Root Prettier config - Common formatting rules for all packages in the monorepo
/** @type {import("prettier").Config} */
const prettierConfig = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 120,
  singleAttributePerLine: false,
  jsxSingleQuote: true,
  arrowParens: "avoid",

  // File-specific overrides
  overrides: [
    // {
    //   files: ['*.json', '*.jsonc'],
    //   options: {
    //     printWidth: 120,
    //     tabWidth: 2,
    //   },
    // },
  ],

  plugins: ["prettier-plugin-tailwindcss"],
};

export default prettierConfig;
