# Glitz Pride AI-Driven Gated Community Application

## Product brief

**Document status:** Draft for owner approval  
**Task:** T0003 — Finalize product brief  
**Owner:** AKHIL  
**Prepared:** 2 September 2026

## 1. Product vision

Create a premium digital property experience for the Glitz Pride gated villa community that combines architectural storytelling, responsive property exploration, and a grounded AI concierge.

The application will preserve the recognizable nature-led character and core information of the existing Glitz Homes website while replacing its dated brochure-style experience with an original, modern implementation for desktop, tablet, and mobile.

The defining experience will eventually allow visitors to explore the community through conversation. The AI concierge will answer questions from approved project information while opening relevant villa plans, amenity images, maps, comparisons, documents, references, and authorized contact cards in a contextual preview panel.

## 2. Product promise

**Explore the entire community through a conversation.**

Every visitor should be able to understand the project, identify a suitable villa, verify important information, and take the next step without navigating an overwhelming property portal.

## 3. Phase 1 objective

Design and build a production-ready responsive web application that:

- Presents Glitz Pride as a calm, nature-connected luxury villa community.
- Works correctly across desktop, laptop, tablet, and mobile browsers.
- Makes villas, plans, amenities, specifications, location, and project media easy to explore.
- Provides clear paths to download the brochure, contact the project, and schedule a visit.
- Uses a structured content model that can later serve the AI knowledge system.
- Meets agreed standards for accessibility, performance, security, testing, and SEO.

## 4. Phase 2 objective

Add a grounded AI property concierge that:

- Answers project-specific questions using approved evidence.
- Displays citations, source sections, and information update dates.
- Selects deterministic visual components for a contextual preview panel.
- Recommends villa types using declared buyer preferences and approved rules.
- Supports multilingual conversation and optional voice interaction.
- Qualifies leads and prepares a user-reviewable summary.
- Hands conversations to an authorized person or department with explicit user consent.
- Does not invent pricing, availability, legal details, completion dates, or contact information.

## 5. Primary audiences

- **Prospective residents:** Families and individuals evaluating a premium villa for primary residence, relocation, retirement, or long-term family living.
- **Property investors:** Buyers evaluating project credibility, configuration, location, specifications, and availability. The application will not provide financial advice or guarantee returns.
- **Remote and overseas buyers:** Visitors who need a trustworthy digital understanding before arranging a visit, including users who may prefer Malayalam, Hindi, or Arabic.
- **Sales and project teams:** Authorized staff who need accurate enquiries, buyer context, visit requests, and maintainable approved project information.

## 6. Core user journeys

1. Discover the project through the homepage and understand its positioning.
2. Browse villa types and open an individual villa detail page.
3. Examine floor plans, specifications, galleries, and relevant amenities.
4. Explore the master plan and understand where important facilities are located.
5. Assess connectivity using the map and verified nearby landmarks.
6. Compare suitable villa types using consistent approved attributes.
7. Download the current approved project brochure.
8. Ask a question and receive a cited answer with a relevant visual preview in Phase 2.
9. Request a call, initiate WhatsApp contact, or schedule a site visit.
10. Review information before completing an enquiry or AI-assisted handoff.

## 7. Phase 1 information architecture

- Home
- The Community
- Villas and Villa Details
- Amenities
- Master Plan
- Gallery
- Location
- Specifications
- Frequently Asked Questions
- Contact / Schedule a Visit
- Privacy and legal information

## 8. Phase 1 MVP capabilities

- Responsive navigation and page layouts
- Cinematic homepage with clear conversion actions
- Structured villa catalogue and detail templates
- Responsive floor-plan and master-plan viewers
- Villa comparison
- Filterable image and video galleries
- Amenity and construction-specification content
- Project map and source-backed nearby landmarks
- Brochure download
- Validated enquiry and visit-booking forms
- Click-to-call, email, and WhatsApp actions
- Consent and privacy handling
- Search metadata, structured data, sitemap, and social previews
- Accessible interaction and reduced-motion support
- Automated tests for critical journeys

## 9. Phase 2 MVP capabilities

- Streaming conversational property assistant
- Retrieval from structured data and approved documents
- Source citations and last-updated information
- Dynamic preview panel for plans, galleries, maps, comparisons, documents, and contacts
- Explainable villa recommendations
- English, Malayalam, Hindi, and Arabic support, subject to content approval
- Optional speech input and spoken responses
- Lead qualification with data minimization
- User-approved human handoff
- Knowledge ingestion, approval, versioning, and rollback workflow
- Evaluation suite covering retrieval, groundedness, citations, refusals, safety, latency, and cost
- Privacy-safe operational monitoring

## 10. Experience principles

- **Calm luxury:** Warm natural colors, refined typography, strong architecture, generous space, and restrained motion.
- **Evidence before persuasion:** Important property claims connect to an approved source; estimates and proposed features are identified accurately.
- **Visual exploration:** Prefer plans, maps, imagery, comparisons, and concise copy over long uninterrupted marketing text.
- **Mobile equivalence:** Mobile visitors receive the same information and functional capability, adapted for touch and limited screen space.
- **Human control:** Visitors decide when personal information or conversation context is shared.

## 11. Initial visual direction

- **Mood:** Nature-led, architectural, calm, private, and premium
- **Palette:** Warm ivory, forest green, terracotta, charcoal, and muted gold
- **Imagery:** Villas, material details, landscape, daylight, family lifestyle, and community spaces
- **Motion:** Smooth and purposeful, with reduced-motion support
- **Layout:** Editorial property storytelling with clear hierarchy and generous spacing
- **Originality:** Reuse approved Glitz assets and factual content where permitted, without copying third-party source code or another designer's layout pixel for pixel

## 12. Content and data principles

- Every content item has an owner, approval state, and last-reviewed date.
- Pricing and availability come from an authoritative structured source.
- Legal and RERA information is published only after verification.
- Images, plans, brochures, names, photographs, and direct contact details require publication rights.
- AI-retrievable content includes stable identifiers and source metadata.
- Superseded information remains auditable but is not presented as current.

## 13. Success measures

Final numeric targets will be approved after baseline analytics and business goals are available. The MVP will measure:

- Qualified enquiry and site-visit completion rates
- Brochure, villa-detail, and comparison engagement
- Mobile completion parity
- Core Web Vitals and accessibility findings
- Enquiry delivery success and failure rate
- Phase 2 answer groundedness and citation accuracy
- Phase 2 unresolved-question and human-handoff rate
- Phase 2 response latency and cost per conversation

## 14. Out of scope for the initial Phase 1 MVP

- Native Android or iOS applications
- Online property purchase or payment collection
- Legally binding inventory reservation
- Automated investment or financial advice
- Unapproved third-party property listings
- Fully generated architectural or legal claims
- Augmented-reality experiences

These may be considered as separate future MVPs after the first two phases have measurable evidence.

## 15. Initial technical direction

- Next.js and React with TypeScript
- Tailwind CSS and reusable accessible components
- PostgreSQL as the structured system of record
- Typed validation at form, API, database, and AI boundaries
- Automated unit, integration, and browser-level testing
- Versioned content, database migrations, and environment configuration
- Deployment previews and production monitoring
- Retrieval-based AI architecture with structured outputs in Phase 2

Exact dependencies and verified versions are maintained in `AI-Driven-Gated-Community-Tracker.xlsx`.

## 16. Required owner decisions

The following decisions are needed before or during T0004–T0007:

1. Confirm that **Glitz Pride** is the final public project name.
2. Confirm permission to use the current Glitz logo, copy, brochure, images, plans, specifications, and contact information.
3. Provide the authoritative project address, map coordinates, RERA details, completion status, and legal disclaimers.
4. Confirm whether prices and live availability will be public.
5. Confirm the primary action: schedule a visit, WhatsApp, request a callback, or another action.
6. Identify approved sales, visit, architecture, and support contacts.
7. Confirm whether a content-management system is required in Phase 1.
8. Confirm the production domain and preferred hosting account.
9. Confirm launch languages; the initial Phase 1 assumption is English.
10. Approve the visual direction or provide reference websites for refinement.

## 17. Acceptance criteria for T0003

T0003 is complete when the owner:

- Approves the product vision and two-phase scope.
- Approves or corrects the primary audiences and journeys.
- Confirms the Phase 1 exclusions.
- Accepts the initial visual direction as the basis for design exploration.
- Records material changes required before content inventory and sitemap work continue.
