import { z } from "zod";

import { getContactActions } from "./contact-actions";

export const contactChannelValues = ["call", "email", "whatsapp"] as const;
export const contactChannelSchema = z.enum(contactChannelValues);
export type ContactChannel = z.infer<typeof contactChannelSchema>;

export type ContactReferenceCard = {
  id: string;
  displayName: string;
  personName: null;
  photo: null;
  role: string;
  languages: ["Not confirmed"];
  workingHours: "Not confirmed";
  responseTime: "Not confirmed";
  channels: Array<{
    type: "whatsapp";
    label: string;
    href: string;
  }>;
  source: {
    id: "KS-004";
    approvalId: "APR-004";
    label: string;
    reviewedOn: "2026-10-11";
  };
  limitations: string[];
};

export type ContactDirectoryResult = {
  cards: ContactReferenceCard[];
  unavailableChannels: ContactChannel[];
  directoryNotice: string;
};

export function getApprovedContactDirectory(
  requestedChannels: ContactChannel[],
): ContactDirectoryResult {
  const requested = new Set(requestedChannels);
  const approvedWhatsApp = getContactActions().whatsapp;
  const cards: ContactReferenceCard[] = [];

  if (
    requested.has("whatsapp") &&
    approvedWhatsApp.enabled &&
    approvedWhatsApp.href
  ) {
    cards.push({
      id: "contact-project-enquiries-whatsapp",
      displayName: "Glitz Pride project enquiries",
      personName: null,
      photo: null,
      role: "Project enquiry coordinator",
      languages: ["Not confirmed"],
      workingHours: "Not confirmed",
      responseTime: "Not confirmed",
      channels: [
        {
          type: "whatsapp",
          label: "Review WhatsApp message",
          href: approvedWhatsApp.href,
        },
      ],
      source: {
        id: "KS-004",
        approvalId: "APR-004",
        label: "Owner-approved WhatsApp destination",
        reviewedOn: "2026-10-11",
      },
      limitations: [
        "No individual contact name or photograph is approved for publication.",
        "Opening WhatsApp does not confirm delivery, availability, or a response time.",
        "The message remains under your control and is not sent automatically.",
      ],
    });
  }

  const unavailableChannels = requestedChannels.filter(
    (channel) => channel !== "whatsapp" || !approvedWhatsApp.enabled,
  );

  return {
    cards,
    unavailableChannels,
    directoryNotice:
      "Only professional contact details with recorded publication consent appear here. Unconfirmed details stay hidden.",
  };
}
