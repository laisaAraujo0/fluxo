export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        process: "readonly",
        __dirname: "readonly",
      },
      env: {
        browser: true,
        es2021: true,
        node: true, // ✅ Adicione isto
        jest: true, // ✅ para testes
        serviceworker: true, // ✅ para service-worker.js
      },
    },
  },
];
