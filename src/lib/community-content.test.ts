import { describe, expect, it } from "vitest";

import { communityContent } from "./community-content";

describe("community content", () => {
  it("binds community claims to governed brochure records", () => {
    expect(communityContent.architect).toBe("Lijo. Reny. Architects");
    expect(communityContent.sharedLife).toHaveLength(5);
    expect(communityContent.security?.deliveryState).toBe("unknown");
  });
});
