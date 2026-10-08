import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the private Glitz Pride preview.",
};

export default function PrivacyPage() {
  return (
    <main className="planned-page">
      <div className="page-shell system-state__content">
        <p className="eyebrow">Privacy</p>
        <h1>Clear choices. Respectful handling.</h1>
        <p>
          The enquiry form in this private preview validates information only
          for the current request. It does not store, email, or forward the
          submitted details. No approved recipient, retention period, or
          production privacy notice has been configured yet.
        </p>
        <p>
          Do not submit sensitive financial, identity, health, or legal
          information. Production collection will remain disabled until the
          property owner approves the purpose, recipient, retention period,
          processors, and contact method for privacy requests.
        </p>
      </div>
    </main>
  );
}
