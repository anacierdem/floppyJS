module.exports = {
  parser: "babel-eslint",
  plugins: ["react", "prettier"],
  extends: ["airbnb", "prettier"],
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      webpack: {},
    },
  },
};
