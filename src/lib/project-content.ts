import projectContent from "../../content/data/glitz-pride.json";
import { z } from "zod";

const projectSummarySchema = z.object({
  schemaVersion: z.string(),
  project: z.object({
    id: z.string(),
    name: z.string(),
    developer: z.string(),
    category: z.string(),
    summary: z.string(),
    architect: z.string().optional(),
    approvalState: z.string(),
  }),
  villaTypes: z.array(z.object({ id: z.string(), totalAreaSqFt: z.number() })),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      deliveryState: z.string(),
    }),
  ),
  location: z.object({
    address: z.string(),
    landmarks: z.array(
      z.object({
        name: z.string(),
        distanceKm: z.number(),
        category: z.string(),
      }),
    ),
  }),
});

export const project = projectSummarySchema.parse(projectContent);
