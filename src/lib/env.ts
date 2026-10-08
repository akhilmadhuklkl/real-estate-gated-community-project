import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_INDEXABLE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_INDEXABLE: process.env.NEXT_PUBLIC_SITE_INDEXABLE,
});
