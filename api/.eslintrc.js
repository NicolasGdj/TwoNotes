module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
  },
  plugins: ["prettier", "cypress", "promise"],
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "no-shadow": "off",
        "no-undef": "off",
      },
    },
  ],
  extends: [
    "prettier",
    "plugin:import/recommended",
    "plugin:node/recommended",
    "eslint:recommended",
  ],
  rules: {
    "prettier/prettier": "error",
  },
};
