import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const env = loadEnv("production", ".", "");

const repoName = env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = env.GITHUB_ACTIONS === "true";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPagesBuild && repoName ? `/${repoName}/` : "/",
});
