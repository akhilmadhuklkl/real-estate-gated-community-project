"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="system-state">
      <div className="system-state__content">
        <p className="eyebrow">Something interrupted the view</p>
        <h1>Please try that again.</h1>
        <p>
          The page could not be prepared. Your enquiry information has not been
          submitted.
        </p>
        <button className="action-link" type="button" onClick={reset}>
          <span>Try again</span>
          <span className="action-link__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </main>
  );
}
