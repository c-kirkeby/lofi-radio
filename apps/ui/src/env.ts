import { defineEnvVars } from "@sveltejs/kit/hooks";

export const variables = defineEnvVars({
  PODCAST_INDEX_KEY: {},
  PODCAST_INDEX_SECRET: {},
});
