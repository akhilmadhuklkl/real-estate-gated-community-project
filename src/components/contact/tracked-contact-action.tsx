"use client";

import type { MouseEvent, ReactNode } from "react";

type ContactAction = "brochure" | "call" | "email" | "whatsapp";

type TrackedContactActionProps = {
  action: ContactAction;
  children: ReactNode;
  className?: string;
  download?: string;
  href: string;
  label: string;
  target?: "_blank";
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, string>>;
  }
}

export function TrackedContactAction({
  action,
  children,
  className = "",
  download,
  href,
  label,
  target,
}: TrackedContactActionProps) {
  function track(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented) return;

    const detail = {
      event: "contact_action",
      action,
      label,
      location: "contact_action_panel",
    };

    window.dispatchEvent(new CustomEvent("glitz:contact-action", { detail }));
    window.dataLayer?.push(detail);
  }

  return (
    <a
      className={`contact-action-link ${className}`}
      href={href}
      download={download}
      target={target}
      rel={target ? "noreferrer" : undefined}
      onClick={track}
      data-contact-action={action}
    >
      {children}
    </a>
  );
}
