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
  villaTypes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      floorAreasSqFt: z.array(
        z.object({ floor: z.string(), area: z.number() }),
      ),
      totalAreaSqFt: z.number(),
      bedrooms: z.number().nullable(),
      bathrooms: z.number().nullable(),
      availability: z.string(),
      approvalState: z.string(),
      publicationNote: z.string(),
    }),
  ),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      deliveryState: z.string(),
      approvalState: z.string(),
      publicationNote: z.string(),
    }),
  ),
  specifications: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      details: z.array(z.string()),
      approvalState: z.string(),
      publicationNote: z.string(),
    }),
  ),
  location: z.object({
    address: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    landmarks: z.array(
      z.object({
        name: z.string(),
        distanceKm: z.number(),
        category: z.string(),
      }),
    ),
    approvalState: z.string(),
    publicationNote: z.string(),
  }),
});

export const project = projectSummarySchema.parse(projectContent);
