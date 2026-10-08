import type { Metadata } from "next";
import Image from "next/image";

import { EnquiryForm } from "@/components/contact/enquiry-form";

import "./contact.css";

export const metadata: Metadata = {
  title: "Contact and visits",
  description:
    "Ask a question or prepare a site-visit request for the Glitz Pride villa community.",
};

export default function ContactPage() {
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
