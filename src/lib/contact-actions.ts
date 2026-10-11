import projectContent from "../../content/data/glitz-pride.json";
import { z } from "zod";

const channelSchema = z.object({
  type: z.enum(["email", "mobile", "phone", "website"]),
  value: z.string().min(1),
});

const contactSchema = z.object({
  id: z.string(),
  region: z.string(),
  organization: z.string(),
  address: z.string().nullable(),
  channels: z.array(channelSchema),
  approvalState: z.string(),
  publicationNote: z.string(),
});

const contentSchema = z.object({
  contacts: z.array(contactSchema),
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      approvalState: z.string(),
      publicationNote: z.string(),
    }),
  ),
});

const content = contentSchema.parse(projectContent);
function requireContent<T>(value: T | undefined): T {
  if (!value) throw new Error("Brochure contact content is incomplete.");
  return value;
}

const keralaOffice = requireContent(
  content.contacts.find((contact) => contact.id === "contact-kerala-office"),
);
const brochure = requireContent(
  content.documents.find(
    (document) => document.id === "document-glitz-brochure",
  ),
);

function telephoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, "")}`;
}

function normalizeWhatsAppNumber(value?: string) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function getContactActions() {
  const email = keralaOffice.channels.find(
    (channel) => channel.type === "email",
  )?.value;
  const phones = keralaOffice.channels
    .filter((channel) => channel.type === "mobile")
    .map((channel) => ({
      label: channel.value,
      href: telephoneHref(channel.value),
    }));
  const whatsappNumber = normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );
  const whatsappMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim() ||
    "Hello, I would like to know more about Glitz Pride.";

  return {
    brochure: {
      title: brochure.title,
      href: "/reference/glitz-pride/brochure.pdf",
      downloadName: "Glitz-Pride-Brochure.pdf",
    },
    office: {
      organization: keralaOffice.organization,
      region: keralaOffice.region,
      address: keralaOffice.address,
      email: email
        ? {
            label: email,
            href: `mailto:${email}?subject=${encodeURIComponent("Glitz Pride enquiry")}`,
          }
        : null,
      phones,
    },
    whatsapp: whatsappNumber
      ? {
          enabled: true as const,
          href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
        }
      : {
          enabled: false as const,
          href: null,
        },
    verificationNote:
      "The call and email details are reproduced from the official brochure. The WhatsApp destination was separately confirmed by AKHIL on 11 October 2026.",
  };
}
