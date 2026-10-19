import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LEAD_DRAFT_STORAGE_KEY } from "../../lib/lead-qualification";

import { EnquiryForm } from "./enquiry-form";

describe("EnquiryForm assistant draft", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(cleanup);

  it("loads a validated draft but leaves identity, reply channel, and consent empty", async () => {
    sessionStorage.setItem(
      LEAD_DRAFT_STORAGE_KEY,
      JSON.stringify({
        intent: "site-visit",
        villaInterest: "Brochure villa plan",
        message: "Interested in a morning visit.",
        preferredDate: "2026-11-12",
        timeWindow: "morning",
      }),
    );
    render(<EnquiryForm />);

    expect(
      await screen.findByText(/reviewed assistant summary has been added/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred visit date *")).toHaveValue(
      "2026-11-12",
    );
    expect(screen.getByLabelText("Preferred time")).toHaveValue("morning");
    expect(screen.getByLabelText("Villa interest Optional")).toHaveValue(
      "Brochure villa plan",
    );
    expect(screen.getByLabelText("Visit notes Optional")).toHaveValue(
      "Interested in a morning visit.",
    );
    expect(screen.getByLabelText("Full name *")).toHaveValue("");
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(screen.getByLabelText("Phone number")).toHaveValue("");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    await waitFor(() =>
      expect(sessionStorage.getItem(LEAD_DRAFT_STORAGE_KEY)).toBeNull(),
    );
  });

  it("ignores a malformed browser-session draft", async () => {
    sessionStorage.setItem(LEAD_DRAFT_STORAGE_KEY, '{"intent":"callback"}');
    render(<EnquiryForm />);
    await waitFor(() =>
      expect(sessionStorage.getItem(LEAD_DRAFT_STORAGE_KEY)).toBeNull(),
    );
    expect(
      screen.queryByText(/reviewed assistant summary has been added/i),
    ).not.toBeInTheDocument();
  });
});
