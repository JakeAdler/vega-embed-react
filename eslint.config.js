import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactBase from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

const pluginReact = pluginReactBase.configs.flat.recommended;

pluginReact.settings = {
  react: {
    version: "19.x",
  },
};

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact,
]);
