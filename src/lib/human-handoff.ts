import { z } from "zod";

import { getContactActions } from "./contact-actions";

export const handoffRouteValues = [
  "sales",
  "visit",
  "architecture",
  "support",
] as const;
export const handoffRouteSchema = z.enum(handoffRouteValues);
export type HandoffRoute = z.infer<typeof handoffRouteSchema>;

export type HumanHandoff = {
  route: HandoffRoute;
  routeLabel: string;
  ownerLabel: string;
  reason: string;
  whatsappHref: string | null;
  workingHours: "Not confirmed";
  serviceLevel: "Not confirmed";
  limitations: string[];
  consentNotice: string;
};

const visitPattern = /\b(?:site )?visit|tour|viewing|appointment\b/i;
const architecturePattern =
  /\barchitect|architecture|structural|design team|customi[sz]|technical drawing|construction drawing\b/i;
const supportPattern =
  /\bsupport|complaint|problem|issue|reschedule|cancel|change (?:my|the) request|existing request|reference number\b/i;

const routeCopy: Record<
  HandoffRoute,
  Pick<HumanHandoff, "routeLabel" | "ownerLabel" | "reason">
> = {
  sales: {
    routeLabel: "Sales enquiry",
    ownerLabel: "Project enquiry coordinator",
    reason:
      "For general buying, availability, pricing, and callback questions.",
  },
  visit: {
    routeLabel: "Visit coordination",
    ownerLabel: "Visit coordinator",
    reason: "For proposed site visits and viewing preferences.",
  },
  architecture: {
    routeLabel: "Architecture question",
    ownerLabel: "General project coordinator for architecture triage",
    reason:
      "A direct architect contact is not approved, so the general coordinator must triage the question.",
  },
  support: {
    routeLabel: "Request support",
    ownerLabel: "General project support coordinator",
    reason:
      "For an existing request, correction, cancellation, or other support need.",
  },
};

export function classifyHandoffRoute(value: string): HandoffRoute {
  if (supportPattern.test(value)) return "support";
  if (architecturePattern.test(value)) return "architecture";
  if (visitPattern.test(value)) return "visit";
  return "sales";
}

function routeMessage(route: HandoffRoute) {
  return {
    sales: "Hello, I would like help with a Glitz Pride sales enquiry.",
    visit: "Hello, I would like help coordinating a Glitz Pride site visit.",
    architecture:
      "Hello, I have an architecture question about Glitz Pride for the appropriate project contact.",
    support:
      "Hello, I would like help with an existing Glitz Pride request or support question.",
  }[route];
}

function approvedWhatsAppHref(route: HandoffRoute) {
  const configured = getContactActions().whatsapp;
  if (!configured.enabled || !configured.href) return null;
  const destination = configured.href.split("?")[0];
  return `${destination}?text=${encodeURIComponent(routeMessage(route))}`;
}

export function buildHumanHandoff(route: HandoffRoute): HumanHandoff {
  return {
    route,
    ...routeCopy[route],
    whatsappHref: approvedWhatsAppHref(route),
    workingHours: "Not confirmed",
    serviceLevel: "Not confirmed",
    limitations: [
      "Selecting WhatsApp opens a neutral draft for your review; nothing is sent until you choose to send it.",
      "The route does not confirm receipt, availability, an appointment, or a response time.",
      "Conversation history and form details are not added to the WhatsApp message.",
    ],
    consentNotice:
      "Continue only if you want to review a handoff. You remain in control of whether any message or form is submitted.",
  };
}

export function routeHumanHandoff(value: string): HumanHandoff {
  return buildHumanHandoff(classifyHandoffRoute(value));
}
