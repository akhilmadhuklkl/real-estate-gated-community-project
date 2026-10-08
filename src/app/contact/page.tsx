import Image from "next/image";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { TrackedContactAction } from "@/components/contact/tracked-contact-action";
import { getContactActions } from "@/lib/contact-actions";
import { createPageMetadata } from "@/lib/seo";

import "./contact.css";

export const metadata = createPageMetadata({
  title: "Contact and visits",
  description:
    "Ask a question or prepare a site-visit request for the Glitz Pride villa community.",
  path: "/contact",
  image: "/reference/glitz-pride/about-photo.jpg",
});

export default function ContactPage() {
  const actions = getContactActions();

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <Image
          className="contact-hero__image"
          src="/reference/glitz-pride/about-photo.jpg"
          alt="Brochure rendering of a landscaped villa entrance"
          fill
          priority
          sizes="100vw"
        />
        <div className="contact-hero__overlay" />
        <div className="page-shell contact-hero__content">
          <p className="eyebrow">Begin a conversation</p>
          <h1>Visit at your own pace.</h1>
          <p>
            Ask a considered question or propose a convenient day to experience
            the community in person.
          </p>
        </div>
      </section>

      <section className="contact-introduction">
        <div className="page-shell contact-introduction__grid">
          <div>
            <p className="eyebrow">A clear first step</p>
            <h2>One request. No assumptions.</h2>
          </div>
          <div className="contact-introduction__copy">
            <p>
              The official brochure lists contact channels, but their current
              owners, operating hours, publication permission, and request
              routing have not yet been confirmed.
            </p>
            <p>
              This private-preview flow validates your request and demonstrates
              every form state. It does not store, email, or forward personal
              details until an approved recipient and retention policy are
              configured.
            </p>
          </div>
        </div>
      </section>

      <section
        className="contact-actions"
        aria-labelledby="contact-actions-title"
      >
        <div className="page-shell">
          <div className="contact-actions__heading">
            <div>
              <p className="eyebrow">Choose your next step</p>
              <h2 id="contact-actions-title">Details when you need them.</h2>
            </div>
            <p>{actions.verificationNote}</p>
          </div>

          <div className="contact-actions__grid">
            <article className="contact-action-card contact-action-card--feature">
              <span className="contact-action-card__number">01</span>
              <div>
                <p className="contact-action-card__label">Official brochure</p>
                <h3>Keep the complete reference close.</h3>
                <p>
                  Download the supplied development brochure for villa plans,
                  listed specifications, location references, and office
                  details.
                </p>
              </div>
              <TrackedContactAction
                action="brochure"
                href={actions.brochure.href}
                download={actions.brochure.downloadName}
                label="official_brochure"
              >
                Download brochure <span aria-hidden="true">↓</span>
              </TrackedContactAction>
            </article>

            <article className="contact-action-card">
              <span className="contact-action-card__number">02</span>
              <div>
                <p className="contact-action-card__label">Call</p>
                <h3>Speak with the brochure-listed office.</h3>
                <p>{actions.office.address}</p>
              </div>
              <div className="contact-action-card__links">
                {actions.office.phones.map((phone, index) => (
                  <TrackedContactAction
                    key={phone.href}
                    action="call"
                    href={phone.href}
                    label={`kerala_mobile_${index + 1}`}
                  >
                    {phone.label} <span aria-hidden="true">↗</span>
                  </TrackedContactAction>
                ))}
              </div>
            </article>

            <article className="contact-action-card">
              <span className="contact-action-card__number">03</span>
              <div>
                <p className="contact-action-card__label">Email</p>
                <h3>Write with the details that matter.</h3>
                <p>
                  Your email application will open with a Glitz Pride subject
                  line. No form details are copied automatically.
                </p>
              </div>
              {actions.office.email ? (
                <TrackedContactAction
                  action="email"
                  href={actions.office.email.href}
                  label="kerala_office_email"
                >
                  {actions.office.email.label} <span aria-hidden="true">↗</span>
                </TrackedContactAction>
              ) : null}
            </article>

            <article className="contact-action-card">
              <span className="contact-action-card__number">04</span>
              <div>
                <p className="contact-action-card__label">WhatsApp</p>
                <h3>Continue in a familiar conversation.</h3>
                <p>
                  The brochure does not identify a WhatsApp contact. This action
                  will activate after the owner confirms the number and opening
                  message.
                </p>
              </div>
              {actions.whatsapp.enabled ? (
                <TrackedContactAction
                  action="whatsapp"
                  href={actions.whatsapp.href}
                  label="approved_whatsapp"
                  target="_blank"
                >
                  Open WhatsApp <span aria-hidden="true">↗</span>
                </TrackedContactAction>
              ) : (
                <span
                  className="contact-action-link contact-action-link--disabled"
                  aria-disabled="true"
                >
                  Awaiting owner confirmation
                </span>
              )}
            </article>
          </div>

          <p className="contact-actions__privacy">
            Action events record only the selected channel and page location.
            They do not include names, phone numbers, email addresses, or form
            entries.
          </p>
        </div>
      </section>

      <section className="contact-form-section">
        <div className="page-shell">
          <EnquiryForm />
        </div>
      </section>

      <section className="contact-assurance">
        <div className="page-shell contact-assurance__grid">
          <div>
            <span>01</span>
            <h3>Minimal details</h3>
            <p>Only your name and one reply channel are required.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Explicit consent</h3>
            <p>The form stays inactive until you make an informed choice.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Honest delivery</h3>
            <p>
              Preview references never imply that an owner received the request.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
