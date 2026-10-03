import Link from "next/link";
import type { ReactNode } from "react";

type ActionLinkProps = {
  children: ReactNode;
  href: string;
  inverse?: boolean;
  className?: string;
};

export function ActionLink({
  children,
  href,
  inverse = false,
  className = "",
}: ActionLinkProps) {
  return (
    <Link
      className={`action-link ${className}`}
      data-inverse={inverse || undefined}
      href={href}
    >
      <span>{children}</span>
      <span className="action-link__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
