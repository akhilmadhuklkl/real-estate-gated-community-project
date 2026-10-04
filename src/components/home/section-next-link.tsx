import Link from "next/link";

export function SectionNextLink({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: string;
  inverse?: boolean;
}) {
  return (
    <Link
      className="section-next"
      data-inverse={inverse || undefined}
      href={href}
    >
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
