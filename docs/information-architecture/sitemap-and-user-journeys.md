# Sitemap and User Journeys

**Task:** T0005 — Define sitemap and journeys  
**Owner:** AKHIL  
**Status:** Completed  
**Prepared:** 3 September 2026  
**Applies to:** Responsive web MVP and future property concierge

## 1. Objective

Define a clear information architecture that helps visitors understand the community, explore available villa information, evaluate lifestyle and location, and take a deliberate next step. The same content structure must support desktop, tablet, mobile, search discovery, and the future conversational preview experience.

## 2. Navigation model

### Primary navigation

1. Home
2. Community
3. Villas
4. Amenities
5. Gallery
6. Location
7. Contact

### Persistent actions

- Download brochure
- Schedule a visit
- Call
- Message
- Open the property concierge when Phase 2 is enabled

On desktop, “Schedule a Visit” is the visually dominant header action. On mobile, the menu provides every primary destination and a compact bottom action bar exposes Call, Message, and Visit without covering page content.

### Footer navigation

- Primary navigation links
- Villa-type links when approved
- Specifications
- Frequently Asked Questions
- Brochure
- Contact information
- Privacy notice
- Terms and legal information
- Accessibility statement
- Project and regulatory information when verified
- Social profiles when officially approved

## 3. Sitemap

| Level | Route | Page | Purpose | Primary action | Content dependency |
| --- | --- | --- | --- | --- | --- |
| 1 | `/` | Home | Establish the project story and guide visitors into exploration. | Explore Villas | Approved hero media, positioning, highlights, and core facts. |
| 1 | `/community` | Community | Explain the vision, architecture, landscape, privacy, sustainability, security, and lifestyle. | Explore Amenities | Approved narrative, claims, and community imagery. |
| 1 | `/villas` | Villas | Browse and compare villa types using consistent attributes. | View Villa | Approved villa catalogue and availability policy. |
| 2 | `/villas/[slug]` | Villa Detail | Present one villa type through imagery, plans, dimensions, specifications, and contextual actions. | Schedule a Visit | Approved villa data, floor plans, imagery, and disclaimers. |
| 1 | `/compare` | Villa Comparison | Compare selected villa types side by side. | Ask About These Villas | Normalized villa attributes and comparison rules. |
| 1 | `/amenities` | Amenities | Explain lifestyle facilities with delivered or proposed status. | View Master Plan | Approved amenity list, status, descriptions, and imagery. |
| 1 | `/master-plan` | Master Plan | Make the overall layout understandable with accessible points of interest. | Explore a Villa | Approved high-resolution plan and publishable identifiers. |
| 1 | `/gallery` | Gallery | Browse exterior, interior, landscape, amenity, progress, and video media. | Schedule a Visit | Approved media, captions, dates, categories, and rights. |
| 1 | `/location` | Location | Explain verified connectivity, nearby landmarks, and directions. | Get Directions | Verified coordinates, landmark distances, and map provider. |
| 1 | `/specifications` | Specifications | Present construction and material specifications in a scannable format. | Ask a Question | Approved technical schedule and qualification notes. |
| 1 | `/faq` | Frequently Asked Questions | Answer common factual questions and reduce enquiry friction. | Contact the Team | Approved question-and-answer set with review dates. |
| 1 | `/contact` | Contact | Offer call, message, email, callback, and visit-booking options. | Schedule a Visit | Approved contact routes, hours, privacy text, and consent. |
| 1 | `/brochure` | Brochure | Explain the document version before initiating its download. | Download Brochure | Current approved brochure and effective date. |
| 1 | `/privacy` | Privacy | Explain data collection, purpose, retention, processors, and user choices. | Manage Consent | Approved privacy policy and retention decisions. |
| 1 | `/legal` | Legal and Project Information | Present verified regulatory, disclaimer, copyright, and project information. | Contact for Clarification | Verified legal and regulatory content. |
| 1 | `/accessibility` | Accessibility | State the accessibility target and provide a feedback channel. | Report an Issue | Approved accessibility contact and response process. |
| System | `/thank-you` | Enquiry Confirmation | Confirm a successful submission without exposing submitted data. | Continue Exploring | Working enquiry integration and reference identifier. |
| System | `/not-found` | Not Found | Recover visitors from an invalid or outdated URL. | Return Home | Navigation and search suggestions. |

## 4. Homepage content sequence

1. Cinematic hero with project name, concise promise, and Explore Villas action.
2. Trust strip containing only verified project facts.
3. Short community story with architectural and nature-led imagery.
4. Villa-type preview with comparison entry point.
5. Lifestyle and amenities preview.
6. Interactive master-plan invitation.
7. Gallery feature with selected imagery.
8. Location and connectivity summary.
9. Brochure and visit-booking conversion section.
10. Frequently asked questions.
11. Contact options and legal footer.

The sequence prioritizes understanding before lead capture. Sticky actions remain available, but interruptive lead pop-ups are excluded.

## 5. Core user journeys

### Journey A — Discover and understand the community

**Visitor:** First-time prospective resident  
**Entry:** Home page, search result, or shared link  
**Goal:** Decide whether the project deserves deeper exploration

1. See the project identity, place, and concise promise.
2. Review verified highlights and the community narrative.
3. Open Villas or Amenities based on interest.
4. Review the location summary and project credibility information.
5. Continue to a villa detail or schedule a visit.

**Success evidence:** Villa-detail visit, brochure view, location interaction, or visit intent.  
**Recovery:** If media is unavailable, preserve the narrative and actions with accessible placeholders.

### Journey B — Explore a villa type

**Visitor:** Buyer evaluating suitability  
**Entry:** Villas catalogue or direct villa link  
**Goal:** Understand space, features, and fit

1. Filter or scan villa cards by approved attributes.
2. Open a villa detail page.
3. Review gallery, facts, floor plans, specifications, and relevant amenities.
4. Add the villa to comparison or open another villa.
5. Ask a contextual question or schedule a visit.

**Success evidence:** Plan interaction, comparison selection, brochure download, or enquiry.  
**Recovery:** Clearly state when pricing, availability, or dimensions are awaiting confirmation.

### Journey C — Compare villa types

**Visitor:** Buyer choosing between suitable configurations  
**Entry:** Villas catalogue or villa detail  
**Goal:** Compare facts without promotional bias

1. Select two or more villa types, within an agreed maximum.
2. Open the comparison page.
3. Compare area, rooms, floors, features, plans, and approved availability fields.
4. Remove or replace a selection.
5. Continue to a villa detail or ask about the selected options.

**Success evidence:** Detail-page continuation, saved selection during the session, or qualified enquiry.  
**Recovery:** Explain unavailable attributes rather than displaying invented or inconsistent values.

### Journey D — Evaluate amenities and location

**Visitor:** Family or remote buyer assessing daily life  
**Entry:** Home, Amenities, or Location  
**Goal:** Understand lifestyle facilities and connectivity

1. Browse amenities grouped by lifestyle purpose.
2. Distinguish delivered, planned, and proposed facilities.
3. Open the master plan to understand placement.
4. Review verified landmarks and distance methodology.
5. Get directions or schedule an in-person visit.

**Success evidence:** Master-plan interaction, directions action, or visit booking.  
**Recovery:** Use source dates and qualification labels for incomplete construction or changing travel times.

### Journey E — Download the brochure

**Visitor:** Research-oriented buyer  
**Entry:** Any prominent brochure action  
**Goal:** Obtain the current approved project document

1. Open the brochure information page or download action.
2. See the document title, version, effective date, and file size.
3. Download without being forced to submit personal information.
4. Continue to Villas, Contact, or the concierge.

**Success evidence:** Successful download event.  
**Recovery:** If the document is superseded or unavailable, remove the download and provide a clear contact path.

### Journey F — Schedule a site visit

**Visitor:** High-intent prospective buyer  
**Entry:** Header, villa detail, location, or contact page  
**Goal:** Request a convenient visit

1. Open the visit form with the referring page recorded.
2. Enter the minimum required contact information.
3. Select a preferred date, time window, and optional villa interest.
4. Review privacy and consent wording.
5. Submit and receive an accessible confirmation with a reference identifier.

**Success evidence:** Valid request accepted and delivered to the approved recipient.  
**Recovery:** Preserve entered non-sensitive fields where safe, explain errors clearly, and expose call or message alternatives.

### Journey G — Make a direct enquiry

**Visitor:** Buyer with a specific question  
**Entry:** Contact action or contextual villa action  
**Goal:** Reach the correct project contact

1. Choose call, message, email, or callback.
2. See the intended recipient or department and operating hours.
3. Review any prefilled message before transmission.
4. Initiate contact through the selected channel.

**Success evidence:** Contact action initiated or callback request accepted.  
**Recovery:** Offer another approved channel when a contact route is unavailable.

### Journey H — Ask the property concierge

**Visitor:** Any visitor seeking guided discovery  
**Entry:** Global concierge launcher or contextual Ask action  
**Goal:** Receive an evidence-backed answer and relevant visual detail

1. Open the conversation with the current page or villa as optional context.
2. Ask a question or select a suggested prompt.
3. Receive a concise answer supported by approved sources.
4. View a deterministic preview such as a plan, image, map, comparison, document, or contact card.
5. Continue exploring, refine the question, or request human contact.

**Success evidence:** Supported answer, preview interaction, destination-page visit, or consented handoff.  
**Recovery:** State uncertainty, avoid unsupported claims, cite available sources, and offer an approved human contact.

## 6. Responsive behavior

| Area | Desktop and laptop | Tablet | Mobile |
| --- | --- | --- | --- |
| Header | Full primary navigation and visit action. | Condensed navigation where space requires. | Menu button plus compact high-intent actions. |
| Page navigation | Inline anchors or side index for long pages. | Compact horizontal or disclosure navigation. | Sticky section selector or accessible disclosures. |
| Villa catalogue | Multi-column cards with comparison controls. | Two-column or adaptive cards. | Single-column cards with thumb-reachable actions. |
| Floor and master plans | Large viewer with adjacent information. | Responsive viewer with collapsible information. | Pan and zoom area with separate accessible point list. |
| Comparison | Side-by-side table. | Horizontally contained comparison with fixed labels. | Attribute cards or controlled horizontal comparison. |
| Concierge | Conversation and preview displayed together. | Adjustable split or layered panel. | Conversation with a preview bottom sheet or full-screen detail. |
| Forms | Compact, logically grouped fields. | Single or two-column based on width. | Single column with appropriate input types and persistent validation summary. |

## 7. Global content and interaction rules

- Use one canonical route for each public content item.
- Preserve full functionality without hover interaction.
- Keep headings, breadcrumbs, and page titles consistent.
- Provide descriptive alternative text or mark decorative media correctly.
- Show delivered, planned, proposed, estimated, and unavailable states explicitly.
- Do not publish pricing, availability, dimensions, completion dates, legal claims, or contacts without an approved source.
- Do not require personal information merely to browse or download public material.
- Retain campaign parameters only where consent and privacy rules allow.
- Provide useful loading, empty, unavailable, validation, success, and error states.
- Keep the temporary development disclaimer visible in preview environments while unapproved reference material is displayed.

## 8. Analytics events

Use privacy-conscious events with no personal form values in event properties.

| Event | Trigger | Useful properties |
| --- | --- | --- |
| `villa_viewed` | Villa detail becomes the active page. | Villa ID, referrer category. |
| `villa_compared` | Visitor adds or removes a comparison selection. | Villa IDs, selection count, action. |
| `plan_interacted` | Visitor zooms, changes level, or opens a plan point. | Plan ID, interaction type. |
| `brochure_downloaded` | Current brochure download begins successfully. | Document ID and version. |
| `directions_opened` | Visitor opens approved directions. | Location ID. |
| `contact_initiated` | Call, message, or email action is intentionally selected. | Channel and context page. |
| `visit_requested` | Valid visit request is accepted. | Source page and villa ID when supplied. |
| `concierge_opened` | Concierge is opened. | Context page; no conversation text. |
| `preview_opened` | A structured concierge preview is displayed. | Preview type and content ID. |
| `human_handoff_requested` | Visitor approves a handoff request. | Department and channel. |

## 9. Content-to-route ownership

| Content group | Primary route | Reused by |
| --- | --- | --- |
| Project identity and verified highlights | Home | Metadata, footer, concierge. |
| Community narrative | Community | Home and concierge. |
| Villa records and plans | Villas and Villa Detail | Home, Compare, concierge. |
| Amenity records | Amenities | Home, Master Plan, concierge. |
| Media records | Gallery | Home, Community, Villas, Amenities, concierge previews. |
| Location and landmarks | Location | Home, Contact, concierge. |
| Specifications | Specifications | Villa Detail, FAQ, concierge. |
| Approved questions and answers | FAQ | Contextual help and concierge evaluation. |
| Contacts and operating rules | Contact | Forms, footer, contact cards, human handoff. |
| Legal and privacy records | Legal and Privacy | Forms, footer, assistant boundaries. |

## 10. Decisions and assumptions

- The public prototype begins in English; additional languages are introduced after approved translations exist.
- Pricing and live availability remain hidden until publication rules and authoritative data sources are confirmed.
- Schedule a Visit is the primary conversion action; Call and Message remain immediate alternatives.
- Visitors can download the public brochure without submitting a lead form.
- Native mobile applications remain outside the initial scope; responsive web and installable web behavior are sufficient.
- Temporary reference assets may appear only in development and private preview environments.

## 11. Acceptance evidence

T0005 is complete because this document defines:

- The primary, persistent, mobile, and footer navigation models.
- Public, detail, legal, and system routes.
- Homepage content priority.
- Eight end-to-end visitor journeys with success and recovery behavior.
- Responsive patterns for major experiences.
- Content accuracy, privacy, accessibility, and temporary-asset rules.
- Analytics events without personal-data capture.
- Content ownership across routes and future concierge previews.
