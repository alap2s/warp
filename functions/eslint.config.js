const {FlatCompat} = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  ...compat.extends("google"),
  {
    rules: {
      "quotes": ["error", "double"],
      "import/no-unresolved": 0,
    },
  },
];
