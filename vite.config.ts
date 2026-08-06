import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const appEnv = process.env.VITE_APP_ENV ?? "beta";
  const appTitle =
    appEnv === "beta" ? "Southerners Cup Beta" : "The Southerners Cup";

  return {
    define: {
      __APP_ENV__: JSON.stringify(appEnv),
      __APP_TITLE__: JSON.stringify(appTitle),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "southerners-cup-html-env",
        transformIndexHtml(html) {
          return html.replaceAll("__APP_TITLE__", appTitle);
        },
      },
    ],
    resolve: {
      alias: {
        "@": `${import.meta.dirname}/src`,
      },
    },
  };
});
