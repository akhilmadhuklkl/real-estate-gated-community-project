import { z } from "zod";

export const storageBuckets = {
  publicMedia: "public-media",
  protectedOriginals: "protected-originals",
  quarantine: "quarantine",
  recoveryExport: "recovery-export",
} as const;

const localHostnames = new Set(["127.0.0.1", "localhost"]);

const dataServiceEnvironmentSchema = z
  .object({
    DATA_ENVIRONMENT: z.enum(["local", "preview", "production"]),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  })
  .superRefine((value, context) => {
    const hostname = new URL(value.NEXT_PUBLIC_SUPABASE_URL).hostname;
    const isLocalEndpoint = localHostnames.has(hostname);

    if (value.DATA_ENVIRONMENT === "local" && !isLocalEndpoint) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
        message: "Local development must use the isolated local data service.",
      });
    }

    if (value.DATA_ENVIRONMENT !== "local" && isLocalEndpoint) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
        message: "Deployed environments cannot use a local data-service URL.",
      });
    }
  });

export type DataServiceEnvironment = z.infer<
  typeof dataServiceEnvironmentSchema
>;

export function parseDataServiceEnvironment(
  input: Record<string, string | undefined>,
): DataServiceEnvironment {
  return dataServiceEnvironmentSchema.parse(input);
}
